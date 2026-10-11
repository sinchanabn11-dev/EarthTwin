"""
EarthTwin — Risk Analysis & Ecosystem Health Service
Location: app/services/risk_service.py

Computes composite health score and multivariate risks (Fire, Drought,
Vegetation Stress, Flood) using the EcosystemRiskPredictor engine.
"""

from typing import Optional
from app.models.risk import HealthScoreResponse, RiskAnalysisResponse, RiskDetail
from app.services.environment_service import environment_service
from app.ml.predictor import predictor


class RiskService:
    def calculate_health(self, ecosystem_id: str) -> Optional[HealthScoreResponse]:
        """Calculates ecosystem health score across 5 key ecological pillars."""
        env = environment_service.get_latest_environment(ecosystem_id)
        if not env:
            return None

        # Derive sub-factor scores
        vegetation_health = env.vegetation_health
        soil_condition = min(100.0, max(0.0, env.soil_moisture * 1.15))
        air_quality = env.air_quality

        # Water condition derived from rainfall balance and soil saturation
        water_condition = min(100.0, max(15.0, (env.soil_moisture * 0.7) + (min(50.0, env.rainfall * 2.2) * 0.3)))

        # Climate stability derived from temperature and humidity equilibrium
        temp_dev = abs(env.temperature - 25.0)
        humidity_dev = abs(env.humidity - 60.0)
        climate_stability = max(10.0, min(100.0, 100.0 - (temp_dev * 2.8) - (humidity_dev * 0.6)))

        overall_score, status, explanation = predictor.predict_ecosystem_health(
            vegetation_health=vegetation_health,
            water_condition=water_condition,
            air_quality=air_quality,
            soil_condition=soil_condition,
            climate_stability=climate_stability
        )

        return HealthScoreResponse(
            ecosystem_id=ecosystem_id,
            overall_score=overall_score,
            status=status,
            vegetation_health=round(vegetation_health, 1),
            water_condition=round(water_condition, 1),
            air_quality=round(air_quality, 1),
            soil_condition=round(soil_condition, 1),
            climate_stability=round(climate_stability, 1),
            explanation=explanation,
            calculation_method="rule_based_weighted_composite (ready for scikit-learn model replacement)"
        )

    def calculate_risks(self, ecosystem_id: str) -> Optional[RiskAnalysisResponse]:
        """Calculates Fire Risk, Drought Risk, Vegetation Stress, and Flood Risk."""
        env = environment_service.get_latest_environment(ecosystem_id)
        if not env:
            return None

        # 1. Fire Risk
        fire_score, fire_level, fire_exp = predictor.predict_fire_risk(
            temperature=env.temperature,
            humidity=env.humidity,
            soil_moisture=env.soil_moisture,
            rainfall=env.rainfall,
            vegetation_health=env.vegetation_health
        )

        # 2. Drought Risk
        drought_score, drought_level, drought_exp = predictor.predict_drought_risk(
            temperature=env.temperature,
            rainfall=env.rainfall,
            soil_moisture=env.soil_moisture,
            humidity=env.humidity
        )

        # 3. Vegetation Stress
        veg_stress_score, veg_level, veg_exp = predictor.predict_vegetation_stress(
            soil_moisture=env.soil_moisture,
            temperature=env.temperature,
            rainfall=env.rainfall,
            air_quality=env.air_quality,
            current_veg_health=env.vegetation_health
        )

        # 4. Flood Risk
        flood_score, flood_level, flood_exp = predictor.predict_flood_risk(
            rainfall=env.rainfall,
            soil_moisture=env.soil_moisture,
            humidity=env.humidity
        )

        return RiskAnalysisResponse(
            ecosystem_id=ecosystem_id,
            fire_risk=RiskDetail(level=fire_level, percentage=fire_score, explanation=fire_exp),
            drought_risk=RiskDetail(level=drought_level, percentage=drought_score, explanation=drought_exp),
            vegetation_stress=RiskDetail(level=veg_level, percentage=veg_stress_score, explanation=veg_exp),
            flood_risk=RiskDetail(level=flood_level, percentage=flood_score, explanation=flood_exp),
            methodology="multivariate_heuristic_v1 (ML model can be connected later)"
        )


risk_service = RiskService()
