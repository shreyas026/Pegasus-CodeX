from datetime import datetime, timezone
from urllib.parse import unquote
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request

from logic.analysis import analyze_case
from logic.document_ingestion import (
    DocumentExtractionFailure,
    DocumentProcessingUnavailableError,
    UnsupportedDocumentTypeError,
    extract_document,
)
from logic.field_extraction import extract_field_suggestions
from models import (
    AnalysisResult,
    AnalyzeCaseRequest,
    CaseInput,
    CaseRecord,
    CaseDocument,
    CaseSummary,
    CreateCaseResponse,
    DocumentUploadResponse,
    HeatmapPoint,
    TimelineEvent,
)
from storage import (
    create_alert,
    find_repeat_offender_cases,
    get_case_record,
    list_case_summaries,
    list_heatmap_points,
    save_case_record,
    store_case_document,
)


router = APIRouter(prefix="/case", tags=["case"])


@router.post("/create", response_model=CreateCaseResponse)
def create_case(payload: CaseInput) -> CreateCaseResponse:
    case_id = str(uuid4())
    anonymous_id = f"ANON-{case_id.split('-')[0].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()
    case_record = CaseRecord(
        id=case_id,
        anonymousId=anonymous_id,
        createdAt=timestamp,
        updatedAt=timestamp,
        **payload.model_dump(),
    )
    saved_record = save_case_record(case_record)

    return CreateCaseResponse(
        message="Case created successfully",
        caseId=case_id,
        data=saved_record,
    )


@router.post("/{case_id}/documents", response_model=DocumentUploadResponse)
async def upload_case_document(case_id: str, request: Request) -> DocumentUploadResponse:
    case_record = get_case_record(case_id)
    if case_record is None:
        raise HTTPException(status_code=404, detail="Case not found")

    file_bytes = await request.body()
    raw_file_name = request.headers.get("x-file-name", "uploaded-document")
    file_name = unquote(raw_file_name)

    try:
        extracted = extract_document(
            file_bytes,
            content_type=request.headers.get("content-type"),
            file_name=file_name,
        )
    except UnsupportedDocumentTypeError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except DocumentProcessingUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except DocumentExtractionFailure as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    uploaded_at = datetime.now(timezone.utc).isoformat()
    stored_document: CaseDocument = store_case_document(
        case_id,
        file_name=extracted.file_name,
        content_type=extracted.content_type,
        page_count=extracted.page_count,
        used_ocr=extracted.used_ocr,
        extracted_text=extracted.extracted_text,
        file_bytes=file_bytes,
        uploaded_at=uploaded_at,
    )

    return DocumentUploadResponse(
        message="Document imported successfully",
        document=stored_document,
        extractedText=extracted.extracted_text,
        processingMode=extracted.processing_mode,
        processingEngine=extracted.processing_engine,
        suggestedFields=extract_field_suggestions(extracted.extracted_text),
    )


@router.post("/analyze", response_model=AnalysisResult)
def analyze_saved_case(payload: AnalyzeCaseRequest) -> AnalysisResult:
    if not payload.caseId:
        raise HTTPException(status_code=400, detail="caseId is required")

    case_record = get_case_record(payload.caseId) if payload.caseId else None

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
        "locationLabel",
        "locationLat",
        "locationLng",
        "emergencyContacts",
    ]:
        if field_name in update_data and update_data[field_name] != "":
            if field_name == "timelineEvents":
                timeline_events = payload.timelineEvents or []
                case_record.timelineEvents = [
                    event if isinstance(event, TimelineEvent) else TimelineEvent(**event)
                    for event in timeline_events
                ]
            elif field_name == "emergencyContacts":
                case_record.emergencyContacts = list(update_data[field_name] or [])
            else:
                setattr(case_record, field_name, update_data[field_name])

    analysis = analyze_case(case_record)
    repeat_case_ids = find_repeat_offender_cases(analysis.repeatOffenderSignature, case_record.id)
    analysis.repeatOffenderCount = len(repeat_case_ids)
    analysis.repeatOffenderCaseIds = repeat_case_ids

    if analysis.riskAlertLevel != "none":
        create_alert(
            case_id=case_record.id,
            alert_type="auto",
            level=analysis.riskAlertLevel,
            message=analysis.riskAlertMessage,
            targets=analysis.riskAlertTargets,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
    case_record.analysis = analysis
    case_record.updatedAt = datetime.now(timezone.utc).isoformat()
    save_case_record(case_record)

    return analysis


@router.get("", response_model=list[CaseSummary])
def list_cases() -> list[CaseSummary]:
    return list_case_summaries()


@router.get("/heatmap", response_model=list[HeatmapPoint])
def case_heatmap() -> list[HeatmapPoint]:
    return list_heatmap_points()


@router.get("/{case_id}", response_model=CaseRecord)
def get_case(case_id: str) -> CaseRecord:
    case_record = get_case_record(case_id)

    if not case_record:
        raise HTTPException(status_code=404, detail="Case not found")

    return case_record
