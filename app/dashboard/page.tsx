"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/card";
import { useCaseStore } from "@/components/case-provider";
import { PageHeader } from "@/components/page-header";
import { fetchCaseQueue, getCaseById } from "@/lib/api";
import { mockAnalysisResult, mockIntakeData } from "@/lib/mock-data";
import type { CaseSummary } from "@/lib/types";

function formatCaseDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function formatCaseTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function buildMetricCards(queue: CaseSummary[]) {
  const analyzedCases = queue.filter((item) => item.riskScore !== null);
  const averageRiskScore = analyzedCases.length
    ? Math.round(
        analyzedCases.reduce((sum, item) => sum + (item.riskScore ?? 0), 0) / analyzedCases.length
      )
    : 0;

  return [
    { label: "Saved Cases", value: queue.length },
    {
      label: "High-Risk Queue",
      value: queue.filter((item) => (item.riskScore ?? 0) >= 70 || item.severity === "high").length
    },
    {
      label: "Awaiting Analysis",
      value: queue.filter((item) => item.status !== "analyzed").length
    },
    { label: "Avg. Risk Score", value: averageRiskScore }
  ];
}

export default function DashboardPage() {
  const router = useRouter();
  const { isHydrated, formData, analysis, loadCase, loadDemoCase, resetCase } = useCaseStore();
  const [queue, setQueue] = useState<CaseSummary[]>([]);
  const [isQueueLoading, setIsQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [openingCaseId, setOpeningCaseId] = useState<string | null>(null);
  const latestIntake = isHydrated ? formData : mockIntakeData;
  const latestAnalysis = isHydrated && analysis ? analysis : mockAnalysisResult;
  const metricCards = useMemo(() => buildMetricCards(queue), [queue]);

  async function loadQueue() {
    setQueueError(null);
    setIsQueueLoading(true);

    try {
      const response = await fetchCaseQueue();
      setQueue(response);
    } catch (loadError) {
      setQueueError(loadError instanceof Error ? loadError.message : "Unable to load saved cases.");
    } finally {
      setIsQueueLoading(false);
    }
  }

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void loadQueue();
  }, [isHydrated]);

  function handleLoadDemoCase() {
    loadDemoCase();
    router.push("/result");
  }

  function handleResetCase() {
    resetCase();
    router.push("/intake");
  }

  async function handleOpenCase(caseId: string) {
    setQueueError(null);
    setOpeningCaseId(caseId);

    try {
      const record = await getCaseById(caseId);
      loadCase(record);
      router.push(record.analysis ? "/result" : "/statement");
    } catch (openError) {
      setQueueError(openError instanceof Error ? openError.message : "Unable to open the saved case.");
    } finally {
      setOpeningCaseId(null);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Command Center"
        title="Prioritize the most urgent survivors with clarity, context, and a real case queue that can be reopened on demand."
        description="Phase 2 starts by making the workspace operational: saved case summaries, queue metrics, reopenable records, demo-ready posture, and a direct line from intake to review to briefing."
        aside={
          <div className="space-y-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Current Case Posture
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--accent-strong)]">
                {latestAnalysis.riskScore}/100
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Risk score with {latestAnalysis.escalationLevel} escalation and{" "}
                {latestAnalysis.abusePatterns.length} abuse patterns surfaced.
              </p>
            </div>
            <div className="editorial-rule" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.55)] p-3">
                <p className="text-[var(--muted)]">Timeline</p>
                <p className="mt-1 text-lg font-semibold text-[var(--accent-strong)]">
                  {latestIntake.timelineEvents.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.55)] p-3">
                <p className="text-[var(--muted)]">Urgency</p>
                <p className="mt-1 text-lg font-semibold text-[var(--accent-strong)]">
                  {latestAnalysis.safeActionNavigator.urgency}
                </p>
              </div>
            </div>
            <div className="editorial-rule" />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleLoadDemoCase}
                className="rounded-full bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_30px_rgba(48,33,23,0.18)] hover:bg-[var(--accent)]"
              >
                Load Demo Case
              </button>
              <button
                type="button"
                onClick={handleResetCase}
                className="rounded-full border border-[rgba(123,91,45,0.18)] bg-[rgba(255,255,255,0.55)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] hover:bg-[rgba(255,255,255,0.8)]"
              >
                Reset Workspace
              </button>
            </div>
          </div>
        }
      />

      <Card title="Queue Snapshot" subtitle="Live backend summaries for saved and analyzed cases">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] p-5"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--accent-strong)]">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Saved Case Queue" subtitle="Reopen intake or analysis work from the backend store">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">
                {queue.length > 0
                  ? `${queue.length} saved case${queue.length === 1 ? "" : "s"} available for review.`
                  : "No backend-saved cases yet. Create a case intake to populate the queue."}
              </p>
              <button
                type="button"
                onClick={() => void loadQueue()}
                className="rounded-full border border-[rgba(123,91,45,0.18)] bg-[rgba(255,255,255,0.65)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] hover:bg-white"
              >
                Refresh Queue
              </button>
            </div>

            {queueError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {queueError}
              </div>
            ) : null}

            {isQueueLoading ? (
              <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] px-4 py-6 text-sm text-[var(--muted)]">
                Loading saved case queue...
              </div>
            ) : null}

            {!isQueueLoading && queue.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgba(123,91,45,0.22)] bg-[rgba(255,252,247,0.72)] px-4 py-6 text-sm text-[var(--muted)]">
                The backend store is empty. Save an intake form to create the first queue item.
              </div>
            ) : null}

            {!isQueueLoading ? (
              <div className="space-y-3">
                {queue.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold text-[var(--accent-strong)]">
                            {item.victimName}
                          </h3>
                          <span className="status-pill">{item.status}</span>
                          {item.severity ? <span className="status-pill">{item.severity} severity</span> : null}
                        </div>
                        <div className="grid gap-2 text-sm text-[var(--muted)] md:grid-cols-2">
                          <p>Abuse type: <span className="font-semibold text-[var(--accent-strong)]">{item.abuseType}</span></p>
                          <p>Threat level: <span className="font-semibold text-[var(--accent-strong)]">{item.threatLevel}</span></p>
                          <p>Complaints: <span className="font-semibold text-[var(--accent-strong)]">{item.priorComplaintsCount}</span></p>
                          <p>Timeline events: <span className="font-semibold text-[var(--accent-strong)]">{item.timelineEventCount}</span></p>
                          <p>Updated: <span className="font-semibold text-[var(--accent-strong)]">{formatCaseDate(item.updatedAt)} at {formatCaseTime(item.updatedAt)}</span></p>
                          <p>Urgency: <span className="font-semibold text-[var(--accent-strong)]">{item.urgency ?? "Awaiting statement analysis"}</span></p>
                        </div>
                      </div>

                      <div className="flex min-w-[160px] flex-col items-start gap-3 lg:items-end">
                        <p className="text-3xl font-semibold text-[var(--accent-strong)]">
                          {item.riskScore !== null ? `${item.riskScore}/100` : "Draft"}
                        </p>
                        <button
                          type="button"
                          onClick={() => void handleOpenCase(item.id)}
                          disabled={openingCaseId === item.id}
                          className="rounded-full bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_30px_rgba(48,33,23,0.18)] hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-slate-500"
                        >
                          {openingCaseId === item.id
                            ? "Opening..."
                            : item.status === "analyzed"
                              ? "Open Result"
                              : "Continue Case"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Latest Intake Snapshot">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Victim Name</dt>
                <dd className="font-medium">{latestIntake.victimName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Type of Abuse</dt>
                <dd className="font-medium">{latestIntake.abuseType}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Threat Level</dt>
                <dd className="font-medium">{latestIntake.threatLevel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Timeline Events</dt>
                <dd className="font-medium">{latestIntake.timelineEvents.length}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Most Recent Analysis">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Severity</dt>
                <dd className="font-medium">{latestAnalysis.severity}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Risk Score</dt>
                <dd className="font-medium">{latestAnalysis.riskScore}/100</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Escalation</dt>
                <dd className="font-medium">{latestAnalysis.escalationLevel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Pattern Count</dt>
                <dd className="font-medium">{latestAnalysis.abusePatterns.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Analysis Mode</dt>
                <dd className="font-medium">{latestAnalysis.analysisMode}</dd>
              </div>
            </dl>
          </Card>

          <Card
            title="Inference Story"
            subtitle="Show the jury that the system supports explainable rules today and hybrid ML when trained artifacts are available."
          >
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Live Engine
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--accent-strong)]">
                  {latestAnalysis.analysisMode}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  The backend blends chronology-aware rules with ML predictions when trained artifacts are
                  available, and falls back safely to explainable rules when they are not.
                </p>
              </div>

              <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  ML Workspace Status
                </p>
                {latestAnalysis.modelInsight ? (
                  <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                    <p>
                      Model source:{" "}
                      <span className="font-semibold text-[var(--accent-strong)]">
                        {latestAnalysis.modelInsight.source}
                      </span>
                    </p>
                    <p>
                      Predicted severity:{" "}
                      <span className="font-semibold text-[var(--accent-strong)]">
                        {latestAnalysis.modelInsight.severity}
                      </span>
                    </p>
                    <p>
                      Predicted escalation:{" "}
                      <span className="font-semibold text-[var(--accent-strong)]">
                        {latestAnalysis.modelInsight.escalationLevel}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    No saved ML artifacts are active yet. Train the baseline models in `ml_workspace`
                    to turn on hybrid inference.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
