from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class TimelineEvent(BaseModel):
    date: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    details: str = Field(..., min_length=1)
    source: str = Field(default="Victim statement")

    @field_validator("date", "title", "details", "source", mode="before")
    @classmethod
    def strip_timeline_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


class CaseInput(BaseModel):
    victimName: str = Field(default="")
    age: int = Field(default=0, ge=0, le=120)
    abuseType: str = Field(default="")
    incidentDescription: str = Field(default="")
    frequency: str = Field(default="")
    threatLevel: str = Field(default="")
    statement: str = Field(default="")
    historySummary: str = Field(default="")
    priorComplaintsCount: int = Field(default=0, ge=0)
    timelineEvents: List[TimelineEvent] = Field(default_factory=list)
    locationLabel: str = Field(default="")
    locationLat: Optional[float] = None
    locationLng: Optional[float] = None
    emergencyContacts: List[str] = Field(default_factory=list)

    @field_validator(
        "victimName",
        "abuseType",
        "incidentDescription",
        "frequency",
        "threatLevel",
        "statement",
        "historySummary",
        mode="before",
    )
    @classmethod
    def strip_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("frequency")
    @classmethod
    def validate_frequency(cls, value: str) -> str:
        normalized_value = value.lower()
        if normalized_value == "":
            return normalized_value
        allowed_values = {"rare", "occasional", "frequent"}
        if normalized_value not in allowed_values:
            raise ValueError("frequency must be one of: rare, occasional, frequent")
        return normalized_value

    @field_validator("threatLevel")
    @classmethod
    def validate_threat_level(cls, value: str) -> str:
        normalized_value = value.lower()
        if normalized_value == "":
            return normalized_value
        allowed_values = {"low", "medium", "high"}
        if normalized_value not in allowed_values:
            raise ValueError("threatLevel must be one of: low, medium, high")
        return normalized_value


class CaseRecord(CaseInput):
    id: str
    anonymousId: str
    createdAt: str
    updatedAt: str
    analysis: Optional["AnalysisResult"] = None
    documents: List["CaseDocument"] = Field(default_factory=list)


class CreateCaseResponse(BaseModel):
    message: str
    caseId: str
    data: CaseRecord


class CaseDocument(BaseModel):
    id: str
    fileName: str
    contentType: str
    pageCount: int = Field(..., ge=1)
    usedOcr: bool
    textLength: int = Field(..., ge=0)
    preview: str
    uploadedAt: str


class ExtractedFieldSuggestions(BaseModel):
    victimName: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0, le=120)
    abuseType: Optional[str] = None
    frequency: Optional[str] = None
    threatLevel: Optional[str] = None
    incidentDescription: Optional[str] = None
    historySummary: Optional[str] = None
    timelineEvents: List[TimelineEvent] = Field(default_factory=list)


class DocumentUploadResponse(BaseModel):
    message: str
    document: CaseDocument
    extractedText: str = Field(..., min_length=1)
    processingMode: str
    processingEngine: str
    suggestedFields: ExtractedFieldSuggestions


class AnalyzeCaseRequest(BaseModel):
    caseId: Optional[str] = None
    victimName: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0, le=120)
    abuseType: Optional[str] = None
    incidentDescription: Optional[str] = None
    frequency: Optional[str] = None
    threatLevel: Optional[str] = None
    statement: Optional[str] = ""
    historySummary: Optional[str] = None
    priorComplaintsCount: Optional[int] = Field(default=None, ge=0)
    timelineEvents: Optional[List[TimelineEvent]] = None
    locationLabel: Optional[str] = None
    locationLat: Optional[float] = None
    locationLng: Optional[float] = None
    emergencyContacts: Optional[List[str]] = None

    @field_validator(
        "caseId",
        "victimName",
        "abuseType",
        "incidentDescription",
        "frequency",
        "threatLevel",
        "statement",
        "historySummary",
        mode="before",
    )
    @classmethod
    def strip_optional_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("frequency")
    @classmethod
    def validate_optional_frequency(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return value
        normalized_value = value.lower()
        allowed_values = {"rare", "occasional", "frequent"}
        if normalized_value not in allowed_values:
            raise ValueError("frequency must be one of: rare, occasional, frequent")
        return normalized_value

    @field_validator("threatLevel")
    @classmethod
    def validate_optional_threat_level(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return value
        normalized_value = value.lower()
        allowed_values = {"low", "medium", "high"}
        if normalized_value not in allowed_values:
            raise ValueError("threatLevel must be one of: low, medium, high")
        return normalized_value


class SafeActionNavigator(BaseModel):
    urgency: str
    immediateFlags: List[str]
    evidenceToCollect: List[str]
    missingQuestions: List[str]
    referralSuggestions: List[str]


class LegalReferenceSuggestion(BaseModel):
    title: str
    source: str
    note: str
    rationale: str


class ModelInsight(BaseModel):
    source: str
    severity: str
    riskScore: int = Field(..., ge=0, le=100)
    escalationLevel: str
    escalationScore: int = Field(..., ge=0, le=100)
    abusePatterns: List[str]


class AnalysisResult(BaseModel):
    analysisMode: str
    severity: str
    riskScore: int = Field(..., ge=0, le=100)
    escalationScore: int = Field(..., ge=0, le=100)
    escalationLevel: str
    abusePatterns: List[str]
    triggerFlags: List[str]
    explanation: str
    emotionSignals: List[str]
    stressScore: int = Field(..., ge=0, le=100)
    stressLevel: str
    fakeCaseFlags: List[str]
    fakeCaseScore: int = Field(..., ge=0, le=100)
    repeatOffenderSignature: str
    repeatOffenderCount: int = Field(..., ge=0)
    repeatOffenderCaseIds: List[str]
    riskAlertLevel: str
    riskAlertMessage: str
    riskAlertTargets: List[str]
    privacySummary: dict
    locationSummary: str
    anonymizedStatement: str
    anonymizedTimeline: List[TimelineEvent]
    timelineSummary: str
    legalReferenceSuggestions: List[LegalReferenceSuggestion]
    modelInsight: Optional[ModelInsight] = None
    safeActionNavigator: SafeActionNavigator
    generatedBrief: str


class CaseSummary(BaseModel):
    id: str
    anonymousId: str
    victimName: str
    abuseType: str
    threatLevel: str
    frequency: str
    priorComplaintsCount: int
    timelineEventCount: int
    documentCount: int
    status: str
    severity: Optional[str] = None
    riskScore: Optional[int] = None
    escalationLevel: Optional[str] = None
    urgency: Optional[str] = None
    analysisMode: Optional[str] = None
    locationLabel: Optional[str] = None
    createdAt: str
    updatedAt: str


class AlertRecord(BaseModel):
    id: str
    caseId: str
    alertType: str
    level: str
    message: str
    targets: List[str]
    status: str
    createdAt: str
    resolvedAt: Optional[str] = None


class AlertCreateRequest(BaseModel):
    caseId: str
    alertType: str = "manual"
    message: str
    level: str = "high"
    targets: List[str] = Field(default_factory=list)
    locationLabel: Optional[str] = None
    locationLat: Optional[float] = None
    locationLng: Optional[float] = None


class AlertAcknowledgeResponse(BaseModel):
    message: str
    alert: AlertRecord


class HeatmapPoint(BaseModel):
    label: str
    totalCount: int
    highRiskCount: int
    averageRiskScore: int
    locationLat: Optional[float] = None
    locationLng: Optional[float] = None


class SupportChatRequest(BaseModel):
    message: str
    caseId: Optional[str] = None


class SupportChatResponse(BaseModel):
    reply: str
    suggestedActions: List[str]
    resources: List[str]


CaseRecord.model_rebuild()
