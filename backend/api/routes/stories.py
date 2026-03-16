"""User stories generation routes — async + fixed JIRA export"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
from backend.core.database import db
from backend.services.story_generator import story_gen

router = APIRouter()

class StoriesGenerate(BaseModel):
    input_id: int
    project_type: str = "General"

@router.post("/generate")
async def generate_stories(data: StoriesGenerate):
    """Generate user stories from requirements"""
    try:
        print(f"Generating stories for input_id: {data.input_id}")
        
        requirements = db.get_requirements(data.input_id)
        
        if not requirements:
            raise HTTPException(
                status_code=404, 
                detail=f"No requirements found for input_id {data.input_id}. Please extract requirements first."
            )
        
        print(f"   Found {len(requirements)} requirements")
        
        req_text = "## Requirements\n\n"
        for req in requirements:
            req_code = req[1]
            req_type = req[2]
            description = req[3]
            req_text += f"**{req_code}** ({req_type}): {description}\n\n"
        
        try:
            stories = await story_gen.generate(req_text, data.project_type)
            print(f"Generated {stories['total_count']} user stories")
            
            if stories['total_count'] == 0:
                raise Exception("AI returned no stories. The response may be empty or incorrectly formatted.")
            
            return stories
            
        except Exception as gen_error:
            print(f"Story generation error: {str(gen_error)}")
            import traceback
            traceback.print_exc()
            
            raise HTTPException(
                status_code=500,
                detail=f"Story generation failed: {str(gen_error)}. Check if the AI model is responding correctly."
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in generate_stories: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{input_id}")
async def get_stories(input_id: int):
    return {"stories": [], "message": "Story retrieval not yet implemented"}

@router.post("/export/jira")
async def export_jira(data: dict):
    """Export user stories to JIRA CSV format.
    Accepts either { stories: { stories: [...] } } or { stories: [...] }
    to handle both old and new frontend payload shapes.
    """
    try:
        stories_data = data.get('stories', {})
        
        # Handle both shapes: { stories: [...] } and [...] directly
        if isinstance(stories_data, list):
            stories_data = {'stories': stories_data}
        elif isinstance(stories_data, dict) and 'stories' not in stories_data:
            raise HTTPException(status_code=400, detail="Invalid stories data — missing 'stories' array")
        
        if not stories_data or not stories_data.get('stories'):
            raise HTTPException(status_code=400, detail="No stories found in request")
        
        csv = story_gen.format_for_jira(stories_data)
        return {"csv": csv}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"JIRA export error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))