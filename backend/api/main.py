"""
BA Copilot - FastAPI Backend v3
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.api.routes import projects, requirements, stories, criteria
from backend.core.config import settings

app = FastAPI(
    title="BA Copilot API",
    description="AI-powered Business Analysis platform",
    version="3.0.0"
)

# CORS — allow your Vercel frontend + localhost for development
allowed_origins = [
    "https://ba-copilot-mvp.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
]

# Also allow any *.vercel.app preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://ba-copilot-mvp\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"name": "BA Copilot API", "version": "3.0.0", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "BA Copilot API is running"}

@app.get("/api/health/apis")
async def check_apis():
    from backend.core.config import APIConfig
    status = APIConfig.get_status()
    return {
        "status": status["status"],
        "provider": "OpenRouter",
        "api_configured": status["openrouter"][0],
        "audio_method": status.get("audio_method", "Browser Web Speech API"),
        "chat_model": status.get("chat_model", "Not configured"),
        "cost": status.get("cost", "$0.00"),
        "message": status["openrouter"][1]
    }

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(projects.router,      prefix="/api/projects",      tags=["projects"])
app.include_router(requirements.router,  prefix="/api/requirements",  tags=["requirements"])
app.include_router(stories.router,       prefix="/api/stories",       tags=["stories"])
app.include_router(criteria.router,      prefix="/api/criteria",      tags=["criteria"])

from backend.api.routes import input as input_routes
app.include_router(input_routes.router,  prefix="/api/input",         tags=["input"])

from backend.api.routes import audio
app.include_router(audio.router,         prefix="/api/audio",         tags=["audio"])

# ── Process Flow Diagram ──────────────────────────────────────────────────
from backend.api.routes import flow
app.include_router(flow.router,          prefix="/api/flow",          tags=["flow"])

# ── Error handlers ─────────────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(exc)}"})

@app.on_event("startup")
async def startup_event():
    print("=" * 60)
    print(">>> BA Copilot API v3 starting...")
    print("=" * 60)
    from backend.core.database import db
    print("[OK] Database initialised")
    from backend.core.config import APIConfig
    status = APIConfig.get_status()
    if status["openrouter"][0]:
        print(f"[OK] OpenRouter configured — model: {status.get('chat_model')}")
    else:
        print("[!!] OpenRouter API key missing")
    print("=" * 60)