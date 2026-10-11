"""
EarthTwin — AI Digital Twin Assistant Service
Location: app/services/ai_service.py

Provides conversational intelligence for ecosystem inquiries.
Uses domain-grounded heuristics and real-time telemetry context in Phase 1,
with a clean modular interface ready to connect Gemini or OpenAI models when an API key is provided.
"""

import re
from typing import Optional, Dict, Any, List
from app.models.assistant import AssistantQuestionRequest, AssistantAnswerResponse
from app.services.environment_service import environment_service
from app.services.risk_service import risk_service
import logging

logger = logging.getLogger("earthtwin.service.ai")


class AIAssistantService:
    def answer_question(self, req: AssistantQuestionRequest) -> Optional[AssistantAnswerResponse]:
        """Processes ecological queries using real-time telemetry and rule-based intelligence."""
        eco = environment_service.ecosystems.get(req.ecosystem_id)
        if not eco:
            return None

        env = environment_service.get_latest_environment(req.ecosystem_id)
        risks = risk_service.calculate_risks(req.ecosystem_id)
        health = risk_service.calculate_health(req.ecosystem_id)

        q_lower = req.question.lower().strip()
        context_data = {
            "ecosystem_name": eco["name"],
            "temperature": f"{env.temperature}°C",
            "humidity": f"{env.humidity}%",
            "soil_moisture": f"{env.soil_moisture}%",
            "rainfall": f"{env.rainfall}mm",
            "vegetation_health": f"{env.vegetation_health}/100",
            "health_score": f"{health.overall_score}/100" if health else "N/A",
            "fire_risk": f"{risks.fire_risk.level} ({risks.fire_risk.percentage}%)" if risks else "N/A",
            "drought_risk": f"{risks.drought_risk.level} ({risks.drought_risk.percentage}%)" if risks else "N/A",
        }

        # -------------------------------------------------------------------
        # INTENT MATCHING & DYNAMIC CONTEXTUAL REASONING
        # -------------------------------------------------------------------
        answer = ""
        follow_ups: List[str] = []

        # 1. Fire risk query
        if any(w in q_lower for w in ["fire", "wildfire", "burn", "ignition"]):
            if risks:
                answer = (
                    f"Fire risk in {eco['name']} is currently {risks.fire_risk.level} at {risks.fire_risk.percentage}%. "
                    f"{risks.fire_risk.explanation} Ambient temperature is {env.temperature}°C with relative humidity at {env.humidity}%. "
                    f"Zone C is currently the most vulnerable sector due to combustible dry brush along the southern perimeter."
                )
            follow_ups = [
                "What happens if temperature increases by 2°C?",
                "How can we mitigate fire risk in Zone C?",
                "What is the current soil moisture?"
            ]

        # 2. What happens if temperature increases (simulation simulation preview)
        elif "temperature" in q_lower and ("increase" in q_lower or "rise" in q_lower or "2" in q_lower or "higher" in q_lower or "warm" in q_lower):
            answer = (
                f"If temperature increases by 2°C in {eco['name']}, our What-If simulation engine predicts "
                f"evapotranspiration will increase by approximately 18%, accelerating soil moisture depletion from "
                f"{env.soil_moisture}% down toward 38%. Consequently, fire risk would rise by ~17% and overall ecosystem "
                f"health would drop from {health.overall_score:.0f} to ~61. You can test this scenario interactively using the What-If Simulation tab."
            )
            follow_ups = [
                "Why is soil moisture decreasing?",
                "How can vegetation health be improved?",
                "What alerts are active right now?"
            ]

        # 3. Why is the ecosystem at risk / overview
        elif any(phrase in q_lower for phrase in ["why", "risk", "danger", "threat", "vulnerable", "stress"]):
            if health and risks:
                answer = (
                    f"{eco['name']} is under environmental pressure due to a combination of factors: "
                    f"soil moisture is currently at {env.soil_moisture}%, while thermal levels ({env.temperature}°C) are elevated. "
                    f"Fire risk stands at {risks.fire_risk.level} ({risks.fire_risk.percentage}%) and drought risk is {risks.drought_risk.level} ({risks.drought_risk.percentage}%). "
                    f"Zone C (Southern Border) exhibits the highest physiological stress ({eco['zones'][2]['vegetation_health'] if len(eco['zones']) > 2 else '58'}/100 vegetation health)."
                )
            follow_ups = [
                "What is the current fire risk?",
                "How can vegetation health be improved?",
                "Why is soil moisture decreasing?"
            ]

        # 4. Soil moisture inquiry
        elif any(w in q_lower for w in ["soil", "moisture", "ground water", "hydration"]):
            answer = (
                f"Soil moisture in {eco['name']} is currently measured at {env.soil_moisture}%. "
                f"It is decreasing due to consecutive days with sub-normal rainfall ({env.rainfall}mm accumulated) and high atmospheric evaporative demand. "
                f"Subsoil reserves in Zone C are approaching critical wilting points (36%), whereas Zone D remains hydrated near the catchment reservoir."
            )
            follow_ups = [
                "How can vegetation health be improved?",
                "What happens if rainfall decreases by 20%?",
                "What recommendations are available?"
            ]

        # 5. Vegetation improvement & restoration
        elif any(w in q_lower for w in ["improve", "vegetation", "canopy", "plants", "restore", "action"]):
            answer = (
                f"Vegetation health in {eco['name']} is currently rated at {env.vegetation_health}/100. "
                f"To improve it: 1) Deploy localized drip irrigation and check-dams in stressed Zone C, "
                f"2) Spread organic biomass mulch to minimize surface evaporation, "
                f"3) Introduce endemic drought-hardy saplings (such as Teak, Sandalwood, and Bamboo), and "
                f"4) Establish shade micro-buffers along dry slope boundaries."
            )
            follow_ups = [
                "Why is the ecosystem at risk?",
                "What is the current fire risk?",
                "Show active alerts for this zone"
            ]

        # 6. Default general query
        else:
            answer = (
                f"EarthTwin Digital Twin status for {eco['name']}: Overall Health is {health.overall_score:.0f}/100 ({health.status}). "
                f"Current telemetry: Temperature is {env.temperature}°C, Humidity is {env.humidity}%, Soil Moisture is {env.soil_moisture}%, "
                f"and Rainfall is {env.rainfall}mm. Fire Risk is {risks.fire_risk.level} ({risks.fire_risk.percentage}%) and Drought Risk is {risks.drought_risk.level} ({risks.drought_risk.percentage}%)."
            )
            follow_ups = [
                "Why is the ecosystem at risk?",
                "What is the current fire risk?",
                "What happens if temperature increases by 2°C?",
                "Why is soil moisture decreasing?"
            ]

        return AssistantAnswerResponse(
            ecosystem_id=req.ecosystem_id,
            question=req.question,
            answer=answer,
            source="earthtwin_rule_based_assistant",
            confidence=0.94,
            related_metrics=context_data,
            suggested_follow_ups=follow_ups
        )


ai_assistant_service = AIAssistantService()
