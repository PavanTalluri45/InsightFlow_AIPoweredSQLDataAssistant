import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import router

# --------------------------------------------------
# Logging
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)

# --------------------------------------------------
# Create FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="AI SQL Data Assistant API",
    description="AI SQL Data Assistant using LangChain, LLM (Google Gemini) and Supabase PostgreSQL.",
    version="1.0.0",
)

# --------------------------------------------------
# Enable CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Register Routes
# --------------------------------------------------

app.include_router(router)

# --------------------------------------------------
# Startup Event
# --------------------------------------------------

@app.on_event("startup")
async def startup():
    logger.info("=" * 60)
    logger.info("AI SQL Data Assistant API Started")
    logger.info("FastAPI Ready")
    logger.info("Routes Loaded")
    logger.info("=" * 60)

# --------------------------------------------------
# Shutdown Event
# --------------------------------------------------

@app.on_event("shutdown")
async def shutdown():
    logger.info("FastAPI Server Stopped")