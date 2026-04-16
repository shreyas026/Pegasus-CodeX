from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from logic.analysis import analyze_case
from models import (
    AnalysisResult,
    AnalyzeCaseRequest,
    CaseInput,
    CaseRecord,
    CaseSummary,
    CreateCaseResponse,
    TimelineEvent,
)
from storage import CASE_STORE, list_case_summaries


router = APIRouter(prefix="/case", tags=["case"])


@router.post("/create", response_model=CreateCaseResponse)
def create_case(payload: CaseInput) -> CreateCaseResponse:
    case_id = str(uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()
    case_record = CaseRecord(id=case_id, createdAt=timestamp, updatedAt=timestamp, **payload.model_dump())
    CASE_STORE[case_id] = case_record

    return CreateCaseResponse(
        message="Case created successfully",
        caseId=case_id,
        data=case_record,
    )


@router.post("/analyze", response_model=AnalysisResult)
def analyze_saved_case(payload: AnalyzeCaseRequest) -> AnalysisResult:
    if not payload.caseId:
        raise HTTPException(status_code=400, detail="caseId is required")

    case_record = CASE_STORE.get(payload.caseId) if payload.caseId else None

    if case_record is None:
        raise HTTPException(status_code=404, detail="Case not found")

    update_data = payload.model_dump(exclude_none=True)

    for field_name in [
        "victimName",
        "age",
        "abuseType",
        "incidentDescription",
        "frequency",
        "threatLevel",
        "statement",
        "historySummary",
        "priorComplaintsCount",
        "timelineEvents",
    ]:
        if field_name in update_data and update_data[field_name] != "":
            if field_name == "timelineEvents":
                timeline_events = payload.timelineEvents or []
                case_record.timelineEvents = [
                    event if isinstance(event, TimelineEvent) else TimelineEvent(**event)
                    for event in timeline_events
                ]
            else:
                setattr(case_record, field_name, update_data[field_name])

    analysis = analyze_case(case_record)
    case_record.analysis = analysis
    case_record.updatedAt = datetime.now(timezone.utc).isoformat()
    CASE_STORE[payload.caseId] = case_record

    return analysis


@router.get("", response_model=list[CaseSummary])
def list_cases() -> list[CaseSummary]:
    return list_case_summaries()


@router.get("/{case_id}", response_model=CaseRecord)
def get_case(case_id: str) -> CaseRecord:
    case_record = CASE_STORE.get(case_id)

    if not case_record:
        raise HTTPException(status_code=404, detail="Case not found")

    return case_record
