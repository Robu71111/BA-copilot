"""
Backend Configuration
=====================
Configuration settings for FastAPI backend and OpenRouter API.
Updated to use FREE models only - $0 budget!
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from root .env file
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class Settings:
    """Application settings"""
    PROJECT_NAME = "BA Copilot"
    VERSION = "2.0.0 (Free Edition)"
    API_PREFIX = "/api"


class APIConfig:
    """API keys and external service configuration"""
    
    # ========================================
    # 🔑 OPENROUTER API KEY (REQUIRED)
    # ========================================
    # Single API key for all text generation:
    # - Requirements extraction
    # - User story generation
    # - Acceptance criteria generation
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
    
    # ========================================
    # 🤖 FREE MODEL CONFIGURATION
    # ========================================
    # Audio transcription: Using browser Web Speech API (FREE, client-side)
    # No backend model needed!
    
    # Chat/text generation: FREE OpenRouter models
    # Top recommendations (all FREE with :free suffix):
    
    # Option 1: Google Gemini Flash (Best for structured outputs)
    #CHAT_MODEL = "google/gemma-3-12b-it:free"
    
    # Option 2: DeepSeek V3 (Excellent for coding/requirements)
    # CHAT_MODEL = "deepseek/deepseek-chat-v3-0324:free"
    
    # Option 3: Llama 3.3 70B (Great general purpose)
    CHAT_MODEL = "openrouter/auto"
    
    #CHAT_MODEL = "liquid/lfm-2.5-1.2b-thinking:free"

    # Option 4: Mistral 7B (Fast and efficient)
    # CHAT_MODEL = "mistralai/mistral-7b-instruct:free"
    
    # Option 5: Better Model TNG: DeepSeek R1T Chimera (free)
    #CHAT_MODEL = "tngtech/deepseek-r1t-chimera:free"
    
    # ========================================
    # 🌐 OPENROUTER CONFIGURATION
    # ========================================
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
    
    # Generation parameters for chat models
    GENERATION_CONFIG = {
        "temperature": 0.5,
        "max_tokens": 4096,
        "top_p": 0.85,
    }
    
    # Request headers
    @staticmethod
    def get_headers():
        """Get OpenRouter API headers"""
        return {
            "Authorization": f"Bearer {APIConfig.OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://ba-copilot.vercel.app",
            "X-Title": "BA Copilot MVP (Free Edition)",
            "Content-Type": "application/json",
        }
    
    # ========================================
    # DATABASE CONFIGURATION
    # ========================================
    DATABASE_PATH = os.getenv('DATABASE_PATH', "database/ba_copilot.db")
    
    # ========================================
    # VALIDATION METHODS
    # ========================================
    @staticmethod
    def validate_openrouter_api():
        """Check if OpenRouter API key is configured"""
        if not APIConfig.OPENROUTER_API_KEY:
            return False, "⚠️ OpenRouter API key not configured"
        if not APIConfig.OPENROUTER_API_KEY.startswith('sk-or-'):
            return False, "⚠️ Invalid OpenRouter API key format (should start with 'sk-or-')"
        return True, "✅ OpenRouter API configured (FREE models)"
    
    @staticmethod
    def get_status():
        """Get configuration status"""
        api_status = APIConfig.validate_openrouter_api()
        
        return {
            "status": "connected" if api_status[0] else "error",
            "openrouter": api_status,
            "audio_method": "Browser Web Speech API (client-side, FREE)",
            "chat_model": f"{APIConfig.CHAT_MODEL} (FREE)",
            "cost": "$0.00 - Completely FREE!"
        }


# Initialize settings
settings = Settings()