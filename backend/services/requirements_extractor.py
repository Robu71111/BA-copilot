"""
Requirements Extractor Module
==============================
Extracts functional and non-functional requirements from raw text
using FREE OpenRouter models.

This is STEP 1 in the BA workflow:
Input Text → Extract Requirements
"""

import requests
import time
from backend.core.config import APIConfig
from utils.prompts import PromptTemplates
import re


class RequirementsExtractor:
    """Extract requirements from raw text using AI"""
    
    def __init__(self):
        """Initialize OpenRouter API"""
        self.api_configured = False
        
        try:
            if APIConfig.OPENROUTER_API_KEY:
                self.api_configured = True
                print(f"✅ Requirements extractor configured with {APIConfig.CHAT_MODEL} (FREE)")
            else:
                print("❌ OpenRouter API key not configured")
        
        except Exception as e:
            print(f"OpenRouter API configuration error: {str(e)}")
    
    
    def extract(self, raw_text, project_type="General", industry="General"):
        """
        Extract requirements from raw text using FREE OpenRouter models
    
        Args:
            raw_text: Meeting transcript or document text
            project_type: Type of project (Web, Mobile, Desktop, etc.)
            industry: Industry domain (Finance, Healthcare, etc.)
        
        Returns:
            Dictionary with extracted requirements
        """
        if not self.api_configured:
            raise Exception("OpenRouter API not configured. Please add OPENROUTER_API_KEY to environment.")
    
        max_retries = 3
        retry_delay = 3  # Slightly longer for free tier
    
        for attempt in range(max_retries):
            try:
                # Generate prompt
                prompt = PromptTemplates.requirements_extractor(raw_text, project_type, industry)
            
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
                
                print(f"📝 Calling FREE OpenRouter model (attempt {attempt + 1}/{max_retries})...")
                print(f"   Model: {APIConfig.CHAT_MODEL}")
                
                # Make API request
                response = requests.post(
                    f"{APIConfig.OPENROUTER_BASE_URL}/chat/completions",
                    headers=APIConfig.get_headers(),
                    json=payload,
                    timeout=120  # Longer timeout for free models
                )
                
                # Handle rate limiting
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = retry_delay * (attempt + 2)  # Exponential backoff
                        print(f"⏳ Rate limit hit. Waiting {wait_time} seconds...")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception(
                            "⚠️ FREE TIER RATE LIMIT ⚠️\n\n"
                            "You've hit the rate limit for free models.\n"
                            "Wait 1-2 minutes and try again.\n\n"
                            "Check limits at: https://openrouter.ai/activity"
                        )
                
                # Check for errors
                if response.status_code != 200:
                    error_data = response.json()
                    error_detail = error_data.get('error', {}).get('message', 'Unknown error')
                    
                    # Check if model requires credits
                    if 'credits' in error_detail.lower() or 'insufficient' in error_detail.lower():
                        raise Exception(
                            f"⚠️ Model {APIConfig.CHAT_MODEL} may require credits.\n\n"
                            f"Try switching to a different free model in config.py:\n"
                            f"- google/gemini-2.0-flash-exp:free\n"
                            f"- deepseek/deepseek-chat-v3-0324:free\n"
                            f"- meta-llama/llama-3.1-70b-instruct:free\n\n"
                            f"Error: {error_detail}"
                        )
                    
                    raise Exception(f"API Error ({response.status_code}): {error_detail}")
                
                # Parse response
                result = response.json()
                
                if 'choices' in result and len(result['choices']) > 0:
                    raw_output = result['choices'][0]['message']['content']
                    print(f"✅ Got response: {len(raw_output)} characters")
                    
                    # Parse the response
                    requirements = self._parse_requirements(raw_output)
                    requirements['raw_output'] = raw_output
                    
                    # If parsing failed, try alternative parsing
                    if requirements['total_count'] == 0:
                        print("⚠️ Standard parsing found no requirements. Trying alternative parsing...")
                        requirements = self._alternative_parse(raw_output)
                    
                    return requirements
                else:
                    raise Exception("Invalid response format from API")
        
            except requests.exceptions.Timeout:
                if attempt < max_retries - 1:
                    print(f"⏳ Request timeout. Retrying...")
                    time.sleep(retry_delay)
                    continue
                else:
                    raise Exception("Request timed out. The free model may be overloaded. Try again in a few minutes.")
            
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"⏳ Request failed: {str(e)}. Retrying...")
                    time.sleep(retry_delay)
                    continue
                else:
                    raise Exception(f"Request failed: {str(e)}")
            
            except Exception as e:
                error_msg = str(e)
                
                # Check for overload errors
                if "overloaded" in error_msg.lower() or "503" in error_msg:
                    if attempt < max_retries - 1:
                        wait_time = retry_delay * (attempt + 2)
                        print(f"⏳ Model overloaded. Waiting {wait_time} seconds...")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception(
                            "Free model is currently overloaded.\n"
                            "Try again in 1-2 minutes or switch to a different free model."
                        )
                else:
                    # Re-raise the exception if it's not a retryable error
                    raise
    
        raise Exception("Failed to extract requirements after multiple retries")
    
    
    def _parse_requirements(self, text):
        """Parse AI output into structured requirements"""
        functional = []
        non_functional = []
        
        sections = text.split('##')
        
        for section in sections:
            section = section.strip()
            
            if 'Functional Requirements' in section or 'FUNCTIONAL REQUIREMENTS' in section:
                functional = self._extract_requirement_items(section, 'FR')
            
            elif 'Non-Functional Requirements' in section or 'NON-FUNCTIONAL REQUIREMENTS' in section or 'Non Functional Requirements' in section:
                non_functional = self._extract_requirement_items(section, 'NFR')
        
        return {
            'functional': functional,
            'non_functional': non_functional,
            'total_count': len(functional) + len(non_functional)
        }
    
    
    def _extract_requirement_items(self, section_text, req_prefix):
        """Extract individual requirement items from a section"""
        requirements = []
        
        patterns = [
            rf'[-*•]\s*({req_prefix}-\d+):\s*(.+?)(?=\n[-*•]\s*{req_prefix}-\d+:|\n##|\Z)',
            rf'\n({req_prefix}-\d+):\s*(.+?)(?=\n{req_prefix}-\d+:|\n##|\Z)',
            rf'\*\*({req_prefix}-\d+)\*\*:\s*(.+?)(?=\n\*\*{req_prefix}-\d+|\n##|\Z)',
        ]
        
        matches = []
        for pattern in patterns:
            matches = re.findall(pattern, section_text, re.MULTILINE | re.DOTALL)
            if matches:
                break
        
        if not matches:
            lines = section_text.split('\n')
            for line in lines:
                line = line.strip()
                if req_prefix in line and ':' in line:
                    match = re.search(rf'({req_prefix}-?\d+)[:.\s]+(.+)', line)
                    if match:
                        matches.append((match.group(1), match.group(2)))
        
        for idx, match in enumerate(matches, 1):
            try:
                if len(match) >= 2:
                    req_code = match[0].strip()
                    description = match[1].strip()
                    
                    if '-' not in req_code:
                        req_code = f"{req_prefix}-{req_code}"
                    
                    description = ' '.join(description.split())
                    
                    if description and len(description) > 10:
                        requirements.append({
                            'req_code': req_code,
                            'req_type': 'Functional' if req_prefix == 'FR' else 'Non-Functional',
                            'description': description
                        })
            except (IndexError, AttributeError):
                continue
        
        return requirements
    
    
    def _alternative_parse(self, text):
        """Alternative parsing method if standard parsing fails"""
        functional = []
        non_functional = []
        
        lines = text.split('\n')
        
        fr_count = 1
        nfr_count = 1
        in_functional_section = False
        in_nonfunctional_section = False
        
        for line in lines:
            line = line.strip()
            
            if 'Functional Requirements' in line or 'FUNCTIONAL REQUIREMENTS' in line:
                in_functional_section = True
                in_nonfunctional_section = False
                continue
            elif 'Non-Functional Requirements' in line or 'NON-FUNCTIONAL REQUIREMENTS' in line:
                in_functional_section = False
                in_nonfunctional_section = True
                continue
            elif line.startswith('##'):
                in_functional_section = False
                in_nonfunctional_section = False
                continue
            
            if line and len(line) > 20 and (line.startswith('-') or line.startswith('*') or line.startswith('•')):
                description = line.lstrip('-*•').strip()
                
                if in_functional_section:
                    functional.append({
                        'req_code': f'FR-{fr_count:03d}',
                        'req_type': 'Functional',
                        'description': description
                    })
                    fr_count += 1
                elif in_nonfunctional_section:
                    non_functional.append({
                        'req_code': f'NFR-{nfr_count:03d}',
                        'req_type': 'Non-Functional',
                        'description': description
                    })
                    nfr_count += 1
        
        return {
            'functional': functional,
            'non_functional': non_functional,
            'total_count': len(functional) + len(non_functional)
        }
    
    
    def format_for_display(self, requirements):
        """Format requirements for display in UI"""
        output = []
        
        if requirements['functional']:
            output.append("## 📋 Functional Requirements\n")
            for req in requirements['functional']:
                output.append(f"**{req['req_code']}**: {req['description']}\n")
        
        if requirements['non_functional']:
            output.append("\n## ⚙️ Non-Functional Requirements\n")
            for req in requirements['non_functional']:
                output.append(f"**{req['req_code']}**: {req['description']}\n")
        
        output.append(f"\n---\n**Total Requirements**: {requirements['total_count']} ")
        output.append(f"({len(requirements['functional'])} Functional, {len(requirements['non_functional'])} Non-Functional)")
        
        return '\n'.join(output)
    
    
    def is_configured(self):
        """Check if API is properly configured"""
        return self.api_configured


# Initialize extractor instance
extractor = RequirementsExtractor()