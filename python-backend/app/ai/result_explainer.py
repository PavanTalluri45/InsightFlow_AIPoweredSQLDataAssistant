import json
from typing import Any, Dict, List

from app.ai.gemini_service import generate_response
from app.ai.prompts.result_explainer_prompt import result_explainer_prompt


def explain_results(question: str, rows: List[Dict[str, Any]]) -> str:
    """
    Turn database rows into a plain-language business explanation.

    Args:
        question: The original natural language question the user asked.
        rows: The rows returned by the SQL Executor (list of dicts).
              An empty list is valid and means "no matching records."

    Returns:
        str: A concise (3-6 sentence) business explanation of the data.
    """

    # Convert rows to formatted JSON for the prompt. default=str
    # handles values the Postgres driver may return that json can't
    # natively serialize (e.g. Decimal, date, datetime).
    formatted_data = json.dumps(rows, indent=2, default=str)

    # Build LangChain prompt
    formatted_prompt = result_explainer_prompt.invoke(
        {
            "question": question,
            "data": formatted_data,
        }
    )

    # Convert LangChain prompt to plain text
    prompt_text = formatted_prompt.messages[0].content

    # Send prompt to the existing Gemini service
    explanation = generate_response(prompt_text)

    return explanation.strip()