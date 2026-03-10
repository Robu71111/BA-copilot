"""
Acceptance Criteria Generator — robust multi-model fallback.
"""
import requests
import time
from backend.core.config import APIConfig
from utils.prompts import PromptTemplates
import re


class AcceptanceCriteriaGenerator:
    def __init__(self):
        self.api_configured = bool(APIConfig.OPENROUTER_API_KEY)

    def _call_model(self, model, prompt):
        payload = {"model": model, "messages": [{"role": "user", "content": prompt}], **APIConfig.GENERATION_CONFIG}
        return requests.post(f"{APIConfig.OPENROUTER_BASE_URL}/chat/completions", headers=APIConfig.get_headers(), json=payload, timeout=120)

    def generate(self, user_story_text):
        if not self.api_configured:
            raise Exception("OpenRouter API key not configured.")

        prompt = PromptTemplates.acceptance_criteria_generator(user_story_text)
        last_error = "Unknown error"

        for model in APIConfig.FREE_MODELS:
            try:
                print(f"Trying model: {model}")
                response = self._call_model(model, prompt)
                body = response.text

                if response.status_code in (429, 404, 503):
                    print(f"HTTP 429 on {model}"); time.sleep(1); continue

                if APIConfig.is_rate_limit_error(body):
                    print(f"Body rate-limit on {model}"); time.sleep(1); continue

                if response.status_code != 200:
                    last_error = f"HTTP {response.status_code}: {body[:200]}"; continue

                data = response.json()
                if 'error' in data:
                    err_msg = str(data['error'])
                    if APIConfig.is_rate_limit_error(err_msg): continue
                    last_error = err_msg; continue

                if not data.get('choices'):
                    last_error = "Empty choices"; continue

                content = data['choices'][0]['message']['content']
                if APIConfig.is_rate_limit_error(content): continue

                criteria = self._parse_criteria(content)
                if criteria:
                    print(f"Success with {model} — {len(criteria)} scenarios")
                    return {'criteria': criteria, 'raw_output': content, 'total_scenarios': len(criteria)}

                last_error = "No criteria parsed"; continue

            except requests.exceptions.Timeout:
                last_error = "Timeout"; continue
            except Exception as e:
                last_error = str(e); continue

        raise Exception(f"All models failed. Last error: {last_error}. Try again in 1-2 minutes.")

    def _parse_criteria(self, text):
        criteria_list = []
        scenarios = re.split(r'\*\*Scenario \d+:([^*]+)\*\*', text)
        for i in range(1, len(scenarios), 2):
            if i + 1 < len(scenarios):
                c = self._extract_gwt(scenarios[i].strip(), scenarios[i+1].strip())
                if c: criteria_list.append(c)
        return criteria_list

    def _extract_gwt(self, name, content):
        c = {'scenario_name': name, 'given': '', 'when': '', 'then': ''}
        m = re.findall(r'-\s*GIVEN\s+(.+?)(?=-\s*(?:AND|WHEN)|$)', content, re.IGNORECASE | re.DOTALL)
        if m: c['given'] = ' AND '.join([' '.join(x.strip().split()) for x in m])
        m = re.findall(r'-\s*WHEN\s+(.+?)(?=-\s*(?:AND|THEN)|$)', content, re.IGNORECASE | re.DOTALL)
        if m: c['when'] = ' AND '.join([' '.join(x.strip().split()) for x in m])
        m = re.findall(r'-\s*THEN\s+(.+?)(?=-\s*(?:AND|\*\*)|$)', content, re.IGNORECASE | re.DOTALL)
        if m: c['then'] = ' AND '.join([' '.join(x.strip().split()) for x in m])
        return c if (c['given'] and c['when'] and c['then']) else None

    def format_for_gherkin(self, data, feature_name="User Story"):
        out = [f"Feature: {feature_name}\n"]
        for c in data['criteria']:
            out += [f"  Scenario: {c['scenario_name']}", f"    Given {c['given']}", f"    When {c['when']}", f"    Then {c['then']}", ""]
        return '\n'.join(out)

    def is_configured(self): return self.api_configured


criteria_gen = AcceptanceCriteriaGenerator()