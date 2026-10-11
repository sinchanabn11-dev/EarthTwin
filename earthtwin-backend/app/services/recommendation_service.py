"""
EarthTwin — AI Recommendations Service
Location: app/services/recommendation_service.py

Dynamically generates prioritized mitigation recommendations based on real-time
telemetry, zone stresses, and risk scores.
"""

from typing import List, Optional
from datetime import datetime, timezone
from app.models.recommendation import RecommendationItem, RecommendationsResponse
from app.services.environment_service import environment_service
from app.services.risk_service import risk_service


class RecommendationService:
    def get_recommendations(self, ecosystem_id: str) -> Optional[RecommendationsResponse]:
        """Dynamically generates prioritized ecological recommendations."""
        env = environment_service.get_latest_environment(ecosystem_id)
        if not env:
            return None

        risks = risk_service.calculate_risks(ecosystem_id)
        health = risk_service.calculate_health(ecosystem_id)
        
        now = datetime.now(timezone.utc).isoformat()
        items: List[RecommendationItem] = []

        # 1. Fire prevention recommendation if fire risk is elevated or temperature high
        if risks and risks.fire_risk.percentage >= 45.0:
            priority = "high" if risks.fire_risk.percentage >= 65.0 else "medium"
            items.append(
                RecommendationItem(
                    id=f"rec-{ecosystem_id}-fire",
                    ecosystem_id=ecosystem_id,
                    title="Monitor dry vegetation & establish perimeter firebreaks",
                    recommendation="High-temperature periods and dry combustible understory increase ignition susceptibility. Intensify thermal drone patrols along boundary sectors and clear dead brush along public buffer trails.",
                    priority=priority,
                    category="Fire Prevention",
                    target_zone="Zone C — High Stress Southern Border",
                    expected_impact="Reduces uncontrolled wildfire ignition risk by up to 40% along perimeter lines.",
                    created_at=now
                )
            )

        # 2. Soil moisture & irrigation recommendation
        if env.soil_moisture < 45.0:
            items.append(
                RecommendationItem(
                    id=f"rec-{ecosystem_id}-soil",
                    ecosystem_id=ecosystem_id,
                    title="Implement targeted drip irrigation & retention check-dams",
                    recommendation=f"Soil moisture has fallen to {env.soil_moisture}%. Prioritize micro-catchment trenches and organic biomass mulching to retard evaporation and recharge subterranean root zones.",
                    priority="high" if env.soil_moisture < 35.0 else "medium",
                    category="Irrigation & Soil",
                    target_zone="Zone B & Zone C",
                    expected_impact="Arrests topsoil moisture depletion and maintains minimum microbial hydration.",
                    created_at=now
                )
            )

        # 3. Stressed zone restoration
        if health and health.overall_score < 70.0:
            items.append(
                RecommendationItem(
                    id=f"rec-{ecosystem_id}-restoration",
                    ecosystem_id=ecosystem_id,
                    title="Prioritize stressed ecosystem zones for assisted restoration",
                    recommendation="Satellite and IoT sensor records indicate declining photosynthetic vitality in degraded sectors. Introduce native drought-tolerant saplings (e.g., Ficus, Pongamia, Acacia) to reinforce canopy density.",
                    priority="high",
                    category="Restoration",
                    target_zone="Zone C — High Stress Sectors",
                    expected_impact="Gradually raises canopy index and reduces thermal exposure by 2.5°C over subsequent seasons.",
                    created_at=now
                )
            )
        else:
            items.append(
                RecommendationItem(
                    id=f"rec-{ecosystem_id}-conserve",
                    ecosystem_id=ecosystem_id,
                    title="Consider preventative water conservation measures",
                    recommendation="While overall health is satisfactory, maintaining water table equilibrium will buffer against upcoming seasonal dry spells. Regulate spillway sluices in catchment zones.",
                    priority="low",
                    category="Conservation",
                    target_zone="Zone D — Water Catchment Reservoir",
                    expected_impact="Preserves 18% additional reservoir reserve for dry-season baseflow maintenance.",
                    created_at=now
                )
            )

        # 4. Sensor telemetry calibration recommendation
        items.append(
            RecommendationItem(
                id=f"rec-{ecosystem_id}-monitoring",
                ecosystem_id=ecosystem_id,
                title="Increase continuous sensor telemetry polling frequency",
                recommendation="Accelerate optical multispectral drone scans to 48-hour intervals to detect early stomatal closure and subtle nitrogen stress before visible canopy browning occurs.",
                priority="low",
                category="Monitoring",
                target_zone="All Micro-Climate Sectors",
                expected_impact="Enables early 72-hour warning lead times for critical botanical stress events.",
                created_at=now
            )
        )

        return RecommendationsResponse(
            ecosystem_id=ecosystem_id,
            total=len(items),
            recommendations=items
        )


recommendation_service = RecommendationService()
