import type { AnalysisResult, CaseRecord, CaseSummary, CreateCaseResponse, IntakeFormData } from "@/lib/types";

const API_BASE_URL = "http://localhost:8001";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "Request failed";

    try {
      const errorBody = (await response.json()) as { detail?: string; message?: string };
      errorMessage = errorBody.detail || errorBody.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function createCase(data: IntakeFormData): Promise<CreateCaseResponse> {
  const response = await fetch(`${API_BASE_URL}/case/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return parseResponse<CreateCaseResponse>(response);
}

export async function analyzeCase(data: IntakeFormData & { caseId: string }): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/case/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return parseResponse<AnalysisResult>(response);
}

export async function fetchCaseQueue(): Promise<CaseSummary[]> {
  const response = await fetch(`${API_BASE_URL}/case`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  return parseResponse<CaseSummary[]>(response);
}

export async function getCaseById(caseId: string): Promise<CaseRecord> {
  const response = await fetch(`${API_BASE_URL}/case/${caseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  return parseResponse<CaseRecord>(response);
}
