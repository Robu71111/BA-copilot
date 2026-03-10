"""
Acceptance Criteria Generator — multi-model fallback via openrouter/auto
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
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            **APIConfig.GENERATION_CONFIG
        }
        return requests.post(
            f"{APIConfig.OPENROUTER_BASE_URL}/chat/completions",
            headers=APIConfig.get_headers(),
            json=payload,
            timeout=120
        )

    def generate(self, user_story_text):
        if not self.api_configured:
            raise Exception("OpenRouter API key not configured.")

        prompt = PromptTemplates.acceptance_criteria_generator(user_story_text)
        last_error = "Unknown error"

        for model in APIConfig.FREE_MODELS:
            try:
                print(f"Trying model: {model}")
                response = self._call_model(model, prompt)

                if response.status_code == 429:
                    print(f"Rate limited on {model}, trying next...")
                    time.sleep(2)
                    continue

                if response.status_code != 200:
                    last_error = f"HTTP {response.status_code}: {response.text[:200]}"
                    print(f"Error on {model}: {last_error}")
                    continue

                data = response.json()
                raw_output = data['choices'][0]['message']['content']
                criteria = self._parse_criteria(raw_output)

                if criteria:
                    print(f"Success with model: {model}")
                    return {'criteria': criteria, 'raw_output': raw_output, 'total_scenarios': len(criteria)}

                last_error = "No criteria parsed from response"
                continue

            except Exception as e:
                last_error = str(e)
                print(f"Exception on {model}: {e}")
                continue

        raise Exception(f"All models failed. Last error: {last_error}. Please try again in 1-2 minutes.")

    def _parse_criteria(self, text):
        criteria_list = []
        scenario_pattern = r'\*\*Scenario \d+:([^*]+)\*\*'
        scenarios = re.split(scenario_pattern, text)
        for i in range(1, len(scenarios), 2):
            if i + 1 < len(scenarios):
                name = scenarios[i].strip()
                content = scenarios[i + 1].strip()
                c = self._extract_given_when_then(name, content)
                if c:
                    criteria_list.append(c)
        return criteria_list

    def _extract_given_when_then(self, scenario_name, content):
        criteria = {'scenario_name': scenario_name, 'given': '', 'when': '', 'then': ''}
        m = re.findall(r'-\s*GIVEN\s+(.+?)(?=-\s*(?:AND|WHEN)|$)', content, re.IGNORECASE | re.DOTALL)
        if m: criteria['given'] = ' AND '.join([' '.join(g.strip().split()) for g in m])
        m = re.findall(r'-\s*WHEN\s+(.+?)(?=-\s*(?:AND|THEN)|$)', content, re.IGNORECASE | re.DOTALL)
        if m: criteria['when'] = ' AND '.join([' '.join(w.strip().split()) for w in m])
        m = re.findall(r'-\s*THEN\s+(.+?)(?=-\s*(?:AND|\*\*)|$)', content, re.IGNORECASE | re.DOTALL)
        if m: criteria['then'] = ' AND '.join([' '.join(t.strip().split()) for t in m])
        if criteria['given'] and criteria['when'] and criteria['then']:
            return criteria
        return None

    def format_for_gherkin(self, criteria_data, feature_name="User Story"):
        output = [f"Feature: {feature_name}\n"]
        for c in criteria_data['criteria']:
            output.append(f"  Scenario: {c['scenario_name']}")
            output.append(f"    Given {c['given']}")
            output.append(f"    When {c['when']}")
            output.append(f"    Then {c['then']}")
            output.append("")
        return '\n'.join(output)

    def is_configured(self):
        return self.api_configured


criteria_gen = AcceptanceCriteriaGenerator()