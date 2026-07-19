import logging

from fastapi import APIRouter, HTTPException

from schemas import ChatRequest, ChatResponse, HealthResponse
from app.services.chat_service import process_question

logger = logging.getLogger(__name__)

router = APIRouter()


# -----------------------------------------
# Root Endpoint
# -----------------------------------------

@router.get("/")
async def root():
    return {
        "message": "AI SQL Data Assistant API",
        "status": "running",
        "version": "1.0.0",
    }


# -----------------------------------------
# Health Endpoint
# -----------------------------------------

@router.get(
    "/health",
    response_model=HealthResponse,
)
async def health():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        database=True,
        gemini=True,
    )


# -----------------------------------------
# Chat Endpoint
# -----------------------------------------

@router.post(
    "/chat",
    response_model=ChatResponse,
)
def chat(request: ChatRequest):
    try:
        logger.info("Question: %s", request.question)

        return process_question(request.question)

    except Exception as e:
        logger.exception("Chat Endpoint Error")
        raise HTTPException(status_code=500, detail=str(e))