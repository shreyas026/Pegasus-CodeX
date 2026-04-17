import type {
  AnalysisResult,
  AlertRecord,
  CaseRecord,
  CaseSummary,
  CreateCaseResponse,
  DocumentUploadResponse,
  HeatmapPoint,
  IntakeFormState,
  SupportChatResponse
} from "@/lib/types";

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

export async function createCase(data: IntakeFormState): Promise<CreateCaseResponse> {
  const response = await fetch(`${API_BASE_URL}/case/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return parseResponse<CreateCaseResponse>(response);
}

export async function analyzeCase(data: IntakeFormState & { caseId: string }): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/case/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return parseResponse<AnalysisResult>(response);
}

export async function uploadCaseDocument(
  caseId: string,
  file: File
): Promise<DocumentUploadResponse> {
  const response = await fetch(`${API_BASE_URL}/case/${caseId}/documents`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name)
    },
    body: file
  });

  return parseResponse<DocumentUploadResponse>(response);
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

export async function fetchAlerts(): Promise<AlertRecord[]> {
  const response = await fetch(`${API_BASE_URL}/alerts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  return parseResponse<AlertRecord[]>(response);
}

export async function triggerPanicAlert(caseId: string, message: string): Promise<AlertRecord> {
  const response = await fetch(`${API_BASE_URL}/alerts/panic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ caseId, message, alertType: "panic" })
  });

  return parseResponse<AlertRecord>(response);
}

export async function acknowledgeAlert(alertId: string): Promise<AlertRecord> {
  const response = await fetch(`${API_BASE_URL}/alerts/ack/${alertId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const payload = await parseResponse<{ message: string; alert: AlertRecord }>(response);
  return payload.alert;
}

export async function fetchHeatmap(): Promise<HeatmapPoint[]> {
  const response = await fetch(`${API_BASE_URL}/case/heatmap`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  return parseResponse<HeatmapPoint[]>(response);
}

export async function sendSupportChat(message: string, caseId?: string): Promise<SupportChatResponse> {
  const response = await fetch(`${API_BASE_URL}/support/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, caseId })
  });

  return parseResponse<SupportChatResponse>(response);
}
