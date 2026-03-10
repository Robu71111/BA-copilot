"""
User Story Generator — multi-model fallback via openrouter/auto
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

    def generate(self, requirements_text, project_type="General"):
        if not self.api_configured:
            raise Exception("OpenRouter API key not configured.")

        prompt = PromptTemplates.user_story_generator(requirements_text, project_type)
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
                stories = self._parse_user_stories(raw_output)

                if stories:
                    print(f"Success with model: {model}")
                    return {'stories': stories, 'raw_output': raw_output, 'total_count': len(stories)}

                last_error = "No stories parsed from response"
                continue

            except Exception as e:
                last_error = str(e)
                print(f"Exception on {model}: {e}")
                continue

        raise Exception(f"All models failed. Last error: {last_error}. Please try again in 1-2 minutes.")

    def _parse_user_stories(self, text):
        stories = []
        story_blocks = re.split(r'\n---+\n', text)
        for block in story_blocks:
            block = block.strip()
            if not block or len(block) < 50:
                continue
            story = self._extract_story_fields(block)
            if story and story.get('story_code'):
                stories.append(story)
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
        csv_lines = ["Summary,Description,Priority,Story Points,Issue Type"]
        for story in stories_data['stories']:
            csv_lines.append(f'"{story["title"]}","{story["user_story"]}",{story["priority"]},{story["story_points"]},Story')
        return '\n'.join(csv_lines)

    def is_configured(self):
        return self.api_configured


story_gen = UserStoryGenerator()