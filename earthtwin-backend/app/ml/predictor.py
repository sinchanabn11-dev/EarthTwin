"""
EarthTwin — ML & Rule-Based Predictor Architecture
Location: app/ml/predictor.py

This module contains the `EcosystemRiskPredictor` engine.
It currently implements transparent mathematical formulas for the preliminary
college project phase, designed with exact feature vectors so that a trained
scikit-learn or XGBoost model can be dropped in seamlessly in phase 2.
"""

import os
import math
from typing import Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger("earthtwin.ml")

# Optional scikit-learn / joblib import for future model loading
try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False


class EcosystemRiskPredictor:
    """
    Multivariate Predictor for Outdoor Ecosystem Risks & Composite Health.
    
    Inputs:
        - temperature (°C)
        - humidity (%)
        - rainfall (mm)
        - soil_moisture (%)
        - vegetation_health (0-100)
        - air_quality (0-100)
        
    Outputs:
        - fire_risk (%)
        - drought_risk (%)
        - vegetation_stress (%)
        - flood_risk (%)
        - overall_ecosystem_health (0-100)
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.ml_model = None
        self.is_ml_loaded = False
        
        # Check if pre-trained scikit-learn model exists on disk
        if model_path and os.path.exists(model_path) and JOBLIB_AVAILABLE:
            try:
                # -------------------------------------------------------------
                # FUTURE ML INTEGRATION HOOK:
                # To activate a trained model:
                # 1. Train a model with scikit-learn (e.g. RandomForestRegressor)
                # 2. Save it using: joblib.dump(model, 'ecosystem_model.pkl')
                # 3. Set USE_ML_PREDICTOR=True in .env
                # -------------------------------------------------------------
                self.ml_model = joblib.load(model_path)
                self.is_ml_loaded = True
                logger.info(f"Loaded trained ML model from {model_path}")
            except Exception as e:
                logger.warning(f"Could not load ML model from {model_path}: {e}. Using rule-based formulas.")

    @staticmethod
    def clamp(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
        """Helper to bound calculations between 0 and 100."""
        return max(min_val, min(max_val, round(value, 2)))

    def predict_fire_risk(
        self,
        temperature: float,
        humidity: float,
        soil_moisture: float,
        rainfall: float,
        vegetation_health: float
    ) -> Tuple[float, str, str]:
        """
        Calculate Fire Risk percentage (0-100%), level, and explanation.
        
        Formula considerations:
        - High temperature increases ignition probability.
        - Low humidity (<40%) dries volatile organics.
        - Depleted soil moisture (<35%) desiccates leaf litter.
        - High dead fuel / low vegetation vigor can amplify combustion speed.
        """
        # Baseline temperature hazard (>25°C accelerates exponentially)
        temp_factor = max(0.0, (temperature - 20.0) * 3.5)
        
        # Dryness hazard from low humidity
        humidity_factor = max(0.0, (65.0 - humidity) * 1.1)
        
        # Desiccation hazard from depleted soil moisture
        soil_factor = max(0.0, (55.0 - soil_moisture) * 1.3)
        
        # Recent precipitation suppression
        rain_suppression = min(35.0, rainfall * 1.8)
        
        # Composite score
        raw_fire_risk = (temp_factor * 0.40) + (humidity_factor * 0.35) + (soil_factor * 0.35) - rain_suppression
        score = self.clamp(raw_fire_risk, 5.0, 98.0)

        # Categorization
        if score >= 75.0:
            level = "High"
            explanation = f"Critical fire hazard: elevated temperature ({temperature}°C) coupled with depleted soil moisture ({soil_moisture}%) and low humidity creates combustible conditions."
        elif score >= 50.0:
            level = "Medium"
            explanation = f"Moderate fire risk: ambient temperature ({temperature}°C) and drying canopy litter require heightened watch in outer perimeter sectors."
        elif score >= 30.0:
            level = "Moderate"
            explanation = f"Low-to-moderate fire potential: humidity is within acceptable thresholds ({humidity}%), but sustained heat could elevate risk."
        else:
            level = "Low"
            explanation = "Low fire hazard: adequate precipitation, high ambient humidity, and moist organic ground layer suppress ignition."

        return score, level, explanation

    def predict_drought_risk(
        self,
        temperature: float,
        rainfall: float,
        soil_moisture: float,
        humidity: float
    ) -> Tuple[float, str, str]:
        """
        Calculate Drought Risk percentage (0-100%), level, and explanation.
        """
        # Moisture deficit
        soil_deficit = max(0.0, (60.0 - soil_moisture) * 1.25)
        rain_deficit = max(0.0, (25.0 - rainfall) * 1.6)
        evapotranspiration = max(0.0, (temperature - 22.0) * 1.8) + max(0.0, (55.0 - humidity) * 0.8)

        raw_drought = (soil_deficit * 0.45) + (rain_deficit * 0.35) + (evapotranspiration * 0.20)
        score = self.clamp(raw_drought, 5.0, 95.0)

        if score >= 70.0:
            level = "High"
            explanation = f"Severe moisture deficit: cumulative rainfall ({rainfall}mm) and soil moisture ({soil_moisture}%) indicate advancing hydrological drought."
        elif score >= 45.0:
            level = "Moderate"
            explanation = f"Moderate drought stress: evapotranspiration rates exceed soil water recharge, depleting root-zone moisture reserves."
        elif score >= 25.0:
            level = "Low"
            explanation = "Marginal dry spell detected; subsoil reserves currently sustain native vegetation canopy."
        else:
            level = "Minimal"
            explanation = "Adequate water balance: rainfall replenishment meets vegetative transpiration demand."

        return score, level, explanation

    def predict_vegetation_stress(
        self,
        soil_moisture: float,
        temperature: float,
        rainfall: float,
        air_quality: float,
        current_veg_health: float
    ) -> Tuple[float, str, str]:
        """
        Calculate Vegetation Stress percentage (0-100%).
        """
        moisture_stress = max(0.0, (50.0 - soil_moisture) * 1.3)
        thermal_stress = max(0.0, (temperature - 30.0) * 2.2) if temperature > 30 else max(0.0, (12.0 - temperature) * 2.0)
        pollution_stress = max(0.0, (70.0 - air_quality) * 0.6)
        health_inversion = max(0.0, 100.0 - current_veg_health)

        raw_stress = (moisture_stress * 0.35) + (thermal_stress * 0.25) + (health_inversion * 0.30) + (pollution_stress * 0.10)
        score = self.clamp(raw_stress, 5.0, 95.0)

        if score >= 65.0:
            level = "High"
            explanation = f"Elevated canopy stress: photosynthetic vigor compromised by soil desiccation ({soil_moisture}%) and thermal strain."
        elif score >= 35.0:
            level = "Moderate"
            explanation = f"Moderate botanical stress: minor leaf chlorosis or moisture conservation stomatal closure occurring in dry zones."
        else:
            level = "Low"
            explanation = "Vegetation is physiologically vibrant with active transpiration and healthy chlorophyll fluorescence."

        return score, level, explanation

    def predict_flood_risk(
        self,
        rainfall: float,
        soil_moisture: float,
        humidity: float
    ) -> Tuple[float, str, str]:
        """
        Calculate Flood / Runoff Risk percentage (0-100%).
        """
        # High rainfall + saturated soil = immediate runoff / flooding
        rain_surge = max(0.0, (rainfall - 25.0) * 1.8)
        soil_saturation = max(0.0, (soil_moisture - 70.0) * 1.6)

        raw_flood = (rain_surge * 0.60) + (soil_saturation * 0.40)
        score = self.clamp(raw_flood, 4.0, 95.0)

        if score >= 65.0:
            level = "High"
            explanation = f"Saturated soil capacity ({soil_moisture}%) and intense precipitation ({rainfall}mm) indicate imminent overland flash flooding."
        elif score >= 35.0:
            level = "Moderate"
            explanation = "Local water accumulation along riparian borders and drainage channels during prolonged rain."
        else:
            level = "Low"
            explanation = "Low flood potential: permeable soil buffer and standard drainage retain storm surge."

        return score, level, explanation

    def predict_ecosystem_health(
        self,
        vegetation_health: float,
        water_condition: float,
        air_quality: float,
        soil_condition: float,
        climate_stability: float
    ) -> Tuple[float, str, str]:
        """
        Composite ecosystem health score from 0-100.
        Weights:
        - Vegetation: 30%
        - Soil: 25%
        - Water: 20%
        - Climate Stability: 15%
        - Air Quality: 10%
        """
        composite = (
            (vegetation_health * 0.30) +
            (soil_condition * 0.25) +
            (water_condition * 0.20) +
            (climate_stability * 0.15) +
            (air_quality * 0.10)
        )
        score = self.clamp(composite, 0.0, 100.0)

        if score >= 80.0:
            status = "Healthy"
            explanation = "The ecosystem exhibits resilient biological diversity, robust canopy vigor, and balanced soil hydrology."
        elif score >= 65.0:
            status = "Healthy"
            explanation = "The ecosystem is currently healthy, but localized microclimatic shifts and soil moisture variations require continuous telemetry monitoring."
        elif score >= 50.0:
            status = "Moderate Stress"
            explanation = "Noticeable environmental stress detected in sub-zones: declining moisture or elevated heat indicates vulnerability."
        elif score >= 35.0:
            status = "High Stress"
            explanation = "Ecosystem resilience degraded: multi-factor stressors threaten botanical regeneration and microfauna habitats."
        else:
            status = "Critical"
            explanation = "Critical ecological instability: immediate restorative interventions required to prevent irreversible habitat collapse."

        return score, status, explanation


# Global singleton instance
predictor = EcosystemRiskPredictor()
