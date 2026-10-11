# 🌲 EarthTwin — AI Digital Twin for Outdoor Ecosystems

> **Backend Architecture & API Documentation**  
> Built with **FastAPI**, **Pydantic**, **Supabase PostgreSQL**, and modular **Machine Learning Integration Stubs**.

---

## 1. What EarthTwin Is

**EarthTwin** is an AI-powered digital twin system engineered for continuous monitoring, risk assessment, and scenario forecasting across outdoor ecosystems (Forests, Urban Parks, Wetlands, and Agricultural Basins).

Outdoor ecosystems are vulnerable to compounding climate extremes: rising ambient temperatures, depleted soil moisture reserves, erratic monsoons, and pest/vegetation dieback. EarthTwin acts as a computational replica of physical outdoor habitats, ingesting multi-spectral sensor telemetry, analyzing real-time ecological health, estimating prospective disaster risks (wildfires, droughts, canopy collapse, flash floods), and empowering conservation managers with predictive "What-If" simulation capabilities and an interactive AI digital twin assistant.

---

## 2. Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React + TypeScript Frontend                 │
│              (Vite SPA, Tailwind CSS, Lucide)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (CORS enabled)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                       │
│    (Port 8000 · Pydantic V2 Schemas · Asynchronous Routes)   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Services & Logic        │ │     Supabase Database      │
│  - Environment Telemetry     │ │   (PostgreSQL Relational)  │
│  - Health Scoring (5 Pillars)│ │  - 7 Relational Tables     │
│  - Risk Analysis (Fire/Drought)│ - Timeseries Telemetry     │
│  - What-If Simulation Engine │ │  - Foreign Keys & Indexes  │
│  - Alert System & Filter     │ └──────────────┬─────────────┘
│  - Dynamic Recommendations   │                │
│  - Rule-based AI Assistant   │                │ (Graceful Fallback)
└──────────────┬───────────────┘                ▼
               │                   ┌──────────────────────────┐
               │                   │  Standalone Mock Store   │
               │                   │ (No API key needed for   │
               │                   │  college demonstration)  │
               │                   └──────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Machine Learning Layer                     │
│  - Phase 1: Transparent Multivariate Heuristics             │
│  - Phase 2: Scikit-Learn MultiOutputRegressor Pipeline      │
│            (model.pkl loaded via joblib)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Project Directory Structure

```
earthtwin-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application setup & CORS configuration
│   ├── config.py                   # Environment settings and Supabase credentials
│   │
│   ├── models/                     # Pydantic data schemas
│   │   ├── __init__.py
│   │   ├── environmental.py        # Telemetry and time-series history
│   │   ├── ecosystem.py            # Ecosystem profiles and micro-climate zones
│   │   ├── risk.py                 # 0-100 Health score and Risk models
│   │   ├── simulation.py           # What-If scenario inputs, outputs, and limits
│   │   ├── alert.py                # Alert models with severity classification
│   │   ├── recommendation.py       # Prioritized ecological interventions
│   │   └── assistant.py            # AI assistant question & answer schemas
│   │
│   ├── routes/                     # Modular API endpoints
│   │   ├── __init__.py
│   │   ├── environment.py          # /api/environment/*
│   │   ├── ecosystems.py           # /api/ecosystems/*
│   │   ├── risks.py                # /api/health/* and /api/risks/*
│   │   ├── simulation.py           # /api/simulation/run and history
│   │   ├── alerts.py               # /api/alerts/*
│   │   ├── recommendations.py      # /api/recommendations/*
│   │   └── assistant.py            # /api/assistant/ask
│   │
│   ├── services/                   # Business logic and computations
│   │   ├── __init__.py
│   │   ├── environment_service.py  # Telemetry generation & data handling
│   │   ├── risk_service.py         # Multi-risk and composite health evaluation
│   │   ├── simulation_service.py   # What-If mathematical simulation engine
│   │   ├── recommendation_service.py# Dynamic recommendation generator
│   │   └── ai_service.py           # Context-aware rule-based assistant
│   │
│   ├── database/                   # Supabase database layer
│   │   ├── __init__.py
│   │   ├── supabase_client.py      # Dual-mode Supabase client & fallback adapter
│   │   └── schema.sql              # Complete PostgreSQL schema (7 tables + seed data)
│   │
│   └── ml/                         # Machine learning integration
│       ├── __init__.py
│       ├── predictor.py            # EcosystemRiskPredictor class & math formulas
│       └── model.py                # Scikit-learn training pipeline blueprint
│
├── .env.example                    # Environment variable template
├── requirements.txt                # Python package dependencies
├── README.md                       # Comprehensive project guide
└── run.py                          # Single-command server launcher
```

---

## 4. How to Install Python Dependencies

### Prerequisites
- Python 3.10+ or Python 3.11+
- `pip` package manager

### Step-by-Step Installation

```bash
# 1. Navigate into the backend directory
cd earthtwin-backend

# 2. Create a virtual environment
python3 -m venv venv

# 3. Activate the virtual environment
# On macOS / Linux:
source venv/bin/activate

# On Windows (Command Prompt):
venv\Scripts\activate.bat

# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# 4. Upgrade pip
pip install --upgrade pip

# 5. Install all dependencies
pip install -r requirements.txt
```

---

## 5. How to Configure Environment Variables (`.env`)

Copy `.env.example` to create your active `.env` file:

```bash
cp .env.example .env
```

Open `.env` in any code editor:

```ini
# Server configuration
PORT=8000
HOST=0.0.0.0
DEBUG=True
ENVIRONMENT=development

# Allowed origins for your React frontend (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000

# Supabase Credentials (Optional for local testing / College demo)
# Leave blank to run in automatic Realistic Mock Mode:
SUPABASE_URL=
SUPABASE_KEY=

# ML Model Configuration (Future expansion)
USE_ML_PREDICTOR=False
ML_MODEL_PATH=./app/ml/models/ecosystem_model.pkl
```

---

## 6. How to Configure Supabase

If you want persistent cloud storage in Supabase:

1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. In the Supabase Project Dashboard, go to **Project Settings** → **API**.
3. Copy the **Project URL** into `SUPABASE_URL` in `.env`.
4. Copy the **anon / public key** or **service_role key** into `SUPABASE_KEY` in `.env`.

> 💡 **College Demo Safety**: If you don't have internet access or haven't configured Supabase yet, the backend automatically detects this and falls back to **Realistic Mock Mode**. Your demo will NEVER fail or crash due to a missing database connection!

---

## 7. How to Create Database Tables

1. Open your Supabase Dashboard.
2. Click on the **SQL Editor** tab on the left sidebar.
3. Open `app/database/schema.sql` from this backend repository.
4. Paste the entire SQL script into the Supabase SQL Editor and click **Run**.
5. It will create all 7 relational tables:
   - `ecosystems`
   - `environment_data`
   - `ecosystem_zones`
   - `predictions`
   - `alerts`
   - `simulation_history`
   - `recommendations`
6. The script also inserts initial seed data for **Bengaluru Forest Zone**, **Cubbon Urban Sanctuary**, **Bellandur Wetland Reserve**, and **Deccan Agricultural Basin**.

---

## 8. How to Start FastAPI

You can start the backend using either of these commands:

### Option A: Using the Launcher Script
```bash
python run.py
```

### Option B: Using Uvicorn Directly
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

You should see output similar to:
```
🌲 Starting EarthTwin Backend on 0.0.0.0:8000
📖 Swagger Docs available at: http://0.0.0.0:8000/docs
✨ Supabase Connected: False (Mock fallback enabled if False)
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 9. How to Access API Documentation

Once the server is running, open your web browser:

- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)  
  *Allows you to test every endpoint with live inputs directly in the browser.*
- **ReDoc Alternative Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON Spec**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 10. How Standalone Mock Mode Works

When `SUPABASE_URL` or `SUPABASE_KEY` is not provided in `.env`:
1. The backend automatically initializes an in-memory repository with realistic ecological data for four diverse biomes:
   - **Bengaluru Forest Zone (`forest-001`)**: Sub-tropical deciduous woodland with 4 distinct micro-climate zones (Zone A Healthy, Zone B Moderate, Zone C High Stress, Zone D Water).
   - **Cubbon Urban Sanctuary (`urban-park-001`)**: Urban botanical haven with traffic margins.
   - **Bellandur Wetland Reserve (`wetland-001`)**: Eutrophication-prone marsh biome.
   - **Deccan Agricultural Basin (`agri-001`)**: Mixed precision-drip and rainfed crop zones.
2. When querying `/api/environment/{id}/history`, realistic diurnal temperature curves and seasonal weather fluctuations are generated mathematically.
3. When running What-If simulations, results are saved to an in-memory history cache so `/api/simulation/history/{id}` immediately reflects newly run scenarios.

---

## 11. How Machine Learning Can Be Added Later

The code is strictly modularized to support replacing rule-based calculations with a trained machine learning model:

### Step 1: Feature Matrix Preparation
In `app/ml/model.py`, the standard feature vector is already established:
- `temperature`, `humidity`, `rainfall`, `soil_moisture`, `vegetation_health`, `air_quality`

### Step 2: Training Your Model (e.g., Random Forest or XGBoost)
You can train a model using Scikit-Learn:
```python
from sklearn.ensemble import RandomForestRegressor
import joblib

# X = features, y = [fire_risk, drought_risk, vegetation_stress, overall_health]
model = RandomForestRegressor(n_estimators=100)
model.fit(X, y)
joblib.dump(model, 'app/ml/models/ecosystem_model.pkl')
```

### Step 3: Activation
1. Place the saved file at `app/ml/models/ecosystem_model.pkl`.
2. In `.env`, set:
   ```ini
   USE_ML_PREDICTOR=True
   ML_MODEL_PATH=./app/ml/models/ecosystem_model.pkl
   ```
3. `app/ml/predictor.py` will automatically load the pickled model on startup and use `.predict()` instead of the heuristic formulas!

---

## 12. How to Connect Your React + TypeScript Frontend

### Step 1: Install Axios or use native `fetch`
In your React frontend directory:
```bash
npm install axios
```

### Step 2: Create an API Client Helper (`src/services/api.ts`)

```typescript
import axios from 'axios';

// Set to your FastAPI backend address
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const earthTwinApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Ecosystems
export const getEcosystems = () => earthTwinApi.get('/api/ecosystems');
export const getEcosystemDetail = (id: string) => earthTwinApi.get(`/api/ecosystems/${id}`);

// 2. Telemetry
export const getLatestEnvironment = (id: string) => earthTwinApi.get(`/api/environment/${id}`);
export const getEnvironmentHistory = (id: string, days = 7) => 
  earthTwinApi.get(`/api/environment/${id}/history?days=${days}`);

// 3. Health & Risks
export const getEcosystemHealth = (id: string) => earthTwinApi.get(`/api/health/${id}`);
export const getEcosystemRisks = (id: string) => earthTwinApi.get(`/api/risks/${id}`);

// 4. What-If Simulation
export interface SimulationParams {
  ecosystem_id: string;
  temperature_change: number;
  rainfall_change: number;
  soil_moisture_change: number;
  humidity_change: number;
}
export const runSimulation = (params: SimulationParams) => 
  earthTwinApi.post('/api/simulation/run', params);
export const getSimulationHistory = (id: string) => 
  earthTwinApi.get(`/api/simulation/history/${id}`);

// 5. Alerts & Recommendations
export const getAlerts = (id: string, severity = 'all') => 
  earthTwinApi.get(`/api/alerts/${id}?severity=${severity}`);
export const getRecommendations = (id: string) => 
  earthTwinApi.get(`/api/recommendations/${id}`);

// 6. AI Assistant
export const askAssistant = (ecosystem_id: string, question: string) => 
  earthTwinApi.post('/api/assistant/ask', { ecosystem_id, question });
```

### Step 3: Example React Component Usage

```tsx
import React, { useEffect, useState } from 'react';
import { getEcosystemHealth, getEcosystemRisks } from './services/api';

export function EcosystemHealthCard({ ecosystemId = 'forest-001' }) {
  const [health, setHealth] = useState<any>(null);
  const [risks, setRisks] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [healthRes, risksRes] = await Promise.all([
          getEcosystemHealth(ecosystemId),
          getEcosystemRisks(ecosystemId),
        ]);
        setHealth(healthRes.data);
        setRisks(risksRes.data);
      } catch (err) {
        console.error('Failed to load EarthTwin data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [ecosystemId]);

  if (loading) return <div>Loading EarthTwin telemetry...</div>;

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl">
      <h2 className="text-xl font-bold">Ecosystem Health: {health?.overall_score}/100</h2>
      <p className="text-emerald-400">{health?.status}</p>
      <p className="text-sm text-slate-300 mt-2">{health?.explanation}</p>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-slate-800 rounded">
          <div className="text-xs text-slate-400">Fire Risk</div>
          <div className="text-lg font-bold text-amber-400">{risks?.fire_risk?.percentage}%</div>
          <div className="text-xs">{risks?.fire_risk?.level}</div>
        </div>
        <div className="p-3 bg-slate-800 rounded">
          <div className="text-xs text-slate-400">Drought Risk</div>
          <div className="text-lg font-bold text-orange-400">{risks?.drought_risk?.percentage}%</div>
          <div className="text-xs">{risks?.drought_risk?.level}</div>
        </div>
      </div>
    </div>
  );
}
```

---

## 13. Example API Requests & Responses

### 1. Health Check
- **Request**:
  ```bash
  curl http://localhost:8000/api/health
  ```
- **Response**:
  ```json
  {
    "status": "online",
    "service": "EarthTwin Backend",
    "version": "1.0.0",
    "mode": "In-Memory Realistic Mock Mode"
  }
  ```

---

### 2. Available Ecosystems Directory
- **Request**:
  ```bash
  curl http://localhost:8000/api/ecosystems
  ```
- **Response**:
  ```json
  [
    {
      "id": "forest-001",
      "name": "Bengaluru Forest Zone",
      "category": "Forest",
      "location": "Bannerghatta National Sanctuary, Bengaluru, Karnataka",
      "latitude": 12.8009,
      "longitude": 77.5777,
      "health_score": 76.0,
      "status": "Healthy",
      "description": "Sub-tropical deciduous and mixed evergreen woodland..."
    },
    {
      "id": "urban-park-001",
      "name": "Cubbon Urban Sanctuary",
      "category": "Urban Park",
      "location": "Central Bengaluru District, Karnataka",
      "latitude": 12.9763,
      "longitude": 77.5929,
      "health_score": 68.0,
      "status": "Moderate Stress",
      "description": "Historical 300-acre botanical haven..."
    }
  ]
  ```

---

### 3. Detailed Ecosystem with Micro-Climate Zones
- **Request**:
  ```bash
  curl http://localhost:8000/api/ecosystems/forest-001
  ```
- **Response**:
  ```json
  {
    "id": "forest-001",
    "name": "Bengaluru Forest Zone",
    "category": "Forest",
    "location": "Bannerghatta National Sanctuary, Bengaluru, Karnataka",
    "latitude": 12.8009,
    "longitude": 77.5777,
    "description": "Sub-tropical deciduous and mixed evergreen woodland...",
    "health_score": 76.0,
    "status": "Healthy",
    "current_environment": {
      "id": "env-forest-001-live",
      "ecosystem_id": "forest-001",
      "timestamp": "2026-10-09T17:20:00Z",
      "temperature": 27.8,
      "humidity": 62.0,
      "rainfall": 14.5,
      "soil_moisture": 48.0,
      "vegetation_health": 78.0,
      "air_quality": 84.0
    },
    "zones": [
      {
        "zone_id": "zone-a",
        "ecosystem_id": "forest-001",
        "zone_name": "Zone A — Healthy Canopy Core",
        "latitude": 12.805,
        "longitude": 77.575,
        "temperature": 26.4,
        "humidity": 66.0,
        "soil_moisture": 56.0,
        "vegetation_health": 88.0,
        "risk_level": "Low"
      },
      {
        "zone_id": "zone-b",
        "ecosystem_id": "forest-001",
        "zone_name": "Zone B — Moderate Stress Slopes",
        "latitude": 12.802,
        "longitude": 77.579,
        "temperature": 28.2,
        "humidity": 59.0,
        "soil_moisture": 45.0,
        "vegetation_health": 74.0,
        "risk_level": "Moderate"
      },
      {
        "zone_id": "zone-c",
        "ecosystem_id": "forest-001",
        "zone_name": "Zone C — High Stress Southern Border",
        "latitude": 12.797,
        "longitude": 77.581,
        "temperature": 30.6,
        "humidity": 49.0,
        "soil_moisture": 36.0,
        "vegetation_health": 58.0,
        "risk_level": "High"
      },
      {
        "zone_id": "zone-d",
        "ecosystem_id": "forest-001",
        "zone_name": "Zone D — Water Catchment Reservoir",
        "latitude": 12.801,
        "longitude": 77.573,
        "temperature": 25.8,
        "humidity": 72.0,
        "soil_moisture": 74.0,
        "vegetation_health": 86.0,
        "risk_level": "Low"
      }
    ]
  }
  ```

---

### 4. Ecosystem Health Evaluation (0-100)
- **Request**:
  ```bash
  curl http://localhost:8000/api/health/forest-001
  ```
- **Response**:
  ```json
  {
    "ecosystem_id": "forest-001",
    "overall_score": 76.0,
    "status": "Healthy",
    "vegetation_health": 78.0,
    "water_condition": 68.0,
    "air_quality": 84.0,
    "soil_condition": 55.2,
    "climate_stability": 91.0,
    "explanation": "The ecosystem is currently healthy, but localized microclimatic shifts and soil moisture variations require continuous telemetry monitoring.",
    "calculation_method": "rule_based_weighted_composite (ready for scikit-learn model replacement)"
  }
  ```

---

### 5. Risk Analysis
- **Request**:
  ```bash
  curl http://localhost:8000/api/risks/forest-001
  ```
- **Response**:
  ```json
  {
    "ecosystem_id": "forest-001",
    "fire_risk": {
      "level": "Medium",
      "percentage": 58.0,
      "explanation": "Moderate fire risk: ambient temperature (27.8°C) and drying canopy litter require heightened watch in outer perimeter sectors."
    },
    "drought_risk": {
      "level": "Moderate",
      "percentage": 52.0,
      "explanation": "Moderate drought stress: evapotranspiration rates exceed soil water recharge, depleting root-zone moisture reserves."
    },
    "vegetation_stress": {
      "level": "Low",
      "percentage": 25.0,
      "explanation": "Vegetation is physiologically vibrant with active transpiration and healthy chlorophyll fluorescence."
    },
    "flood_risk": {
      "level": "Low",
      "percentage": 12.0,
      "explanation": "Low flood potential: permeable soil buffer and standard drainage retain storm surge."
    },
    "methodology": "multivariate_heuristic_v1 (ML model can be connected later)"
  }
  ```

---

### 6. What-If Simulation Run
- **Request**:
  ```bash
  curl -X POST http://localhost:8000/api/simulation/run \
    -H "Content-Type: application/json" \
    -d '{
      "ecosystem_id": "forest-001",
      "temperature_change": 2.0,
      "rainfall_change": -20.0,
      "soil_moisture_change": -15.0,
      "humidity_change": -10.0
    }'
  ```
- **Response**:
  ```json
  {
    "simulation_id": "sim-8e3b1f9c",
    "ecosystem_id": "forest-001",
    "timestamp": "2026-10-09T17:25:00Z",
    "inputs": {
      "temperature_change": 2.0,
      "rainfall_change": -20.0,
      "soil_moisture_change": -15.0,
      "humidity_change": -10.0
    },
    "current": {
      "health": 76.0,
      "fire_risk": 58.0,
      "drought_risk": 52.0,
      "vegetation_health": 78.0
    },
    "simulated": {
      "health": 61.0,
      "fire_risk": 75.0,
      "drought_risk": 72.0,
      "vegetation_health": 65.4
    },
    "deltas": {
      "health_delta": -15.0,
      "fire_risk_delta": 17.0,
      "drought_risk_delta": 20.0,
      "vegetation_health_delta": -12.6
    },
    "explanation": "Temperature increase (+2.0°C) accelerates evapotranspiration. moisture deficit raises drought risk by +20.0% and fire hazard by +17.0%. Overall ecosystem health changes from 76 to 61.",
    "simulation_type": "rule_based_estimate",
    "disclaimer": "Simulation estimate — ML model can be connected later."
  }
  ```

---

### 7. AI Assistant Question & Answer
- **Request**:
  ```bash
  curl -X POST http://localhost:8000/api/assistant/ask \
    -H "Content-Type: application/json" \
    -d '{
      "ecosystem_id": "forest-001",
      "question": "Why is the ecosystem at risk?"
    }'
  ```
- **Response**:
  ```json
  {
    "ecosystem_id": "forest-001",
    "question": "Why is the ecosystem at risk?",
    "answer": "Bengaluru Forest Zone is under environmental pressure due to a combination of factors: soil moisture is currently at 48.0%, while thermal levels (27.8°C) are elevated. Fire risk stands at Medium (58.0%) and drought risk is Moderate (52.0%). Zone C (Southern Border) exhibits the highest physiological stress (58/100 vegetation health).",
    "source": "earthtwin_rule_based_assistant",
    "confidence": 0.94,
    "suggested_follow_ups": [
      "What is the current fire risk?",
      "How can vegetation health be improved?",
      "Why is soil moisture decreasing?"
    ]
  }
  ```

---

## 14. Testing Every Endpoint

A automated smoke-test script is included:

```bash
# Test the backend in one command using python
python -c "
import urllib.request, json
res = urllib.request.urlopen('http://localhost:8000/api/health')
print('Health check:', json.loads(res.read().decode()))
"
```

Or run all standard tests via curl:
```bash
# 1. Health
curl -s http://localhost:8000/api/health | jq .

# 2. Ecosystems
curl -s http://localhost:8000/api/ecosystems | jq .

# 3. Environment history (7 days)
curl -s "http://localhost:8000/api/environment/forest-001/history?days=7" | jq .

# 4. Alerts
curl -s "http://localhost:8000/api/alerts/forest-001?severity=all" | jq .

# 5. Recommendations
curl -s http://localhost:8000/api/recommendations/forest-001 | jq .
```

---

## 15. College Project Viva / Presentation Tips

1. **Why Digital Twin?** Unlike passive IoT sensors that merely show current numbers, EarthTwin maintains a living digital replica with predictive physics/heuristics that lets scientists and rangers simulate "What-If" climate interventions before they happen in nature.
2. **Why Rule-Based First, ML Ready Later?** In ecological monitoring, having transparent, explainable formulas prevents black-box hallucination and gives domain scientists confidence. The modular architecture (`app/ml/predictor.py` and `app/ml/model.py`) makes upgrading to a trained Scikit-Learn or XGBoost model a zero-downtime swap.
3. **Database Fault Tolerance:** Demonstrating that the system gracefully operates on local telemetry even when cloud PostgreSQL credentials are absent proves production-grade resilience.
