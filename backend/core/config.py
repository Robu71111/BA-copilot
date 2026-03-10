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

    # Broad fallback list — tried in sequence until one succeeds
    # openrouter/auto is first; if it also rate-limits we try individual models
    FREE_MODELS = [
        "openrouter/auto",
        "openrouter/free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "google/gemma-3-27b-it:free",
        "google/gemma-3-12b-it:free",
        "mistralai/mistral-7b-instruct:free",
        "qwen/qwen3-8b:free",
        "qwen/qwen3-14b:free",
        "microsoft/mai-ds-r1:free",
        "nousresearch/deephermes-3-llama-3-8b:free",
        "tngtech/deepseek-r1t-chimera:free",
    ]
    CHAT_MODEL = FREE_MODELS[0]
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
    GENERATION_CONFIG = {"temperature": 0.5, "max_tokens": 4096, "top_p": 0.85}

    # Strings in response body that indicate we should skip to next model
    RATE_LIMIT_SIGNALS = [
        "rate limit", "ratelimit", "rate_limit",
        "free tier", "free-tier", "quota",
        "too many requests", "context limit exceeded",
        "provider error", "no endpoints",
        "overloaded", "capacity",
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
    def is_rate_limit_error(response_text: str) -> bool:
        """Check if response body contains any rate-limit signal."""
        lower = response_text.lower()
        return any(sig in lower for sig in APIConfig.RATE_LIMIT_SIGNALS)

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