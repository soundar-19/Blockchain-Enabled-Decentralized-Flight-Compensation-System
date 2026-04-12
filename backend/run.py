#!/usr/bin/env python3
# backend/run.py
import sys
import os
from pathlib import Path

# Ensure parent directory is in path so 'backend' module can be imported
root_dir = Path(__file__).parent.parent
backend_dir = Path(__file__).parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Now import and run the app
from app import app

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 SkyGuard DAO Backend - Starting with MongoDB")
    print("=" * 60)
    print("📍 Running on http://localhost:5000")
    print("=" * 60)
    print()
    
    app.run(
        host=os.getenv('API_HOST', '0.0.0.0'),
        port=int(os.getenv('API_PORT', 5000)),
        debug=True,
        use_reloader=False
    )
