"""
User Story Generator — robust multi-model fallback.
"""
import requests
import time
from backend.core.config import APIConfig
from utils.prompts import PromptTemplates
import re


class UserStoryGenerator:
    def __init__(self):
        self.api_configured = bool(APIConfig.OPENROUTER_API_KEY)

    def _call_model(self, model, prompt):
        payload = {"model": model, "messages": [{"role": "user", "content": prompt}], **APIConfig.GENERATION_CONFIG}
        return requests.post(f"{APIConfig.OPENROUTER_BASE_URL}/chat/completions", headers=APIConfig.get_headers(), json=payload, timeout=120)

    def generate(self, requirements_text, project_type="General"):
        if not self.api_configured:
            raise Exception("OpenRouter API key not configured.")

        prompt = PromptTemplates.user_story_generator(requirements_text, project_type)
        last_error = "Unknown error"

        for model in APIConfig.FREE_MODELS:
            try:
                print(f"Trying model: {model}")
                response = self._call_model(model, prompt)
                body = response.text

                if response.status_code in (429, 404, 503):
                    print(f"HTTP 429 on {model}"); time.sleep(1); continue

                if APIConfig.is_rate_limit_error(body):
                    print(f"Body rate-limit on {model}: {body[:100]}"); time.sleep(1); continue

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

                stories = self._parse_user_stories(content)
                if stories:
                    print(f"Success with {model} — {len(stories)} stories")
                    return {'stories': stories, 'raw_output': content, 'total_count': len(stories)}

                last_error = "No stories parsed"; continue

            except requests.exceptions.Timeout:
                last_error = "Timeout"; print(f"Timeout on {model}"); continue
            except Exception as e:
                last_error = str(e); print(f"Exception on {model}: {e}"); continue

        raise Exception(f"All models failed. Last error: {last_error}. Try again in 1-2 minutes.")

    def _parse_user_stories(self, text):
        stories = []
        for block in re.split(r'\n---+\n', text):
            block = block.strip()
            if not block or len(block) < 50: continue
            story = self._extract_story_fields(block)
            if story and story.get('story_code'): stories.append(story)
        return stories

    def _extract_story_fields(self, block):
        story = {'story_code': '', 'title': '', 'user_story': '', 'priority': 'Medium', 'story_points': 0, 'dependencies': 'None', 'notes': ''}
        m = re.search(r'\*\*Story ID\*\*:\s*(US-\d+)', block, re.IGNORECASE)
        if m: story['story_code'] = m.group(1)
        m = re.search(r'\*\*Title\*\*:\s*(.+?)(?=\n\*\*|\n|$)', block, re.IGNORECASE)
        if m: story['title'] = m.group(1).strip()
        m = re.search(r'\*\*User Story\*\*:\s*(.+?)(?=\n\*\*|\n---|\Z)', block, re.IGNORECASE | re.DOTALL)
        if m: story['user_story'] = ' '.join(m.group(1).strip().split())
        m = re.search(r'\*\*Priority\*\*:\s*(High|Medium|Low)', block, re.IGNORECASE)
        if m: story['priority'] = m.group(1).capitalize()
        m = re.search(r'\*\*Story Points\*\*:\s*(\d+)', block, re.IGNORECASE)
        if m: story['story_points'] = int(m.group(1))
        m = re.search(r'\*\*Dependencies\*\*:\s*(.+?)(?=\n\*\*|\n|$)', block, re.IGNORECASE)
        if m: story['dependencies'] = m.group(1).strip()
        m = re.search(r'\*\*Notes\*\*:\s*(.+?)(?=\n\*\*|\n---|\Z)', block, re.IGNORECASE | re.DOTALL)
        if m: story['notes'] = ' '.join(m.group(1).strip().split())
        return story

    def format_for_jira(self, stories_data):
        lines = ["Summary,Description,Priority,Story Points,Issue Type"]
        for s in stories_data['stories']:
            lines.append(f'"{s["title"]}","{s["user_story"]}",{s["priority"]},{s["story_points"]},Story')
        return '\n'.join(lines)

    def is_configured(self): return self.api_configured


story_gen = UserStoryGenerator()