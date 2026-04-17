"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import { demoAnalysisResult, demoIntakeData, emptyIntakeData } from "@/lib/mock-data";
import type {
  AnalysisResult,
  CaseDocument,
  CaseRecord,
  DraftFrequency,
  DraftSeverity,
  IntakeFormState,
  TimelineEvent
} from "@/lib/types";

interface CaseStoreValue {
  isHydrated: boolean;
  formData: IntakeFormState;
  caseId: string | null;
  analysis: AnalysisResult | null;
  documents: CaseDocument[];
  setFormData: (nextValue: IntakeFormState) => void;
  updateFormData: (nextValue: Partial<IntakeFormState>) => void;
  setCaseId: (nextValue: string | null) => void;
  setAnalysis: (nextValue: AnalysisResult | null) => void;
  setDocuments: (nextValue: CaseDocument[]) => void;
  addDocument: (nextValue: CaseDocument) => void;
  appendImportedStatement: (nextValue: string) => void;
  loadCase: (record: CaseRecord) => void;
  loadDemoCase: () => void;
  resetCase: () => void;
}

interface PersistedCaseState {
  formData: IntakeFormState;
  caseId: string | null;
  analysis: AnalysisResult | null;
  documents: CaseDocument[];
}

const STORAGE_KEY = "dv-case-analyzer-state";

const CaseStoreContext = createContext<CaseStoreValue | null>(null);

function isValidTimelineEvent(value: unknown): value is TimelineEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.date === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.details === "string" &&
    typeof candidate.source === "string"
  );
}

function isValidCaseDocument(value: unknown): value is CaseDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.fileName === "string" &&
    typeof candidate.contentType === "string" &&
    typeof candidate.pageCount === "number" &&
    typeof candidate.usedOcr === "boolean" &&
    typeof candidate.textLength === "number" &&
    typeof candidate.preview === "string" &&
    typeof candidate.uploadedAt === "string"
  );
}

function isValidDraftFrequency(value: unknown): value is DraftFrequency {
  return value === "" || value === "rare" || value === "occasional" || value === "frequent";
}

function isValidDraftSeverity(value: unknown): value is DraftSeverity {
  return value === "" || value === "low" || value === "medium" || value === "high";
}

function normalizeFormData(value: unknown): IntakeFormState {
  if (!value || typeof value !== "object") {
    return emptyIntakeData;
  }

  const candidate = value as Partial<IntakeFormState>;

  return {
    ...emptyIntakeData,
    ...candidate,
    age: typeof candidate.age === "number" ? candidate.age : emptyIntakeData.age,
    frequency: isValidDraftFrequency(candidate.frequency)
      ? candidate.frequency
      : emptyIntakeData.frequency,
    threatLevel: isValidDraftSeverity(candidate.threatLevel)
      ? candidate.threatLevel
      : emptyIntakeData.threatLevel,
    priorComplaintsCount:
      typeof candidate.priorComplaintsCount === "number"
        ? candidate.priorComplaintsCount
        : emptyIntakeData.priorComplaintsCount,
    locationLabel:
      typeof candidate.locationLabel === "string"
        ? candidate.locationLabel
        : emptyIntakeData.locationLabel,
    locationLat:
      typeof candidate.locationLat === "number" ? candidate.locationLat : emptyIntakeData.locationLat,
    locationLng:
      typeof candidate.locationLng === "number" ? candidate.locationLng : emptyIntakeData.locationLng,
    emergencyContacts: Array.isArray(candidate.emergencyContacts)
      ? candidate.emergencyContacts.filter((item): item is string => typeof item === "string")
      : emptyIntakeData.emergencyContacts,
    timelineEvents: Array.isArray(candidate.timelineEvents)
      ? candidate.timelineEvents.filter(isValidTimelineEvent)
      : emptyIntakeData.timelineEvents
  };
}

function isValidAnalysis(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.analysisMode === "string" &&
    typeof candidate.severity === "string" &&
    typeof candidate.riskScore === "number" &&
    typeof candidate.escalationScore === "number" &&
    typeof candidate.escalationLevel === "string" &&
    Array.isArray(candidate.abusePatterns) &&
    Array.isArray(candidate.triggerFlags) &&
    typeof candidate.explanation === "string" &&
    typeof candidate.anonymizedStatement === "string" &&
    Array.isArray(candidate.anonymizedTimeline) &&
    candidate.anonymizedTimeline.every(isValidTimelineEvent) &&
    typeof candidate.timelineSummary === "string" &&
    Array.isArray(candidate.legalReferenceSuggestions) &&
    typeof candidate.generatedBrief === "string" &&
    typeof candidate.safeActionNavigator === "object" &&
    candidate.safeActionNavigator !== null
  );
}

export function CaseProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<IntakeFormState>(emptyIntakeData);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedState = window.localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsedState = JSON.parse(savedState) as PersistedCaseState;
      setFormData(normalizeFormData(parsedState.formData));
      setCaseId(parsedState.caseId);
      setAnalysis(isValidAnalysis(parsedState.analysis) ? parsedState.analysis : null);
      setDocuments(
        Array.isArray(parsedState.documents)
          ? parsedState.documents.filter(isValidCaseDocument)
          : []
      );
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const nextState: PersistedCaseState = {
      formData,
      caseId,
      analysis,
      documents
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [analysis, caseId, documents, formData, isHydrated]);

  const value: CaseStoreValue = {
    isHydrated,
    formData,
    caseId,
    analysis,
    documents,
    setFormData,
    updateFormData: (nextValue) => {
      setFormData((currentValue) => ({
        ...currentValue,
        ...nextValue
      }));
    },
    setCaseId,
    setAnalysis,
    setDocuments,
    addDocument: (nextValue) => {
      setDocuments((currentValue) => [nextValue, ...currentValue.filter((item) => item.id !== nextValue.id)]);
    },
    appendImportedStatement: (nextValue) => {
      const normalizedValue = nextValue.trim();
      if (!normalizedValue) {
        return;
      }

      setFormData((currentValue) => ({
        ...currentValue,
        statement: currentValue.statement.trim()
          ? `${currentValue.statement.trim()}\n\n${normalizedValue}`
          : normalizedValue
      }));
    },
    loadCase: (record) => {
      setFormData({
        victimName: record.victimName,
        age: record.age,
        abuseType: record.abuseType,
        incidentDescription: record.incidentDescription,
        frequency: record.frequency,
        threatLevel: record.threatLevel,
        statement: record.statement,
        historySummary: record.historySummary,
        priorComplaintsCount: record.priorComplaintsCount,
        timelineEvents: record.timelineEvents,
        locationLabel: record.locationLabel,
        locationLat: record.locationLat,
        locationLng: record.locationLng,
        emergencyContacts: record.emergencyContacts
      });
      setCaseId(record.id);
      setAnalysis(record.analysis);
      setDocuments(record.documents);
    },
    loadDemoCase: () => {
      setFormData(demoIntakeData);
      setCaseId("DEMO-CASE-001");
      setAnalysis(demoAnalysisResult);
      setDocuments([]);
    },
    resetCase: () => {
      setFormData(emptyIntakeData);
      setCaseId(null);
      setAnalysis(null);
      setDocuments([]);
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return <CaseStoreContext.Provider value={value}>{children}</CaseStoreContext.Provider>;
}

export function useCaseStore() {
  const context = useContext(CaseStoreContext);

  if (!context) {
    throw new Error("useCaseStore must be used within a CaseProvider");
  }

  return context;
}
