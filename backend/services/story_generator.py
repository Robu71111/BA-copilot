"""
User Story Generator Module
============================
Converts requirements into Agile user stories (Scrum format)
using FREE OpenRouter models.

This is STEP 2 in the BA workflow:
Requirements → Generate User Stories
"""

import requests
import time
from backend.core.config import APIConfig
from utils.prompts import PromptTemplates
import re


class UserStoryGenerator:
    """Generate Agile user stories from requirements"""
    
    def __init__(self):
        """Initialize OpenRouter API"""
        self.api_configured = False
        
        try:
            if APIConfig.OPENROUTER_API_KEY:
                self.api_configured = True
                print(f"✅ Story generator configured with {APIConfig.CHAT_MODEL} (FREE)")
            else:
                print("❌ OpenRouter API key not configured")
        
        except Exception as e:
            print(f"OpenRouter API configuration error: {str(e)}")
    
    
    def generate(self, requirements_text, project_type="General"):
        """
        Generate user stories from requirements using FREE models
        
        Args:
            requirements_text: Formatted requirements text
            project_type: Type of project
            
        Returns:
            Dictionary with user stories
        """
        if not self.api_configured:
            raise Exception("OpenRouter API not configured. Please add OPENROUTER_API_KEY to environment.")
        
        max_retries = 3
        retry_delay = 3
        
        for attempt in range(max_retries):
            try:
                # Generate prompt
                prompt = PromptTemplates.user_story_generator(requirements_text, project_type)
                
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
                
                print(f"📖 Generating user stories with FREE model (attempt {attempt + 1}/{max_retries})...")
                
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
                    stories = self._parse_user_stories(raw_output)
                    
                    return {
                        'stories': stories,
                        'raw_output': raw_output,
                        'total_count': len(stories)
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
    
    
    def _parse_user_stories(self, text):
        """Parse AI output into structured user stories"""
        stories = []
        
        # Split by story separator (---)
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
        """Extract individual fields from a user story block"""
        story = {
            'story_code': '',
            'title': '',
            'user_story': '',
            'priority': 'Medium',
            'story_points': 0,
            'dependencies': 'None',
            'notes': ''
        }
        
        # Extract Story ID
        story_id_match = re.search(r'\*\*Story ID\*\*:\s*(US-\d+)', block, re.IGNORECASE)
        if story_id_match:
            story['story_code'] = story_id_match.group(1)
        
        # Extract Title
        title_match = re.search(r'\*\*Title\*\*:\s*(.+?)(?=\n\*\*|\n|$)', block, re.IGNORECASE)
        if title_match:
            story['title'] = title_match.group(1).strip()
        
        # Extract User Story
        user_story_match = re.search(r'\*\*User Story\*\*:\s*(.+?)(?=\n\*\*|\n---|\Z)', block, re.IGNORECASE | re.DOTALL)
        if user_story_match:
            story['user_story'] = ' '.join(user_story_match.group(1).strip().split())
        
        # Extract Priority
        priority_match = re.search(r'\*\*Priority\*\*:\s*(High|Medium|Low)', block, re.IGNORECASE)
        if priority_match:
            story['priority'] = priority_match.group(1).capitalize()
        
        # Extract Story Points
        points_match = re.search(r'\*\*Story Points\*\*:\s*(\d+)', block, re.IGNORECASE)
        if points_match:
            story['story_points'] = int(points_match.group(1))
        
        # Extract Dependencies
        deps_match = re.search(r'\*\*Dependencies\*\*:\s*(.+?)(?=\n\*\*|\n|$)', block, re.IGNORECASE)
        if deps_match:
            story['dependencies'] = deps_match.group(1).strip()
        
        # Extract Notes
        notes_match = re.search(r'\*\*Notes\*\*:\s*(.+?)(?=\n\*\*|\n---|\Z)', block, re.IGNORECASE | re.DOTALL)
        if notes_match:
            story['notes'] = ' '.join(notes_match.group(1).strip().split())
        
        return story
    
    
    def format_for_display(self, stories_data):
        """Format user stories for display in UI"""
        output = []
        
        output.append("## 📖 User Stories\n")
        
        for story in stories_data['stories']:
            output.append(f"### {story['story_code']}: {story['title']}\n")
            output.append(f"**User Story**: {story['user_story']}\n")
            output.append(f"**Priority**: {story['priority']} | **Story Points**: {story['story_points']} | **Dependencies**: {story['dependencies']}\n")
            
            if story['notes']:
                output.append(f"**Notes**: {story['notes']}\n")
            
            output.append("\n---\n")
        
        output.append(f"\n**Total User Stories**: {stories_data['total_count']}")
        
        return '\n'.join(output)
    
    
    def format_for_jira(self, stories_data):
        """Format user stories for JIRA import (CSV format)"""
        csv_lines = ["Summary,Description,Priority,Story Points,Issue Type"]
        
        for story in stories_data['stories']:
            summary = story['title']
            description = story['user_story']
            priority = story['priority']
            points = story['story_points']
            
            csv_lines.append(f'"{summary}","{description}",{priority},{points},Story')
        
        return '\n'.join(csv_lines)
    
    
    def is_configured(self):
        """Check if API is properly configured"""
        return self.api_configured


# Initialize generator instance
story_gen = UserStoryGenerator()