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
    victimName: str = Field(..., min_length=1)
    age: int = Field(..., ge=0, le=120)
    abuseType: str = Field(..., min_length=1)
    incidentDescription: str = Field(..., min_length=1)
    frequency: str = Field(..., min_length=1)
    threatLevel: str = Field(..., min_length=1)
    statement: str = Field(default="")
    historySummary: str = Field(default="")
    priorComplaintsCount: int = Field(default=0, ge=0)
    timelineEvents: List[TimelineEvent] = Field(default_factory=list)

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
        allowed_values = {"rare", "occasional", "frequent"}
        if normalized_value not in allowed_values:
            raise ValueError("frequency must be one of: rare, occasional, frequent")
        return normalized_value

    @field_validator("threatLevel")
    @classmethod
    def validate_threat_level(cls, value: str) -> str:
        normalized_value = value.lower()
        allowed_values = {"low", "medium", "high"}
        if normalized_value not in allowed_values:
            raise ValueError("threatLevel must be one of: low, medium, high")
        return normalized_value


class CaseRecord(CaseInput):
    id: str
    createdAt: str
    updatedAt: str
    analysis: Optional["AnalysisResult"] = None


class CreateCaseResponse(BaseModel):
    message: str
    caseId: str
    data: CaseRecord


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
    anonymizedStatement: str
    anonymizedTimeline: List[TimelineEvent]
    timelineSummary: str
    legalReferenceSuggestions: List[LegalReferenceSuggestion]
    modelInsight: Optional[ModelInsight] = None
    safeActionNavigator: SafeActionNavigator
    generatedBrief: str


class CaseSummary(BaseModel):
    id: str
    victimName: str
    abuseType: str
    threatLevel: str
    frequency: str
    priorComplaintsCount: int
    timelineEventCount: int
    status: str
    severity: Optional[str] = None
    riskScore: Optional[int] = None
    escalationLevel: Optional[str] = None
    urgency: Optional[str] = None
    analysisMode: Optional[str] = None
    createdAt: str
    updatedAt: str


CaseRecord.model_rebuild()
