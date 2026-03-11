import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class Settings:
    PROJECT_NAME = "BA Copilot"
    VERSION = "2.0.0"
    API_PREFIX = "/api"


class APIConfig:
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

    # ── MODEL CONFIGURATION ───────────────────────────────────────────────────
    # openrouter/free = OpenRouter's dynamic router — picks the best available
    # free model automatically. Much more reliable than hardcoding specific models
    # that can go offline. Falls back to named models only if the router fails.
    FREE_MODELS = [
        "openrouter/auto:free",  # Primary: dynamic best-available
        "openrouter/free",       # Fallback 1: dynamic best-available (legacy name)
        "openrouter/gpt-4o:free",  # Fallback 2: most capable free model
        "meta-llama/llama-3.3-70b-instruct:free",  # Fallback 1: most capable free
        "deepseek/deepseek-chat-v3-0324:free",      # Fallback 2: strong reasoning
        "google/gemma-3-27b-it:free",               # Fallback 3: reliable
        "google/gemma-3-12b-it:free",               # Fallback 4
        "mistralai/mistral-7b-instruct:free",       # Fallback 5: fast and stable
        "meta-llama/llama-3.1-8b-instruct:free",   # Fallback 6: lightweight
    ]

    CHAT_MODEL = FREE_MODELS[0]
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
    GENERATION_CONFIG = {"temperature": 0.4, "max_tokens": 4096, "top_p": 0.9}

    # Any of these in the response body/error = skip this model immediately
    SKIP_SIGNALS = [
        "rate limit", "ratelimit", "rate_limit",
        "free tier", "free-tier", "quota exceeded",
        "too many requests", "context limit exceeded",
        "provider error", "no endpoints",
        "no endpoints found", "model not found",
        "overloaded", "capacity", "unavailable",
        "not found", "does not exist", "deprecated",
        "maintenance", "timeout", "service unavailable",
    ]

    @staticmethod
    def get_headers():
        return {
            "Authorization": f"Bearer {APIConfig.OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://ba-copilot-mvp.vercel.app",
            "X-Title": "BA Copilot",
            "Content-Type": "application/json",
        }

    DATABASE_PATH = os.getenv('DATABASE_PATH', "database/ba_copilot.db")

    @staticmethod
    def should_skip(text: str) -> bool:
        """Return True if this response/error means we should try next model."""
        if not text:
            return False
        lower = text.lower()
        return any(sig in lower for sig in APIConfig.SKIP_SIGNALS)

    # Keep old name as alias so existing code doesn't break
    @staticmethod
    def is_rate_limit_error(text: str) -> bool:
        return APIConfig.should_skip(text)

    @staticmethod
    def validate_openrouter_api():
        if not APIConfig.OPENROUTER_API_KEY:
            return False, "OpenRouter API key not configured"
        if not APIConfig.OPENROUTER_API_KEY.startswith('sk-or-'):
            return False, "Invalid OpenRouter API key format"
        return True, "OpenRouter API configured"

    @staticmethod
    def get_status():
        api_status = APIConfig.validate_openrouter_api()
        return {
            "status": "connected" if api_status[0] else "error",
            "openrouter": api_status,
            "audio_method": "Browser Web Speech API (client-side, FREE)",
            "chat_model": APIConfig.CHAT_MODEL,
            "cost": "$0.00"
        }


settings = Settings()