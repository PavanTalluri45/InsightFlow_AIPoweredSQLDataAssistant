import json
import logging
from typing import Any, Dict, List

from app.ai.gemini_service import generate_response
from app.ai.prompts.visualization_prompt import visualization_prompt

logger = logging.getLogger(__name__)

# The only goals Gemini is allowed to return.
ALLOWED_GOALS = {
    "LIST_RECORDS",
    "COMPARE_VALUES",
    "SHOW_TREND",
    "SHOW_TIME_SERIES",
    "SHOW_COMPOSITION",
    "SHOW_DISTRIBUTION",
    "SHOW_RELATIONSHIP",
    "SHOW_SINGLE_VALUE",
    "SHOW_RANKING",
    "SHOW_TOP_N",
    "SHOW_BOTTOM_N",
    "UNKNOWN",
}

# Fallback when Gemini output is invalid or unreachable
_FALLBACK_RESULT: Dict[str, Any] = {
    "goal": "UNKNOWN",
    "reason": "Analytical goal could not be determined; fallback applied.",
}


def _strip_markdown_fences(text: str) -> str:
    """Remove ```json / ``` fences Gemini occasionally adds."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
    return cleaned.strip()


def _parse_goal_json(raw_text: str) -> Dict[str, Any]:
    """Parse Gemini's raw text response into a dict."""
    cleaned = _strip_markdown_fences(raw_text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini did not return valid JSON: {e}") from e


def _validate_goal_result(data: Any) -> Dict[str, Any]:
    """
    Validate that parsed JSON has a valid 'goal' field from ALLOWED_GOALS.
    Handles case where Gemini returns a string or non-dict object.
    """
    if isinstance(data, str):
        goal_candidate = data.strip().upper()
        if goal_candidate in ALLOWED_GOALS:
            return {"goal": goal_candidate, "reason": "Analytical goal classified by AI."}
        raise ValueError(f"String output is not an allowed goal: {data!r}")

    if not isinstance(data, dict):
        raise ValueError(f"Parsed JSON is not a dictionary: {data!r}")

    goal = data.get("goal")
    if not goal or goal not in ALLOWED_GOALS:
        raise ValueError(f"Missing or invalid 'goal' field: {goal!r}")

    return {
        "goal": goal,
        "reason": data.get("reason", ""),
    }


def select_visualization(question: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ask Gemini to classify the analytical goal for a user's question and SQL result.

    Returns:
        dict: {"goal": str, "reason": str}
    """
    if not rows:
        return {
            "goal": "LIST_RECORDS",
            "reason": "No rows were returned, default to tabular record view.",
        }

    formatted_data = json.dumps(rows[:10], indent=2, default=str)  # Send up to 10 sample rows for efficiency

    formatted_prompt = visualization_prompt.invoke(
        {
            "question": question,
            "data": formatted_data,
        }
    )
    prompt_text = formatted_prompt.messages[0].content

    try:
        raw_response = generate_response(prompt_text)
        parsed = _parse_goal_json(raw_response)
        return _validate_goal_result(parsed)
    except Exception as e:
        logger.warning("Analytical goal selection failed, defaulting to UNKNOWN: %s", e)
        return dict(_FALLBACK_RESULT)