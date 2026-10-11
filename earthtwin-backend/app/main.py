"""
EarthTwin — AI Digital Twin for Outdoor Ecosystems
Main FastAPI Application Entry Point
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

from app.config import settings
from app.routes import (
    environment,
    ecosystems,
    risks,
    simulation,
    alerts,
    recommendations,
    assistant
)

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("earthtwin.main")

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------
# Allows React frontend (e.g., http://localhost:5173 or http://localhost:3000)
# to make cross-origin requests safely.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global Exception Handlers
# ---------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats validation errors into friendly clean responses for React."""
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        errors.append({
            "field": field,
            "message": err.get("msg"),
            "type": err.get("type")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "One or more request parameters failed validation limits.",
            "details": errors
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Shields database credentials and internal details from leaking."""
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing the ecosystem request."
        }
    )


# ---------------------------------------------------------------------------
# Health Check & Root Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["System Health"])
async def health_check():
    """
    Standard Health Check Endpoint.
    Returns backend status, service name, version, and Supabase connectivity status.
    """
    return {
        "status": "online",
        "service": "EarthTwin Backend",
        "version": settings.VERSION,
        "mode": "Supabase PostgreSQL" if settings.SUPABASE_CONNECTED else "In-Memory Realistic Mock Mode"
    }


@app.get("/", tags=["System Health"])
async def root():
    """Welcome route directing users to documentation and API endpoints."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json"
        },
        "endpoints": {
            "health": "/api/health",
            "ecosystems": "/api/ecosystems",
            "environment": "/api/environment/{ecosystem_id}",
            "health_score": "/api/health/{ecosystem_id}",
            "risks": "/api/risks/{ecosystem_id}",
            "simulation": "/api/simulation/run",
            "alerts": "/api/alerts/{ecosystem_id}",
            "recommendations": "/api/recommendations/{ecosystem_id}",
            "assistant": "/api/assistant/ask"
        }
    }


# ---------------------------------------------------------------------------
# Include Modular API Routers
# ---------------------------------------------------------------------------
app.include_router(ecosystems.router)
app.include_router(environment.router)
app.include_router(risks.router)
app.include_router(simulation.router)
app.include_router(alerts.router)
app.include_router(recommendations.router)
app.include_router(assistant.router)


@app.on_event("startup")
async def startup_event():
    logger.info("🌲 EarthTwin Backend initialized successfully.")
    logger.info(f"🚀 Running in {'LIVE SUPABASE' if settings.SUPABASE_CONNECTED else 'STANDALONE MOCK'} mode.")
