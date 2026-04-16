"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import { mockAnalysisResult, mockIntakeData } from "@/lib/mock-data";
import type { AnalysisResult, CaseRecord, IntakeFormData, TimelineEvent } from "@/lib/types";

interface CaseStoreValue {
  isHydrated: boolean;
  formData: IntakeFormData;
  caseId: string | null;
  analysis: AnalysisResult | null;
  setFormData: (nextValue: IntakeFormData) => void;
  updateFormData: (nextValue: Partial<IntakeFormData>) => void;
  setCaseId: (nextValue: string | null) => void;
  setAnalysis: (nextValue: AnalysisResult | null) => void;
  loadCase: (record: CaseRecord) => void;
  loadDemoCase: () => void;
  resetCase: () => void;
}

interface PersistedCaseState {
  formData: IntakeFormData;
  caseId: string | null;
  analysis: AnalysisResult | null;
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

function normalizeFormData(value: unknown): IntakeFormData {
  if (!value || typeof value !== "object") {
    return mockIntakeData;
  }

  const candidate = value as Partial<IntakeFormData>;

  return {
    ...mockIntakeData,
    ...candidate,
    age: typeof candidate.age === "number" ? candidate.age : mockIntakeData.age,
    priorComplaintsCount:
      typeof candidate.priorComplaintsCount === "number"
        ? candidate.priorComplaintsCount
        : mockIntakeData.priorComplaintsCount,
    timelineEvents: Array.isArray(candidate.timelineEvents)
      ? candidate.timelineEvents.filter(isValidTimelineEvent)
      : mockIntakeData.timelineEvents
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
  const [formData, setFormData] = useState<IntakeFormData>(mockIntakeData);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
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
      analysis
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [analysis, caseId, formData, isHydrated]);

  const value: CaseStoreValue = {
    isHydrated,
    formData,
    caseId,
    analysis,
    setFormData,
    updateFormData: (nextValue) => {
      setFormData((currentValue) => ({
        ...currentValue,
        ...nextValue
      }));
    },
    setCaseId,
    setAnalysis,
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
        timelineEvents: record.timelineEvents
      });
      setCaseId(record.id);
      setAnalysis(record.analysis);
    },
    loadDemoCase: () => {
      setFormData(mockIntakeData);
      setCaseId("DEMO-CASE-001");
      setAnalysis(mockAnalysisResult);
    },
    resetCase: () => {
      setFormData(mockIntakeData);
      setCaseId(null);
      setAnalysis(null);
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
