"""
Requirements Extractor — robust multi-model fallback with async HTTP.
"""
import httpx
import asyncio
from backend.core.config import APIConfig
from utils.prompts import PromptTemplates
import re


class RequirementsExtractor:
    def __init__(self):
        self.api_configured = bool(APIConfig.OPENROUTER_API_KEY)

    async def _call_model(self, client, model, prompt):
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            **APIConfig.GENERATION_CONFIG
        }
        return await client.post(
            f"{APIConfig.OPENROUTER_BASE_URL}/chat/completions",
            headers=APIConfig.get_headers(),
            json=payload,
            timeout=120
        )

    async def extract(self, raw_text, project_type="General", industry="General"):
        if not self.api_configured:
            raise Exception("OpenRouter API key not configured.")

        prompt = PromptTemplates.requirements_extractor(raw_text, project_type, industry)
        last_error = "Unknown error"

        async with httpx.AsyncClient() as client:
            for model in APIConfig.FREE_MODELS:
                try:
                    print(f"Trying model: {model}")
                    response = await self._call_model(client, model, prompt)
                    body = response.text

                    if response.status_code in (429, 404, 503):
                        print(f"HTTP {response.status_code} on {model}, trying next...")
                        await asyncio.sleep(1)
                        continue

                    if APIConfig.is_rate_limit_error(body):
                        print(f"Body rate-limit signal on {model}: {body[:120]}")
                        await asyncio.sleep(1)
                        continue

                    if response.status_code != 200:
                        last_error = f"HTTP {response.status_code}: {body[:200]}"
                        print(f"Error on {model}: {last_error}")
                        continue

                    data = response.json()

                    if 'error' in data:
                        err_msg = str(data['error'])
                        if APIConfig.is_rate_limit_error(err_msg):
                            print(f"Error-object rate-limit on {model}, skipping...")
                            continue
                        last_error = err_msg
                        continue

                    if not data.get('choices'):
                        last_error = "Empty choices in response"
                        continue

                    content = data['choices'][0]['message']['content']

                    if APIConfig.is_rate_limit_error(content):
                        print(f"Content rate-limit signal on {model}, skipping...")
                        continue

                    result = self._parse_requirements(content)
                    if result['total_count'] > 0:
                        print(f"Success with {model} — {result['total_count']} requirements")
                        return result

                    last_error = "No requirements parsed from response"
                    print(f"Parse empty on {model}, trying next...")
                    continue

                except httpx.TimeoutException:
                    last_error = "Request timed out"
                    print(f"Timeout on {model}")
                    continue
                except Exception as e:
                    last_error = str(e)
                    print(f"Exception on {model}: {e}")
                    continue

        raise Exception(
            f"All {len(APIConfig.FREE_MODELS)} models tried without success. "
            f"Last error: {last_error}. "
            f"Please try again in 1-2 minutes."
        )

    def _parse_requirements(self, text):
        functional, non_functional = [], []

        fr_pattern = re.compile(r'FR-\d+[:\s]+(.+)', re.IGNORECASE)
        nfr_pattern = re.compile(r'NFR-\d+[:\s]+(.+)', re.IGNORECASE)

        for m in fr_pattern.finditer(text):
            desc = m.group(1).strip().rstrip('.,;')
            if len(desc) > 10:
                functional.append({'req_code': f'FR-{len(functional)+1:03d}', 'req_type': 'Functional', 'description': desc})

        for m in nfr_pattern.finditer(text):
            desc = m.group(1).strip().rstrip('.,;')
            if len(desc) > 10:
                non_functional.append({'req_code': f'NFR-{len(non_functional)+1:03d}', 'req_type': 'Non-Functional', 'description': desc})

        if not functional and not non_functional:
            return self._alternative_parse(text)

        return {'functional': functional, 'non_functional': non_functional, 'total_count': len(functional) + len(non_functional)}

    def _alternative_parse(self, text):
        functional, non_functional = [], []
        in_func = False
        in_nfunc = False

        for line in text.split('\n'):
            line = line.strip()
            if 'functional requirement' in line.lower() and 'non' not in line.lower():
                in_func = True; in_nfunc = False; continue
            elif 'non-functional' in line.lower():
                in_func = False; in_nfunc = True; continue
            elif line.startswith('##'):
                in_func = False; in_nfunc = False; continue

            if line and len(line) > 20 and line[0] in '-*•':
                desc = line.lstrip('-*• ').strip()
                if in_func:
                    functional.append({'req_code': f'FR-{len(functional)+1:03d}', 'req_type': 'Functional', 'description': desc})
                elif in_nfunc:
                    non_functional.append({'req_code': f'NFR-{len(non_functional)+1:03d}', 'req_type': 'Non-Functional', 'description': desc})

        return {'functional': functional, 'non_functional': non_functional, 'total_count': len(functional) + len(non_functional)}

    def is_configured(self):
        return self.api_configured


extractor = RequirementsExtractor()