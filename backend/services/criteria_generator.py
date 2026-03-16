"""
Acceptance Criteria Generator — robust multi-model fallback with async HTTP.
Improved parsing to handle varied AI output formats.
"""
import httpx
import asyncio
from backend.core.config import APIConfig
from utils.prompts import PromptTemplates
import re


class AcceptanceCriteriaGenerator:
    def __init__(self):
        self.api_configured = bool(APIConfig.OPENROUTER_API_KEY)

    async def _call_model(self, client, model, prompt):
        payload = {"model": model, "messages": [{"role": "user", "content": prompt}], **APIConfig.GENERATION_CONFIG}
        return await client.post(f"{APIConfig.OPENROUTER_BASE_URL}/chat/completions", headers=APIConfig.get_headers(), json=payload, timeout=120)

    async def generate(self, user_story_text):
        if not self.api_configured:
            raise Exception("OpenRouter API key not configured.")

        prompt = PromptTemplates.acceptance_criteria_generator(user_story_text)
        last_error = "Unknown error"

        async with httpx.AsyncClient() as client:
            for model in APIConfig.FREE_MODELS:
                try:
                    print(f"Trying model: {model}")
                    response = await self._call_model(client, model, prompt)
                    body = response.text

                    if response.status_code in (429, 404, 503):
                        print(f"HTTP {response.status_code} on {model}"); await asyncio.sleep(1); continue

                    if APIConfig.is_rate_limit_error(body):
                        print(f"Body rate-limit on {model}"); await asyncio.sleep(1); continue

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

                except httpx.TimeoutException:
                    last_error = "Timeout"; continue
                except Exception as e:
                    last_error = str(e); continue

        raise Exception(f"All models failed. Last error: {last_error}. Try again in 1-2 minutes.")

    def _parse_criteria(self, text):
        """Parse criteria with multiple fallback strategies."""
        # Strategy 1: Original bold-delimited format  **Scenario N: name**
        criteria_list = self._parse_bold_scenarios(text)
        if criteria_list:
            return criteria_list

        # Strategy 2: Markdown heading format  ## Scenario N: name  or  ### Scenario N
        criteria_list = self._parse_heading_scenarios(text)
        if criteria_list:
            return criteria_list

        # Strategy 3: Numbered format  Scenario 1: name  (no bold)
        criteria_list = self._parse_plain_scenarios(text)
        if criteria_list:
            return criteria_list

        # Strategy 4: Line-by-line GWT extraction (most lenient)
        criteria_list = self._parse_gwt_blocks(text)
        return criteria_list

    def _parse_bold_scenarios(self, text):
        """Parse **Scenario N: name** format."""
        criteria_list = []
        scenarios = re.split(r'\*\*Scenario\s*\d+[:\s]*([^*]*)\*\*', text)
        for i in range(1, len(scenarios), 2):
            if i + 1 < len(scenarios):
                c = self._extract_gwt(scenarios[i].strip(), scenarios[i+1].strip())
                if c: criteria_list.append(c)
        return criteria_list

    def _parse_heading_scenarios(self, text):
        """Parse ## Scenario N or ### Scenario N heading format."""
        criteria_list = []
        parts = re.split(r'#{2,3}\s*Scenario\s*\d+[:\s]*(.*)', text)
        for i in range(1, len(parts), 2):
            if i + 1 < len(parts):
                c = self._extract_gwt(parts[i].strip(), parts[i+1].strip())
                if c: criteria_list.append(c)
        return criteria_list

    def _parse_plain_scenarios(self, text):
        """Parse Scenario N: name (no markdown formatting)."""
        criteria_list = []
        parts = re.split(r'(?:^|\n)Scenario\s*\d+[:\s]*(.*)', text)
        for i in range(1, len(parts), 2):
            if i + 1 < len(parts):
                c = self._extract_gwt(parts[i].strip(), parts[i+1].strip())
                if c: criteria_list.append(c)
        return criteria_list

    def _parse_gwt_blocks(self, text):
        """Most lenient: find all GIVEN/WHEN/THEN triplets anywhere in text."""
        criteria_list = []
        # Split text into potential scenario blocks by looking for GIVEN keywords
        blocks = re.split(r'(?=[-*]\s*(?:GIVEN|Given)\s)', text)
        scenario_num = 0
        for block in blocks:
            block = block.strip()
            if not block:
                continue
            given = self._extract_clause(block, 'given')
            when_c = self._extract_clause(block, 'when')
            then_c = self._extract_clause(block, 'then')
            and_steps = self._extract_and_steps(block)
            if given and when_c and then_c:
                scenario_num += 1
                criteria_list.append({
                    'scenario_name': f'Scenario {scenario_num}',
                    'given': given,
                    'when': when_c,
                    'then': then_c,
                    'and_steps': and_steps
                })
        return criteria_list

    def _extract_clause(self, text, clause_type):
        """Extract a single GIVEN/WHEN/THEN clause."""
        next_kw = {'given': 'WHEN', 'when': 'THEN', 'then': 'AND|$'}
        pattern = rf'[-*]?\s*{clause_type}\s+(.+?)(?=[-*]\s*(?:{next_kw[clause_type]})|$)'
        m = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if m:
            return ' '.join(m.group(1).strip().split())
        return ''

    def _extract_and_steps(self, text):
        """Extract AND steps from a block."""
        and_steps = []
        for m in re.finditer(r'[-*]\s*AND\s+(.+?)(?=[-*]\s*(?:AND|GIVEN|WHEN|THEN)|$)', text, re.IGNORECASE | re.DOTALL):
            step = ' '.join(m.group(1).strip().split())
            if step and len(step) > 5:
                and_steps.append(step)
        return and_steps

    def _extract_gwt(self, name, content):
        c = {'scenario_name': name or 'Unnamed scenario', 'given': '', 'when': '', 'then': '', 'and_steps': []}

        # Extract GIVEN clauses
        m = re.findall(r'[-*]\s*GIVEN\s+(.+?)(?=[-*]\s*(?:AND|WHEN)|$)', content, re.IGNORECASE | re.DOTALL)
        if m: c['given'] = ' AND '.join([' '.join(x.strip().split()) for x in m])

        # Extract WHEN clauses
        m = re.findall(r'[-*]\s*WHEN\s+(.+?)(?=[-*]\s*(?:AND|THEN)|$)', content, re.IGNORECASE | re.DOTALL)
        if m: c['when'] = ' AND '.join([' '.join(x.strip().split()) for x in m])

        # Extract THEN clauses
        m = re.findall(r'[-*]\s*THEN\s+(.+?)(?=[-*]\s*(?:AND|\*\*|##|$))', content, re.IGNORECASE | re.DOTALL)
        if m: c['then'] = ' AND '.join([' '.join(x.strip().split()) for x in m])

        # Extract AND steps
        c['and_steps'] = self._extract_and_steps(content)

        return c if (c['given'] and c['when'] and c['then']) else None

    def format_for_gherkin(self, data, feature_name="User Story"):
        out = [f"Feature: {feature_name}\n"]
        for c in data['criteria']:
            out += [f"  Scenario: {c['scenario_name']}", f"    Given {c['given']}", f"    When {c['when']}", f"    Then {c['then']}"]
            for step in c.get('and_steps', []):
                out.append(f"    And {step}")
            out.append("")
        return '\n'.join(out)

    def is_configured(self): return self.api_configured


criteria_gen = AcceptanceCriteriaGenerator()