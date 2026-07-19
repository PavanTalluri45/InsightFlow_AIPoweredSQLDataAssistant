import json
import logging
from typing import Any, Dict, List

from app.ai.gemini_service import generate_response
from app.ai.prompts.visualization_prompt import visualization_prompt

logger = logging.getLogger(__name__)

# The only intents Gemini is allowed to return. Kept here (not in
# intent_mapper.py) because this is where the AI response is
# validated - intent_mapper.py only maps already-trusted values.
ALLOWED_INTENTS = {
    "trend",
    "comparison",
    "composition",
    "distribution",
    "correlation",
    "single_value",
    "table",
}

# Returned whenever Gemini's response can't be trusted for any reason
# (bad JSON, missing fields, unknown intent, or an exception talking
# to Gemini at all). Deliberately conservative: no visualization.
_FALLBACK_RESULT: Dict[str, Any] = {
    "required": False,
    "intent": "table",
    "reason": "Visualization could not be determined; defaulting to a table view.",
}


def _strip_markdown_fences(text: str) -> str:
    """
    Remove ```json / ``` fences Gemini occasionally adds despite being
    told not to. Mirrors the defensive parsing already used for SQL
    generation elsewhere in this pipeline.
    """
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
    return cleaned.strip()


def _parse_intent_json(raw_text: str) -> Dict[str, Any]:
    """
    Parse Gemini's raw text response into a dict.

    Raises:
        ValueError: if the text is not valid JSON.
    """
    cleaned = _strip_markdown_fences(raw_text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini did not return valid JSON: {e}") from e


def _validate_intent_result(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate the parsed JSON has the required shape and an allowed
    intent, and return a normalized dict with exactly the three
    expected keys.

    Raises:
        ValueError: if a required field is missing or malformed, or
            the intent is not one of the allowed values.
    """
    if "required" not in data or not isinstance(data["required"], bool):
        raise ValueError("Missing or invalid 'required' field.")

    if "intent" not in data or data["intent"] not in ALLOWED_INTENTS:
        raise ValueError(f"Missing or invalid 'intent' field: {data.get('intent')!r}")

    return {
        "required": data["required"],
        "intent": data["intent"],
        "reason": data.get("reason", ""),
    }


def select_visualization(question: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ask Gemini to classify the visualization intent for a question's
    SQL result.

    This function never raises. Any failure - Gemini being
    unreachable, returning malformed JSON, missing fields, or an
    intent outside the allowed set - is caught and converted into the
    safe fallback result, so a visualization hiccup never breaks the
    rest of the chat pipeline.

    Args:
        question: The original natural language question.
        rows: The rows returned by the SQL Executor (list of dicts).
              An empty list short-circuits straight to the fallback,
              since there is nothing to visualize.

    Returns:
        dict: {"required": bool, "intent": str, "reason": str}
    """
    if not rows:
        return {
            "required": False,
            "intent": "table",
            "reason": "No rows were returned, so there is nothing to visualize.",
        }

    formatted_data = json.dumps(rows, indent=2, default=str)

    formatted_prompt = visualization_prompt.invoke(
        {
            "question": question,
            "data": formatted_data,
        }
    )
    prompt_text = formatted_prompt.messages[0].content

    try:
        raw_response = generate_response(prompt_text)
        parsed = _parse_intent_json(raw_response)
        return _validate_intent_result(parsed)
    except Exception as e:
        logger.warning("Visualization intent selection failed, defaulting to table: %s", e)
        return dict(_FALLBACK_RESULT)