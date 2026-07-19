from app.ai.prompts.sql_prompt import sql_prompt
from app.ai.gemini_service import generate_response


def generate_sql(question: str, schema: str) -> str:
    """
    Generate a PostgreSQL SQL query from a natural language question.

    Args:
        question (str): User's question.
        schema (str): Database schema.

    Returns:
        str: Generated SQL query.
    """

    # Build LangChain prompt
    formatted_prompt = sql_prompt.invoke(
        {
            "schema": schema,
            "question": question,
        }
    )

    # Convert LangChain prompt to plain text
    prompt = formatted_prompt.messages[0].content

    # Send prompt to Gemini
    generated_sql = generate_response(prompt)

    return generated_sql.strip()