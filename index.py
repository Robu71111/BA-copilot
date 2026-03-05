"""
Render Entry Point for BA Copilot API
"""
import sys
import os
from pathlib import Path
import traceback

# Setup Python path
root_dir = Path(__file__).parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "backend"))

print(f"Root directory: {root_dir}")
print(f"Python path: {sys.path[:3]}")

# Try importing the real FastAPI app
try:
    print("Attempting to import backend.api.main...")
    from backend.api.main import app
    print("✅ Successfully imported FastAPI app")

except Exception as e:
    print(f"❌ Failed to import backend.api.main: {e}")
    traceback.print_exc()

    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="BA Copilot API - Error State")

    error_details = {
        "error": "Failed to import main application",
        "exception": str(e),
        "traceback": traceback.format_exc(),
        "python_path": sys.path[:5],
        "root_dir": str(root_dir),
    }

    @app.get("/")
    @app.get("/api/health")
    async def error_info():
        return JSONResponse(status_code=500, content=error_details)

    print("Created fallback error app")


# Debug route
@app.get("/debug/files")
def debug_files():
    root = "/opt/render/project/src"
    result = {}
    for dirpath, dirnames, filenames in os.walk(root):
        rel = dirpath.replace(root, "")
        result[rel if rel else "/"] = {
            "dirs": dirnames,
            "files": filenames
        }
    return result