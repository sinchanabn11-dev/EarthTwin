"""
Application configuration management using environment variables.
"""

import os
from typing import List
from dotenv import load_dotenv

# Load .env file if dotenv is installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Settings:
    PROJECT_NAME: str = "EarthTwin — AI Digital Twin for Outdoor Ecosystems"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "AI-powered digital twin system for outdoor ecosystems. Provides real-time "
        "environmental telemetry, health scoring, risk analysis, What-If simulation "
        "engine, automated alerts, dynamic recommendations, and digital twin assistant."
    )
    
    # Network & Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS origins
    _cors_env: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    )
    CORS_ORIGINS: List[str] = [origin.strip() for origin in _cors_env.split(",") if origin.strip()]

    # Supabase Credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "").strip()

    @property
    def SUPABASE_CONNECTED(self) -> bool:
        """Determines if valid Supabase credentials were supplied."""
        return bool(self.SUPABASE_URL and self.SUPABASE_KEY and "http" in self.SUPABASE_URL)

    # ML Configuration
    USE_ML_PREDICTOR: bool = os.getenv("USE_ML_PREDICTOR", "False").lower() in ("true", "1", "t")
    ML_MODEL_PATH: str = os.getenv("ML_MODEL_PATH", "./app/ml/models/ecosystem_model.pkl")


settings = Settings()
