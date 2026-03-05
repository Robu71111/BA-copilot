"""
BA Copilot - FastAPI Backend
=============================
Main application entry point for the FastAPI backend.
Updated to use FREE OpenRouter models - $0 budget!
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.api.routes import projects, requirements, stories, criteria
from backend.core.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="BA Copilot API",
    description="AI-powered assistant for Business Analysts (100% FREE Edition)",
    version="2.0.0 FREE"
)

# CORS configuration - Allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# HEALTH CHECK ENDPOINTS
# ========================================

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "BA Copilot API",
        "version": "2.0.0 FREE",
        "status": "running",
        "ai_provider": "OpenRouter (FREE Models)",
        "cost": "$0.00",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "BA Copilot API is running (100% FREE)",
        "ai_provider": "OpenRouter FREE tier",
        "cost": "$0.00"
    }


@app.get("/api/health/apis")
async def check_apis():
    """Check status of OpenRouter API configuration"""
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

# ========================================
# INCLUDE ROUTERS
# ========================================

# Project management routes
app.include_router(
    projects.router,
    prefix="/api/projects",
    tags=["projects"]
)

# Input handling routes
from backend.api.routes import input as input_routes
app.include_router(
    input_routes.router,
    prefix="/api/input",
    tags=["input"]
)

# Requirements extraction routes
app.include_router(
    requirements.router,
    prefix="/api/requirements",
    tags=["requirements"]
)

# User stories generation routes
app.include_router(
    stories.router,
    prefix="/api/stories",
    tags=["stories"]
)

# Acceptance criteria generation routes
app.include_router(
    criteria.router,
    prefix="/api/criteria",
    tags=["criteria"]
)

# Audio routes
from backend.api.routes import audio
app.include_router(
    audio.router,
    prefix="/api/audio",
    tags=["audio"]
)

# ========================================
# ERROR HANDLERS
# ========================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )


# ========================================
# STARTUP EVENT
# ========================================

@app.on_event("startup")
async def startup_event():
    """Initialize database and check API keys on startup"""
    print("=" * 60)
    print(">>> BA Copilot API starting (FREE Edition)...")
    print("=" * 60)
    
    # Initialize database
    from backend.core.database import db
    print("[✅] Database initialized")
    
    # Check API configuration
    from backend.core.config import APIConfig
    status = APIConfig.get_status()
    
    # Check OpenRouter API
    if status["openrouter"][0]:
        print("[✅] OpenRouter API configured (FREE tier)")
        print(f"    💰 Cost: {status.get('cost', '$0.00')}")
        print(f"    🎤 Audio: {status.get('audio_method', 'Browser Web Speech API')}")
        print(f"    🤖 Model: {status.get('chat_model', 'Not set')}")
    else:
        print("[⚠️ ] OpenRouter API not configured")
        print("    Please add OPENROUTER_API_KEY to your .env file")
        print("    Get FREE key at: https://openrouter.ai/keys")
    
    print("=" * 60)
    if status["status"] == "connected":
        print(">>> BA Copilot API ready! ✅")
        print(">>> Running on 100% FREE models - $0.00 cost! 💰")
    else:
        print(">>> BA Copilot API started with warnings ⚠️")
        print("    Add your FREE OpenRouter API key to enable AI features")
    print("=" * 60)