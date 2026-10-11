"""
EarthTwin — Alert System Routes
"""

from fastapi import APIRouter, HTTPException, Path, Query
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from app.models.alert import AlertItem, AlertsResponse
from app.services.environment_service import environment_service
from app.services.risk_service import risk_service
from app.database.supabase_client import supabase_service

router = APIRouter(prefix="/api/alerts", tags=["Alert System"])


@router.get(
    "/{ecosystem_id}",
    response_model=AlertsResponse,
    summary="Get Environmental Alerts for Ecosystem",
    description="Returns active environmental alerts filtered by severity (all, critical, warning, information)."
)
async def get_alerts(
    ecosystem_id: str = Path(..., description="Ecosystem ID (e.g. forest-001)"),
    severity: str = Query("all", description="Filter by severity: all, critical, warning, information")
):
    eco = environment_service.ecosystems.get(ecosystem_id)
    if not eco:
        raise HTTPException(status_code=404, detail=f"Ecosystem '{ecosystem_id}' not found.")

    severity_filter = severity.lower().strip()
    if severity_filter not in ["all", "critical", "warning", "information"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid severity filter '{severity}'. Allowed: all, critical, warning, information."
        )

    alerts: List[AlertItem] = []
    
    # 1. Check Supabase table first if connected
    client = supabase_service.get_client()
    if client:
        try:
            q = client.table("alerts").select("*").eq("ecosystem_id", ecosystem_id)
            if severity_filter != "all":
                q = q.eq("severity", severity_filter)
            res = q.order("timestamp", desc=True).execute()
            if res.data and len(res.data) > 0:
                for row in res.data:
                    alerts.append(AlertItem(**row))
                return AlertsResponse(
                    ecosystem_id=ecosystem_id,
                    filter_applied=severity_filter,
                    total_alerts=len(alerts),
                    alerts=alerts
                )
        except Exception:
            pass  # Fall through to dynamic generator

    # 2. Dynamic alerts based on current telemetry & zones
    env = environment_service.get_latest_environment(ecosystem_id)
    risks = risk_service.calculate_risks(ecosystem_id)
    now = datetime.now(timezone.utc)

    if env and risks:
        # Fire risk alert
        if risks.fire_risk.percentage >= 50.0:
            alerts.append(
                AlertItem(
                    id=f"alt-{ecosystem_id}-fire",
                    ecosystem_id=ecosystem_id,
                    type="Fire Risk Increasing",
                    severity="warning" if risks.fire_risk.percentage < 75.0 else "critical",
                    location="Zone C — Southern Border Scrub",
                    timestamp=(now - timedelta(hours=2)).isoformat(),
                    description=f"Temperature has increased to {env.temperature}°C and soil moisture has fallen below 40% ({env.soil_moisture}%).",
                    recommended_action="Deploy localized misting and increase thermal drone patrols across boundary sectors."
                )
            )

        # Soil moisture warning
        if env.soil_moisture < 45.0:
            alerts.append(
                AlertItem(
                    id=f"alt-{ecosystem_id}-soil",
                    ecosystem_id=ecosystem_id,
                    type="Soil Moisture Warning",
                    severity="warning",
                    location="Zone C & Perimeter Slopes",
                    timestamp=(now - timedelta(hours=5)).isoformat(),
                    description=f"Water availability is decreasing in Zone C. Soil moisture depleted to {env.soil_moisture}%.",
                    recommended_action="Initiate auxiliary check-dam retention releases into southern drainage gullies."
                )
            )

        # Vegetation stress alert
        if env.vegetation_health < 80.0:
            alerts.append(
                AlertItem(
                    id=f"alt-{ecosystem_id}-veg",
                    ecosystem_id=ecosystem_id,
                    type="Vegetation Stress",
                    severity="information",
                    location="Zone B — Moderate Slopes",
                    timestamp=(now - timedelta(days=1)).isoformat(),
                    description="Vegetation health has decreased by ~6-8% during the last 7 days under thermal strain.",
                    recommended_action="Sample soil nutrient levels and prioritize organic mulch coverage across exposed roots."
                )
            )

        # Flood / Runoff check
        if env.rainfall > 20.0 or env.soil_moisture > 80.0:
            alerts.append(
                AlertItem(
                    id=f"alt-{ecosystem_id}-flood",
                    ecosystem_id=ecosystem_id,
                    type="Runoff & Siltation Risk",
                    severity="warning",
                    location="Zone D — Catchment Basin",
                    timestamp=(now - timedelta(hours=1)).isoformat(),
                    description=f"High rainfall ({env.rainfall}mm) or saturation ({env.soil_moisture}%) approaching retention capacity.",
                    recommended_action="Inspect silt traps and verify overflow spillway clearance."
                )
            )

    # Filter according to requested severity
    if severity_filter != "all":
        alerts = [a for a in alerts if a.severity == severity_filter]

    return AlertsResponse(
        ecosystem_id=ecosystem_id,
        filter_applied=severity_filter,
        total_alerts=len(alerts),
        alerts=alerts
    )
