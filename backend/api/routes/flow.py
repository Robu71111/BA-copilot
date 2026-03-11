"""
Process Flow Diagram Route
POST /api/flow/generate  →  { mermaid_code: str }
"""
import sys
import time
import requests
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
from backend.core.config import APIConfig
from utils.prompts import PromptTemplates

router = APIRouter()


class FlowRequest(BaseModel):
    stories_text: str
    project_name: str = "System"


def _clean_mermaid(raw: str) -> str:
    """Strip markdown fences, ensure flowchart TD header."""
    text = raw.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        inner = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(inner).strip()
    if not text.startswith("flowchart"):
        for line in text.split("\n"):
            if line.strip().startswith("flowchart"):
                text = text[text.find(line.strip()):].strip()
                break
        else:
            text = "flowchart TD\n" + text
    return text


@router.post("/generate")
async def generate_flow(req: FlowRequest):
    if not APIConfig.OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured.")
    if not req.stories_text or len(req.stories_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Stories text too short.")

    prompt = PromptTemplates.process_flow_diagram(req.stories_text, req.project_name)
    last_error = "No models available"

    for model in APIConfig.FREE_MODELS:
        try:
            print(f"[flow] Trying: {model}")
            response = requests.post(
                f"{APIConfig.OPENROUTER_BASE_URL}/chat/completions",
                headers=APIConfig.get_headers(),
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 1500,
                    "top_p": 0.9,
                },
                timeout=90,
            )
            if response.status_code != 200:
                last_error = f"HTTP {response.status_code}: {response.text[:200]}"
                print(f"[flow] {last_error} — skipping {model}")
                time.sleep(0.5); continue

            body = response.text
            if APIConfig.should_skip(body):
                print(f"[flow] Skip signal on {model}"); time.sleep(0.5); continue

            data = response.json()
            if "error" in data:
                last_error = str(data["error"])[:150]
                print(f"[flow] Error on {model}: {last_error}"); time.sleep(0.5); continue

            choices = data.get("choices", [])
            if not choices: last_error = "Empty choices"; continue

            content = choices[0].get("message", {}).get("content", "")
            if not content or APIConfig.should_skip(content):
                last_error = "Bad content"; continue

            mermaid_code = _clean_mermaid(content)
            if "flowchart" not in mermaid_code or "-->" not in mermaid_code:
                last_error = f"Invalid Mermaid from {model}"; print(f"[flow] {last_error}"); continue

            print(f"[flow] Success {model} — {len(mermaid_code)} chars")
            return {"mermaid_code": mermaid_code, "model_used": model}

        except Exception as exc:
            last_error = str(exc)[:200]
            print(f"[flow] Exception on {model}: {last_error}"); time.sleep(0.3); continue

    raise HTTPException(status_code=503,
        detail=f"All models failed. Last error: {last_error}")