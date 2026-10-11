"""
EarthTwin — What-If Simulation Engine Service
Location: app/services/simulation_service.py

Simulates prospective climate change and stress scenarios:
Calculates simulated ecosystem health, fire risk, drought risk, and vegetation health.
Maintains history of simulation runs.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional
from app.models.simulation import (
    SimulationRequest,
    SimulationResponse,
    SimulationMetrics,
    SimulationHistoryItem
)
from app.services.environment_service import environment_service
from app.services.risk_service import risk_service
from app.ml.predictor import predictor
from app.database.supabase_client import supabase_service
import logging

logger = logging.getLogger("earthtwin.service.simulation")

# In-memory history cache
_SIMULATION_HISTORY: List[SimulationHistoryItem] = []


class SimulationService:
    def run_simulation(self, request: SimulationRequest) -> Optional[SimulationResponse]:
        """
        Executes a What-If climate simulation scenario against the baseline digital twin.
        """
        env = environment_service.get_latest_environment(request.ecosystem_id)
        if not env:
            return None

        # 1. Compute current baseline metrics
        health_resp = risk_service.calculate_health(request.ecosystem_id)
        risk_resp = risk_service.calculate_risks(request.ecosystem_id)
        
        if not health_resp or not risk_resp:
            return None

        current_metrics = SimulationMetrics(
            health=health_resp.overall_score,
            fire_risk=risk_resp.fire_risk.percentage,
            drought_risk=risk_resp.drought_risk.percentage,
            vegetation_health=env.vegetation_health
        )

        # 2. Derive simulated environmental variables
        sim_temp = env.temperature + request.temperature_change
        sim_rainfall = max(0.0, env.rainfall * (1.0 + (request.rainfall_change / 100.0)))
        sim_soil = max(2.0, min(98.0, env.soil_moisture * (1.0 + (request.soil_moisture_change / 100.0))))
        sim_humidity = max(10.0, min(98.0, env.humidity * (1.0 + (request.humidity_change / 100.0))))

        # Simulated vegetation responds to soil moisture & temperature delta
        veg_impact = (request.soil_moisture_change * 0.35) + (request.rainfall_change * 0.15) - (max(0.0, request.temperature_change) * 2.2)
        sim_veg = predictor.clamp(env.vegetation_health + veg_impact, 5.0, 98.0)

        # 3. Predict simulated risks using the Predictor
        sim_fire_score, _, _ = predictor.predict_fire_risk(
            temperature=sim_temp,
            humidity=sim_humidity,
            soil_moisture=sim_soil,
            rainfall=sim_rainfall,
            vegetation_health=sim_veg
        )

        sim_drought_score, _, _ = predictor.predict_drought_risk(
            temperature=sim_temp,
            rainfall=sim_rainfall,
            soil_moisture=sim_soil,
            humidity=sim_humidity
        )

        # 4. Predict simulated composite health
        sim_water = predictor.clamp((sim_soil * 0.7) + (min(50.0, sim_rainfall * 2.2) * 0.3), 5.0, 100.0)
        sim_soil_cond = predictor.clamp(sim_soil * 1.15, 5.0, 100.0)
        sim_climate_stab = predictor.clamp(
            100.0 - (abs(sim_temp - 25.0) * 2.8) - (abs(sim_humidity - 60.0) * 0.6), 5.0, 100.0
        )

        sim_health_score, _, _ = predictor.predict_ecosystem_health(
            vegetation_health=sim_veg,
            water_condition=sim_water,
            air_quality=env.air_quality,
            soil_condition=sim_soil_cond,
            climate_stability=sim_climate_stab
        )

        simulated_metrics = SimulationMetrics(
            health=sim_health_score,
            fire_risk=sim_fire_score,
            drought_risk=sim_drought_score,
            vegetation_health=sim_veg
        )

        # 5. Formulate human explanation of deltas
        health_delta = round(sim_health_score - current_metrics.health, 1)
        fire_delta = round(sim_fire_score - current_metrics.fire_risk, 1)
        drought_delta = round(sim_drought_score - current_metrics.drought_risk, 1)

        explanation_parts = []
        if request.temperature_change > 0:
            explanation_parts.append(f"Temperature increase (+{request.temperature_change}°C) accelerates evapotranspiration")
        elif request.temperature_change < 0:
            explanation_parts.append(f"Cooler temperature ({request.temperature_change}°C) eases thermal stress")

        if request.rainfall_change < 0 or request.soil_moisture_change < 0:
            explanation_parts.append(f"moisture deficit raises drought risk by {abs(drought_delta):+.1f}% and fire hazard by {abs(fire_delta):+.1f}%")
        else:
            explanation_parts.append(f"moisture replenishment enhances overall canopy resilience by {health_delta:+.1f} points")

        explanation = ". ".join(explanation_parts) + f". Overall ecosystem health changes from {current_metrics.health:.0f} to {simulated_metrics.health:.0f}."

        sim_id = f"sim-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # 6. Save to history
        history_item = SimulationHistoryItem(
            id=sim_id,
            ecosystem_id=request.ecosystem_id,
            timestamp=now_iso,
            temperature_change=request.temperature_change,
            rainfall_change=request.rainfall_change,
            soil_moisture_change=request.soil_moisture_change,
            humidity_change=request.humidity_change,
            current_health=current_metrics.health,
            simulated_health=simulated_metrics.health,
            current_fire_risk=current_metrics.fire_risk,
            simulated_fire_risk=simulated_metrics.fire_risk,
            current_drought_risk=current_metrics.drought_risk,
            simulated_drought_risk=simulated_metrics.drought_risk,
            explanation=explanation
        )
        _SIMULATION_HISTORY.insert(0, history_item)

        # Attempt writing to Supabase if connected
        client = supabase_service.get_client()
        if client:
            try:
                client.table("simulation_history").insert(history_item.dict()).execute()
            except Exception as e:
                logger.warning(f"Could not persist simulation to Supabase: {e}")

        return SimulationResponse(
            simulation_id=sim_id,
            ecosystem_id=request.ecosystem_id,
            timestamp=now_iso,
            inputs={
                "temperature_change": request.temperature_change,
                "rainfall_change": request.rainfall_change,
                "soil_moisture_change": request.soil_moisture_change,
                "humidity_change": request.humidity_change,
            },
            current=current_metrics,
            simulated=simulated_metrics,
            deltas={
                "health_delta": health_delta,
                "fire_risk_delta": fire_delta,
                "drought_risk_delta": drought_delta,
                "vegetation_health_delta": round(sim_veg - current_metrics.vegetation_health, 1)
            },
            explanation=explanation,
            simulation_type="rule_based_estimate",
            disclaimer="Simulation estimate — ML model can be connected later."
        )

    def get_history(self, ecosystem_id: str, limit: int = 10) -> List[SimulationHistoryItem]:
        """Retrieves past simulation runs for the specified ecosystem."""
        client = supabase_service.get_client()
        if client:
            try:
                res = (
                    client.table("simulation_history")
                    .select("*")
                    .eq("ecosystem_id", ecosystem_id)
                    .order("timestamp", desc=True)
                    .limit(limit)
                    .execute()
                )
                if res.data:
                    return [SimulationHistoryItem(**row) for row in res.data]
            except Exception as e:
                logger.warning(f"Error reading simulation history from Supabase: {e}")

        # Fallback to in-memory history cache
        return [item for item in _SIMULATION_HISTORY if item.ecosystem_id == ecosystem_id][:limit]


simulation_service = SimulationService()
