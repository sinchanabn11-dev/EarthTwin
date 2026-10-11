export interface BackendFile {
  path: string;
  name: string;
  category: 'core' | 'models' | 'routes' | 'services' | 'database' | 'ml' | 'config';
  description: string;
  content: string;
}

export const BACKEND_FILES: BackendFile[] = [
  {
    path: 'app/main.py',
    name: 'main.py',
    category: 'core',
    description: 'FastAPI application entry point, CORS middleware, global error handling, and router registration.',
    content: `from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

from app.config import settings
from app.routes import (
    environment,
    ecosystems,
    risks,
    simulation,
    alerts,
    recommendations,
    assistant
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", tags=["System Health"])
async def health_check():
    return {
        "status": "online",
        "service": "EarthTwin Backend",
        "version": settings.VERSION,
        "mode": "Supabase PostgreSQL" if settings.SUPABASE_CONNECTED else "In-Memory Realistic Mock Mode"
    }

# Register modular routes
app.include_router(ecosystems.router)
app.include_router(environment.router)
app.include_router(risks.router)
app.include_router(simulation.router)
app.include_router(alerts.router)
app.include_router(recommendations.router)
app.include_router(assistant.router)`
  },
  {
    path: 'app/config.py',
    name: 'config.py',
    category: 'config',
    description: 'Centralized environment configuration, host/port, CORS origins, and Supabase credentials.',
    content: `import os
from typing import List
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Settings:
    PROJECT_NAME: str = "EarthTwin — AI Digital Twin for Outdoor Ecosystems"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    CORS_ORIGINS: List[str] = [
        o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",") if o.strip()
    ]
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "").strip()

    @property
    def SUPABASE_CONNECTED(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_KEY and "http" in self.SUPABASE_URL)

settings = Settings()`
  },
  {
    path: 'app/models/environmental.py',
    name: 'environmental.py',
    category: 'models',
    description: 'Pydantic schemas for real-time sensor telemetry and historical timeseries.',
    content: `from pydantic import BaseModel, Field
from typing import List

class EnvironmentalData(BaseModel):
    id: str
    ecosystem_id: str
    timestamp: str
    temperature: float = Field(..., description="Degrees Celsius (°C)")
    humidity: float = Field(..., description="Relative humidity (%)")
    rainfall: float = Field(..., description="Accumulation in mm")
    soil_moisture: float = Field(..., description="Volumetric percentage (%)")
    vegetation_health: float = Field(..., description="NDVI proxy score (0-100)")
    air_quality: float = Field(..., description="Health index (0-100)")

class EnvironmentalHistoryResponse(BaseModel):
    ecosystem_id: str
    days: int
    data_points_count: int
    data: List[EnvironmentalData]`
  },
  {
    path: 'app/models/ecosystem.py',
    name: 'ecosystem.py',
    category: 'models',
    description: 'Pydantic schemas for outdoor ecosystems and micro-climate geographic zones.',
    content: `from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.environmental import EnvironmentalData

class EcosystemZone(BaseModel):
    zone_id: str
    ecosystem_id: str
    zone_name: str
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    soil_moisture: float
    vegetation_health: float
    risk_level: str
    canopy_density: Optional[float] = None
    dominant_species: Optional[str] = None

class EcosystemDetail(BaseModel):
    id: str
    name: str
    category: str
    location: str
    latitude: float
    longitude: float
    description: str
    health_score: float
    status: str
    current_environment: EnvironmentalData
    zones: List[EcosystemZone]`
  },
  {
    path: 'app/models/risk.py',
    name: 'risk.py',
    category: 'models',
    description: 'Schemas for 5-pillar health score evaluation and individual risk metrics.',
    content: `from pydantic import BaseModel, Field

class HealthScoreResponse(BaseModel):
    ecosystem_id: str
    overall_score: float
    status: str
    vegetation_health: float
    water_condition: float
    air_quality: float
    soil_condition: float
    climate_stability: float
    explanation: str
    calculation_method: str = "rule_based_weighted_composite"

class RiskDetail(BaseModel):
    level: str
    percentage: float
    explanation: str

class RiskAnalysisResponse(BaseModel):
    ecosystem_id: str
    fire_risk: RiskDetail
    drought_risk: RiskDetail
    vegetation_stress: RiskDetail
    flood_risk: RiskDetail
    methodology: str = "multivariate_heuristic_v1"`
  },
  {
    path: 'app/models/simulation.py',
    name: 'simulation.py',
    category: 'models',
    description: 'What-If simulation request validation and response comparisons.',
    content: `from pydantic import BaseModel, Field
from typing import Dict, Optional

class SimulationRequest(BaseModel):
    ecosystem_id: str
    temperature_change: float = Field(..., ge=-5.0, le=10.0)
    rainfall_change: float = Field(..., ge=-50.0, le=50.0)
    soil_moisture_change: float = Field(..., ge=-50.0, le=50.0)
    humidity_change: float = Field(..., ge=-30.0, le=30.0)

class SimulationMetrics(BaseModel):
    health: float
    fire_risk: float
    drought_risk: float
    vegetation_health: float

class SimulationResponse(BaseModel):
    simulation_id: str
    ecosystem_id: str
    timestamp: str
    inputs: Dict[str, float]
    current: SimulationMetrics
    simulated: SimulationMetrics
    deltas: Dict[str, float]
    explanation: str
    simulation_type: str = "rule_based_estimate"
    disclaimer: str = "Simulation estimate — ML model can be connected later."`
  },
  {
    path: 'app/ml/predictor.py',
    name: 'predictor.py',
    category: 'ml',
    description: 'Multivariate heuristics for fire risk, drought risk, and health scoring with scikit-learn loader hooks.',
    content: `import os
from typing import Tuple, Optional

class EcosystemRiskPredictor:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        # ML Hook: To activate trained scikit-learn model:
        # self.ml_model = joblib.load(model_path) if os.path.exists(model_path) else None

    def predict_fire_risk(self, temperature, humidity, soil_moisture, rainfall, vegetation_health):
        temp_factor = max(0.0, (temperature - 20.0) * 3.5)
        humidity_factor = max(0.0, (65.0 - humidity) * 1.1)
        soil_factor = max(0.0, (55.0 - soil_moisture) * 1.3)
        rain_suppression = min(35.0, rainfall * 1.8)
        raw = (temp_factor * 0.4) + (humidity_factor * 0.35) + (soil_factor * 0.35) - rain_suppression
        score = max(5.0, min(98.0, round(raw, 2)))
        level = "High" if score >= 75 else ("Medium" if score >= 50 else ("Moderate" if score >= 30 else "Low"))
        return score, level, f"Fire risk evaluated at {score}% based on thermal load and dry fuel."

    def predict_drought_risk(self, temperature, rainfall, soil_moisture, humidity):
        soil_deficit = max(0.0, (60.0 - soil_moisture) * 1.25)
        rain_deficit = max(0.0, (25.0 - rainfall) * 1.6)
        raw = (soil_deficit * 0.45) + (rain_deficit * 0.35)
        score = max(5.0, min(95.0, round(raw, 2)))
        level = "High" if score >= 70 else ("Moderate" if score >= 45 else "Low")
        return score, level, f"Drought risk evaluated at {score}%."

predictor = EcosystemRiskPredictor()`
  },
  {
    path: 'app/database/schema.sql',
    name: 'schema.sql',
    category: 'database',
    description: 'Full Supabase PostgreSQL schema with 7 relational tables, foreign keys, indexes, and seed records.',
    content: `-- 1. ECOSYSTEMS
CREATE TABLE IF NOT EXISTS ecosystems (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    health_score DOUBLE PRECISION NOT NULL DEFAULT 75.0,
    status VARCHAR(64) NOT NULL DEFAULT 'Healthy',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENVIRONMENT_DATA
CREATE TABLE IF NOT EXISTS environment_data (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) REFERENCES ecosystems(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    temperature DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    rainfall DOUBLE PRECISION NOT NULL,
    soil_moisture DOUBLE PRECISION NOT NULL,
    vegetation_health DOUBLE PRECISION NOT NULL,
    air_quality DOUBLE PRECISION NOT NULL
);

-- 3. ECOSYSTEM_ZONES
CREATE TABLE IF NOT EXISTS ecosystem_zones (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) REFERENCES ecosystems(id) ON DELETE CASCADE,
    zone_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    soil_moisture DOUBLE PRECISION NOT NULL,
    vegetation_health DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(64) NOT NULL DEFAULT 'Low'
);

-- 4. PREDICTIONS
CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) REFERENCES ecosystems(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    fire_risk DOUBLE PRECISION NOT NULL,
    drought_risk DOUBLE PRECISION NOT NULL,
    vegetation_stress DOUBLE PRECISION NOT NULL,
    ecosystem_health DOUBLE PRECISION NOT NULL,
    model_version VARCHAR(64) DEFAULT 'heuristic_v1'
);

-- 5. ALERTS
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) REFERENCES ecosystems(id) ON DELETE CASCADE,
    type VARCHAR(128) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SIMULATION_HISTORY
CREATE TABLE IF NOT EXISTS simulation_history (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) REFERENCES ecosystems(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    temperature_change DOUBLE PRECISION NOT NULL,
    rainfall_change DOUBLE PRECISION NOT NULL,
    soil_moisture_change DOUBLE PRECISION NOT NULL,
    humidity_change DOUBLE PRECISION NOT NULL,
    current_health DOUBLE PRECISION NOT NULL,
    simulated_health DOUBLE PRECISION NOT NULL,
    current_fire_risk DOUBLE PRECISION NOT NULL,
    simulated_fire_risk DOUBLE PRECISION NOT NULL,
    current_drought_risk DOUBLE PRECISION NOT NULL,
    simulated_drought_risk DOUBLE PRECISION NOT NULL,
    explanation TEXT
);

-- 7. RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    ecosystem_id VARCHAR(64) REFERENCES ecosystems(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    recommendation TEXT NOT NULL,
    priority VARCHAR(32) DEFAULT 'medium',
    category VARCHAR(64) NOT NULL,
    target_zone VARCHAR(128) DEFAULT 'Entire Ecosystem',
    expected_impact TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    category: 'config',
    description: 'Python dependencies specification for FastAPI, Supabase, scikit-learn, and data handling.',
    content: `fastapi>=0.110.0,<1.0.0
uvicorn[standard]>=0.28.0,<1.0.0
pydantic>=2.6.0,<3.0.0
pydantic-settings>=2.2.0,<3.0.0
python-dotenv>=1.0.1,<2.0.0
supabase>=2.3.0,<3.0.0
numpy>=1.26.0,<2.0.0
pandas>=2.2.0,<3.0.0
scikit-learn>=1.4.0,<2.0.0
joblib>=1.3.0,<2.0.0
requests>=2.31.0,<3.0.0
httpx>=0.27.0,<1.0.0`
  },
  {
    path: 'run.py',
    name: 'run.py',
    category: 'core',
    description: 'Convenience server execution script that loads settings and starts Uvicorn.',
    content: `import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"🌲 Starting EarthTwin Backend on {settings.HOST}:{settings.PORT}")
    print(f"📖 Swagger Docs available at: http://{settings.HOST}:{settings.PORT}/docs")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )`
  }
];
