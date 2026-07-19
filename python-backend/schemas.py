from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming chat request."""

    question: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Natural-language question about the retail_sales data",
    )


class ChatResponse(BaseModel):
    """
    Chatbot response.

    Mirrors app.response.response_builder.BackendResponse field-for-field.
    This is the single API contract every caller (terminal, FastAPI,
    future WebSocket, Next.js) receives — do not add, rename, or drop
    fields here without updating response_builder.py to match, since
    routes.py returns process_question()'s dict straight through with
    no reshaping.
    """

    success: bool
    question: str
    sql: Optional[str] = None
    execution_time: float
    row_count: int
    data: Optional[List[Dict[str, Any]]] = None
    answer: Optional[str] = None
    visualization: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    version: str
    database: bool
    gemini: bool