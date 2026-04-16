export type Severity = "low" | "medium" | "high";

export type Frequency = "rare" | "occasional" | "frequent";

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

export interface CaseRecord extends IntakeFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  analysis: AnalysisResult | null;
}

export interface CaseSummary {
  id: string;
  victimName: string;
  abuseType: string;
  threatLevel: Severity;
  frequency: Frequency;
  priorComplaintsCount: number;
  timelineEventCount: number;
  status: string;
  severity: Severity | null;
  riskScore: number | null;
  escalationLevel: Severity | null;
  urgency: string | null;
  analysisMode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}
