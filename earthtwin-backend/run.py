"""
EarthTwin — AI Digital Twin for Outdoor Ecosystems
Main application runner script.
"""

import uvicorn
import os
from app.config import settings

if __name__ == "__main__":
    print(f"🌲 Starting EarthTwin Backend on {settings.HOST}:{settings.PORT}")
    print(f"📖 Swagger Docs available at: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"✨ Supabase Connected: {settings.SUPABASE_CONNECTED} (Mock fallback enabled if False)")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
