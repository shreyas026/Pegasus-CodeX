export type Severity = "low" | "medium" | "high";

export type Frequency = "rare" | "occasional" | "frequent";

export type DraftSeverity = Severity | "";

export type DraftFrequency = Frequency | "";

export interface TimelineEvent {
  date: string;
  title: string;
  details: string;
  source: string;
}

export interface IntakeFormData {
  victimName: string;
  age: number;
  abuseType: string;
  incidentDescription: string;
  frequency: Frequency;
  threatLevel: Severity;
  statement: string;
  historySummary: string;
  priorComplaintsCount: number;
  timelineEvents: TimelineEvent[];
  locationLabel: string;
  locationLat: number | null;
  locationLng: number | null;
  emergencyContacts: string[];
}

export interface IntakeFormState {
  victimName: string;
  age: number;
  abuseType: string;
  incidentDescription: string;
  frequency: DraftFrequency;
  threatLevel: DraftSeverity;
  statement: string;
  historySummary: string;
  priorComplaintsCount: number;
  timelineEvents: TimelineEvent[];
  locationLabel: string;
  locationLat: number | null;
  locationLng: number | null;
  emergencyContacts: string[];
}

export interface CaseDocument {
  id: string;
  fileName: string;
  contentType: string;
  pageCount: number;
  usedOcr: boolean;
  textLength: number;
  preview: string;
  uploadedAt: string;
}

export interface ExtractedFieldSuggestions {
  victimName: string | null;
  age: number | null;
  abuseType: string | null;
  frequency: Frequency | null;
  threatLevel: Severity | null;
  incidentDescription: string | null;
  historySummary: string | null;
  timelineEvents: TimelineEvent[];
}

export interface SafeActionNavigator {
  urgency: string;
  immediateFlags: string[];
  evidenceToCollect: string[];
  missingQuestions: string[];
  referralSuggestions: string[];
}

export interface LegalReferenceSuggestion {
  title: string;
  source: string;
  note: string;
  rationale: string;
}

export interface ModelInsight {
  source: string;
  severity: Severity;
  riskScore: number;
  escalationLevel: Severity;
  escalationScore: number;
  abusePatterns: string[];
}

export interface AnalysisResult {
  analysisMode: string;
  severity: Severity;
  riskScore: number;
  escalationScore: number;
  escalationLevel: Severity;
  abusePatterns: string[];
  triggerFlags: string[];
  explanation: string;
  emotionSignals: string[];
  stressScore: number;
  stressLevel: Severity;
  fakeCaseFlags: string[];
  fakeCaseScore: number;
  repeatOffenderSignature: string;
  repeatOffenderCount: number;
  repeatOffenderCaseIds: string[];
  riskAlertLevel: string;
  riskAlertMessage: string;
  riskAlertTargets: string[];
  privacySummary: {
    redactionApplied: boolean;
    encryptionAtRest: boolean;
    anonymousId: string;
  };
  locationSummary: string;
  anonymizedStatement: string;
  anonymizedTimeline: TimelineEvent[];
  timelineSummary: string;
  legalReferenceSuggestions: LegalReferenceSuggestion[];
  modelInsight: ModelInsight | null;
  safeActionNavigator: SafeActionNavigator;
  generatedBrief: string;
}

export interface CreateCaseResponse {
  message: string;
  caseId: string;
  data: CaseRecord;
}

export interface DocumentUploadResponse {
  message: string;
  document: CaseDocument;
  extractedText: string;
  processingMode: string;
  processingEngine: string;
  suggestedFields: ExtractedFieldSuggestions;
}

export interface CaseRecord extends IntakeFormData {
  id: string;
  anonymousId: string;
  createdAt: string;
  updatedAt: string;
  analysis: AnalysisResult | null;
  documents: CaseDocument[];
}

export interface CaseSummary {
  id: string;
  anonymousId: string;
  victimName: string;
  abuseType: string;
  threatLevel: Severity;
  frequency: Frequency;
  priorComplaintsCount: number;
  timelineEventCount: number;
  documentCount: number;
  status: string;
  severity: Severity | null;
  riskScore: number | null;
  escalationLevel: Severity | null;
  urgency: string | null;
  analysisMode: string | null;
  locationLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertRecord {
  id: string;
  caseId: string;
  alertType: string;
  level: string;
  message: string;
  targets: string[];
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface HeatmapPoint {
  label: string;
  totalCount: number;
  highRiskCount: number;
  averageRiskScore: number;
  locationLat: number | null;
  locationLng: number | null;
}

export interface SupportChatResponse {
  reply: string;
  suggestedActions: string[];
  resources: string[];
}

export interface ChartPoint {
  label: string;
  value: number;
}
