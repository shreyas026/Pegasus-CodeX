from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from models import AlertAcknowledgeResponse, AlertCreateRequest, AlertRecord
from storage import acknowledge_alert, create_alert, list_alerts


router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertRecord])
def get_alerts() -> list[AlertRecord]:
    return list_alerts()


@router.post("/panic", response_model=AlertRecord)
def panic_alert(payload: AlertCreateRequest) -> AlertRecord:
    if not payload.caseId:
        raise HTTPException(status_code=400, detail="caseId is required")

    targets = payload.targets or ["NGO", "Police", "Emergency Contact"]
    message = payload.message or "Emergency panic alert triggered by survivor."

    return create_alert(
        case_id=payload.caseId,
        alert_type="panic",
        level=payload.level or "high",
        message=message,
        targets=targets,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/ack/{alert_id}", response_model=AlertAcknowledgeResponse)
def acknowledge_alert_route(alert_id: str) -> AlertAcknowledgeResponse:
    alert = acknowledge_alert(alert_id, datetime.now(timezone.utc).isoformat())
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    return AlertAcknowledgeResponse(message="Alert acknowledged", alert=alert)
