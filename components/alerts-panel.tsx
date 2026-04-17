"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCheck, Radio, ShieldAlert } from "lucide-react";

import { acknowledgeAlert, fetchAlerts } from "@/lib/api";
import type { AlertRecord } from "@/lib/types";
import { Card } from "@/components/card";

function formatAlertTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getAlertTone(level: string) {
  const normalized = level.toLowerCase();
  if (normalized === "high") {
    return "border-[rgba(156,60,68,0.28)] bg-[rgba(156,60,68,0.08)] text-[#7a1f2a]";
  }

  if (normalized === "medium") {
    return "border-[rgba(185,147,50,0.28)] bg-[rgba(185,147,50,0.1)] text-[#6f5310]";
  }

  return "border-[rgba(43,141,99,0.24)] bg-[rgba(43,141,99,0.1)] text-[var(--low)]";
}

interface AlertsPanelProps {
  currentCaseId?: string | null;
}

export function AlertsPanel({ currentCaseId }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  async function loadAlerts() {
    try {
      const response = await fetchAlerts();
      setAlerts(response);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load alerts.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAlerts();

    const intervalId = window.setInterval(() => {
      void loadAlerts();
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, []);

  const relevantAlerts = currentCaseId
    ? alerts.filter((alert) => alert.caseId === currentCaseId)
    : alerts;

  const activeAlerts = relevantAlerts.filter((alert) => alert.status !== "resolved");

  async function handleAcknowledge(alertId: string) {
    setAcknowledgingId(alertId);

    try {
      const updatedAlert = await acknowledgeAlert(alertId);
      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) => (alert.id === updatedAlert.id ? updatedAlert : alert))
      );
    } catch (ackError) {
      setError(ackError instanceof Error ? ackError.message : "Unable to acknowledge alert.");
    } finally {
      setAcknowledgingId(null);
    }
  }

  return (
    <Card
      title="Real-Time Risk Alerts"
      subtitle="Automatic and panic-triggered alerts refresh every 20 seconds so NGOs can track active emergencies."
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Active Alerts
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--accent-strong)]">
              {activeAlerts.length}
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.6)] p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Total Alerts
            </p>
            <p className="mt-2 text-3xl font-semibold text-[var(--accent-strong)]">
              {relevantAlerts.length}
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.6)] p-4">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <Radio className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">Live Monitor</p>
            </div>
            <p className="mt-2 text-base font-semibold text-[var(--accent-strong)]">
              NGO, police, and emergency-target routing enabled
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[rgba(156,60,68,0.24)] bg-[rgba(156,60,68,0.1)] px-4 py-3 text-sm text-[#7a1f2a]">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.56)] px-4 py-5 text-sm text-[var(--muted)]">
            Loading alerts...
          </div>
        ) : null}

        {!isLoading && relevantAlerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[rgba(255,255,255,0.48)] px-4 py-5 text-sm text-[var(--muted)]">
            No alerts recorded yet. A high-risk analysis or panic button trigger will appear here.
          </div>
        ) : null}

        {!isLoading ? (
          <div className="space-y-3">
            {relevantAlerts.slice(0, 8).map((alert) => (
              <article
                key={alert.id}
                className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`status-pill ${getAlertTone(alert.level)}`}>
                        {alert.level} {alert.alertType}
                      </span>
                      <span className="status-pill">{alert.status}</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                        Case {alert.caseId.slice(0, 8)}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-1 h-5 w-5 text-[var(--accent)]" />
                      <div>
                        <p className="font-semibold text-[var(--accent-strong)]">{alert.message}</p>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Targets: {alert.targets.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[180px] flex-col items-start gap-3 lg:items-end">
                    <div className="text-sm text-[var(--muted)]">
                      <p>{formatAlertTime(alert.createdAt)}</p>
                      {alert.resolvedAt ? <p>Resolved {formatAlertTime(alert.resolvedAt)}</p> : null}
                    </div>
                    {alert.status !== "resolved" ? (
                      <button
                        type="button"
                        onClick={() => void handleAcknowledge(alert.id)}
                        disabled={acknowledgingId === alert.id}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[rgba(255,255,255,0.72)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCheck className="h-4 w-4" />
                        {acknowledgingId === alert.id ? "Updating..." : "Acknowledge"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(43,141,99,0.12)] px-4 py-2 text-sm font-medium text-[var(--low)]">
                        <BellRing className="h-4 w-4" />
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
