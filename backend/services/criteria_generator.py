"""
Acceptance Criteria Generator Module
=====================================
Generates Given-When-Then acceptance criteria from user stories
using FREE OpenRouter models.

This is STEP 3 in the BA workflow:
User Stories → Generate Acceptance Criteria
"""

import requests
import time
from backend.core.config import APIConfig
from utils.prompts import PromptTemplates
import re


class AcceptanceCriteriaGenerator:
    """Generate acceptance criteria from user stories"""
    
    def __init__(self):
        """Initialize OpenRouter API"""
        self.api_configured = False
        
        try:
            if APIConfig.OPENROUTER_API_KEY:
                self.api_configured = True
                print(f"✅ Criteria generator configured with {APIConfig.CHAT_MODEL} (FREE)")
            else:
                print("❌ OpenRouter API key not configured")
        
        except Exception as e:
            print(f"OpenRouter API configuration error: {str(e)}")
    
    
    def generate(self, user_story_text):
        """
        Generate acceptance criteria for a user story using FREE models
        
        Args:
            user_story_text: Single user story text
            
        Returns:
            Dictionary with acceptance criteria
        """
        if not self.api_configured:
            raise Exception("OpenRouter API not configured. Please add OPENROUTER_API_KEY to environment.")
        
        max_retries = 3
        retry_delay = 3
        
        for attempt in range(max_retries):
            try:
                # Generate prompt
                prompt = PromptTemplates.acceptance_criteria_generator(user_story_text)
                
                # Prepare API request
                payload = {
                    "model": APIConfig.CHAT_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    **APIConfig.GENERATION_CONFIG
                }
                
                print(f"✅ Generating acceptance criteria with FREE model (attempt {attempt + 1}/{max_retries})...")
                
                # Make API request
                response = requests.post(
                    f"{APIConfig.OPENROUTER_BASE_URL}/chat/completions",
                    headers=APIConfig.get_headers(),
                    json=payload,
                    timeout=120
                )
                
                # Handle rate limiting
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = retry_delay * (attempt + 2)
                        print(f"⏳ Rate limit. Waiting {wait_time}s...")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception("Rate limit exceeded. Wait 1-2 minutes and try again.")
                
                # Check for errors
                if response.status_code != 200:
                    error_detail = response.json().get('error', {}).get('message', 'Unknown error')
                    raise Exception(f"API Error ({response.status_code}): {error_detail}")
                
                # Parse response
                result = response.json()
                
                if 'choices' in result and len(result['choices']) > 0:
                    raw_output = result['choices'][0]['message']['content']
                    
                    # Parse the response
                    criteria = self._parse_criteria(raw_output)
                    
                    return {
                        'criteria': criteria,
                        'raw_output': raw_output,
                        'total_scenarios': len(criteria)
                    }
                else:
                    raise Exception("Invalid response format from API")
            
            except requests.exceptions.Timeout:
                if attempt < max_retries - 1:
                    print(f"⏳ Timeout. Retrying...")
                    time.sleep(retry_delay)
                    continue
                else:
                    raise Exception("Request timed out. Try again later.")
            
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                else:
                    raise Exception(f"Request failed: {str(e)}")
            
            except Exception as e:
                # Re-raise non-retryable errors
                if "rate limit" in str(e).lower() or "error" in str(e).lower():
                    raise
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                else:
                    raise
        
        raise Exception("Failed after multiple retries")
    
    
    def _parse_criteria(self, text):
        """Parse AI output into structured acceptance criteria"""
        criteria_list = []
        
        # Split by scenario headers
        scenario_pattern = r'\*\*Scenario \d+:([^*]+)\*\*'
        scenarios = re.split(scenario_pattern, text)
        
        # Process scenarios (skip first element which is usually empty or intro)
        for i in range(1, len(scenarios), 2):
            if i + 1 < len(scenarios):
                scenario_name = scenarios[i].strip()
                scenario_content = scenarios[i + 1].strip()
                
                criteria = self._extract_given_when_then(scenario_name, scenario_content)
                if criteria:
                    criteria_list.append(criteria)
        
        return criteria_list
    
    
    def _extract_given_when_then(self, scenario_name, content):
        """Extract GIVEN-WHEN-THEN clauses from scenario content"""
        criteria = {
            'scenario_name': scenario_name,
            'given': '',
            'when': '',
            'then': ''
        }
        
        # Extract GIVEN clauses
        given_pattern = r'-\s*GIVEN\s+(.+?)(?=-\s*(?:AND|WHEN)|$)'
        given_matches = re.findall(given_pattern, content, re.IGNORECASE | re.DOTALL)
        
        # Extract AND clauses after GIVEN
        given_and_pattern = r'(?:GIVEN.+?)-\s*AND\s+(.+?)(?=-\s*WHEN)'
        given_and_matches = re.findall(given_and_pattern, content, re.IGNORECASE | re.DOTALL)
        
        all_given = given_matches + given_and_matches
        if all_given:
            criteria['given'] = ' AND '.join([' '.join(g.strip().split()) for g in all_given])
        
        # Extract WHEN clauses
        when_pattern = r'-\s*WHEN\s+(.+?)(?=-\s*(?:AND|THEN)|$)'
        when_matches = re.findall(when_pattern, content, re.IGNORECASE | re.DOTALL)
        
        # Extract AND clauses after WHEN
        when_and_pattern = r'(?:WHEN.+?)-\s*AND\s+(.+?)(?=-\s*THEN)'
        when_and_matches = re.findall(when_and_pattern, content, re.IGNORECASE | re.DOTALL)
        
        all_when = when_matches + when_and_matches
        if all_when:
            criteria['when'] = ' AND '.join([' '.join(w.strip().split()) for w in all_when])
        
        # Extract THEN clauses
        then_pattern = r'-\s*THEN\s+(.+?)(?=-\s*(?:AND|\*\*)|$)'
        then_matches = re.findall(then_pattern, content, re.IGNORECASE | re.DOTALL)
        
        # Extract AND clauses after THEN
        then_and_pattern = r'(?:THEN.+?)-\s*AND\s+(.+?)(?=-\s*\*\*|\Z)'
        then_and_matches = re.findall(then_and_pattern, content, re.IGNORECASE | re.DOTALL)
        
        all_then = then_matches + then_and_matches
        if all_then:
            criteria['then'] = ' AND '.join([' '.join(t.strip().split()) for t in all_then])
        
        # Only return if we have all three components
        if criteria['given'] and criteria['when'] and criteria['then']:
            return criteria
        
        return None
    
    
    def format_for_display(self, criteria_data):
        """Format acceptance criteria for display in UI"""
        output = []
        
        output.append("## ✅ Acceptance Criteria (Given-When-Then)\n")
        
        for idx, criteria in enumerate(criteria_data['criteria'], 1):
            output.append(f"### Scenario {idx}: {criteria['scenario_name']}\n")
            output.append(f"**GIVEN** {criteria['given']}\n")
            output.append(f"**WHEN** {criteria['when']}\n")
            output.append(f"**THEN** {criteria['then']}\n")
            output.append("\n---\n")
        
        output.append(f"\n**Total Scenarios**: {criteria_data['total_scenarios']}")
        
        return '\n'.join(output)
    
    
    def format_for_gherkin(self, criteria_data, feature_name="User Story"):
        """Format acceptance criteria in Gherkin syntax for BDD tools"""
        output = [f"Feature: {feature_name}\n"]
        
        for criteria in criteria_data['criteria']:
            output.append(f"  Scenario: {criteria['scenario_name']}")
            output.append(f"    Given {criteria['given']}")
            output.append(f"    When {criteria['when']}")
            output.append(f"    Then {criteria['then']}")
            output.append("")
        
        return '\n'.join(output)
    
    
    def is_configured(self):
        """Check if API is properly configured"""
        return self.api_configured


# Initialize generator instance
criteria_gen = AcceptanceCriteriaGenerator()