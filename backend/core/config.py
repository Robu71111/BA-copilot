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

    # openrouter/auto routes to whichever free model is available + not rate-limited
    # Fallback list tried in order if auto also fails
    FREE_MODELS = [
        "openrouter/auto",
        "openrouter/free"
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "google/gemma-3-12b-it:free",
        "mistralai/mistral-7b-instruct:free",
        "qwen/qwen3-8b:free",
        "microsoft/mai-ds-r1:free",
    ]
    CHAT_MODEL = FREE_MODELS[0]

    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

    GENERATION_CONFIG = {
        "temperature": 0.5,
        "max_tokens": 4096,
        "top_p": 0.85,
    }

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