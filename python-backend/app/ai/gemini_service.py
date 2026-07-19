import os
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Read API Key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

# Create Gemini Client
client = genai.Client(api_key=api_key)


def generate_response(prompt: str) -> str:
    """
    Sends a prompt to Gemini and returns the generated text.

    Args:
        prompt (str): Prompt sent to Gemini.

    Returns:
        str: Gemini response.
    """

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text