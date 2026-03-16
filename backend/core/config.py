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
    # openrouter/free = OpenRouter's free-only router. It randomly picks from
    # all available free models and filters by capability. If it fails, we
    # fall back to specific named free models ordered by quality.
    #
    # List updated March 2026 from https://openrouter.ai/collections/free-models
    # Only includes models with Tool calling support (needed for structured output).
    FREE_MODELS = [
        "openrouter/free",                                    # Auto-router: picks best available free model
        "meta-llama/llama-3.3-70b-instruct:free",            # 128K ctx, tools — best general purpose
        "mistralai/mistral-small-3.1-24b-instruct:free",     # 128K ctx, vision+tools — very reliable
        "google/gemma-3-27b-it:free",                        # 131K ctx, vision+tools
        "nvidia/nemotron-3-super-120b-a12b:free",            # 262K ctx, tools+reasoning — powerful
        "qwen/qwen3-coder:free",                             # 262K ctx, tools — great for structured output
        "openai/gpt-oss-120b:free",                          # 131K ctx, tools
        "nvidia/nemotron-nano-9b-v2:free",                   # 128K ctx, tools — fast lightweight
        "google/gemma-3-12b-it:free",                        # 33K ctx, vision
        "qwen/qwen3-4b:free",                                # 41K ctx, tools — last resort
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
        "not a valid model", "invalid model",
        "insufficient credits", "never purchased",
        "payment required", "billing",
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