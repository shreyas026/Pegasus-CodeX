"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/card";
import { useCaseStore } from "@/components/case-provider";
import { LegalReferencePanel } from "@/components/legal-reference-panel";
import { PageHeader } from "@/components/page-header";
import { RiskChart } from "@/components/risk-chart";
import { ResultSummary } from "@/components/result-summary";
import { TimelineViewer } from "@/components/timeline-viewer";
import { SafeActionNavigator } from "@/components/safe-action-navigator";
import { buildChartPoints } from "@/lib/chart";

function getAnalysisModeLabel(mode: string) {
  if (mode === "ai-ml" || mode === "hybrid-ml") {
    return "AI Model Active";
  }

  return "Case Analysis Active";
}

export default function ResultPage() {
  const { isHydrated, analysis, formData } = useCaseStore();

  if (!isHydrated) {
    return (
      <AppShell>
        <Card title="Risk Result" subtitle="Automated screening output">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
            Loading saved analysis...
          </div>
        </Card>
      </AppShell>
    );
  }

  if (!analysis) {
    return (
      <AppShell>
        <Card title="Risk Result" subtitle="Automated screening output">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
            No analysis result is available yet. Continue to{" "}
            <Link href="/statement" className="font-semibold underline">
              the statement analysis page
            </Link>{" "}
            to submit the case for review.
          </div>
        </Card>
      </AppShell>
    );
  }

  const chartPoints = buildChartPoints(analysis, formData);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Risk Review"
        title="Review a complete case picture with risk levels, warning signals, legal guidance, and response priorities in one place."
        description="This page brings together severity, escalation, trigger signals, emotional stress, repeat-risk links, privacy safeguards, location context, and legal reference support for faster action."
        aside={
          <div className="space-y-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Case Status
            </p>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.55)] p-4">
                <p className="text-[var(--muted)]">Urgency</p>
                <p className="mt-2 text-xl font-semibold text-[var(--accent-strong)]">
                  {analysis.safeActionNavigator.urgency}
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.55)] p-4">
                <p className="text-[var(--muted)]">Reference Aids</p>
                <p className="mt-2 text-xl font-semibold text-[var(--accent-strong)]">
                  {analysis.legalReferenceSuggestions.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.55)] p-4">
                <p className="text-[var(--muted)]">Stress Level</p>
                <p className="mt-2 text-xl font-semibold text-[var(--accent-strong)]">
                  {analysis.stressLevel}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <Card title="Risk Result" subtitle="Automated screening output">
        <div className="space-y-6">
          <ResultSummary result={analysis} />

          <section className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(156,60,68,0.12),rgba(255,255,255,0.72))] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                  Risk Alert System
                </p>
                <h3 className="mt-2 text-[1.4rem] font-semibold text-[var(--accent-strong)]">
                  {analysis.riskAlertLevel === "none"
                    ? "No automatic alert was triggered for this case"
                    : `${analysis.riskAlertLevel.toUpperCase()} alert triggered`}
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                  {analysis.riskAlertMessage || "This case remains available for manual review and panic-button escalation."}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-right">
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Alert Targets
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--accent-strong)]">
                  {analysis.riskAlertTargets.length > 0 ? analysis.riskAlertTargets.join(", ") : "None"}
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Detected Abuse Patterns
              </h3>
              <ul className="grid gap-2 text-sm sm:grid-cols-2">
                {analysis.abusePatterns.map((pattern) => (
                  <li key={pattern} className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-[var(--accent-strong)]">
                    {pattern}
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Trigger Flags
              </h3>
              <ul className="space-y-2 text-sm">
                {analysis.triggerFlags.map((flag) => (
                  <li key={flag} className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-[var(--accent-strong)]">
                    {flag}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Assessment Explanation
              </h3>
              <p className="text-sm leading-6 text-[var(--muted)]">{analysis.explanation}</p>
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Anonymized Statement Preview
              </h3>
              <p className="text-sm leading-6 text-[var(--muted)]">
                {analysis.anonymizedStatement || "No statement was provided for this case."}
              </p>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                AI Analysis
              </h3>
              <p className="text-2xl font-semibold text-[var(--accent-strong)]">
                {getAnalysisModeLabel(analysis.analysisMode)}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Severity, escalation, and abuse-pattern outputs are being generated for this case.
              </p>
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Prediction Insight
              </h3>
              {analysis.modelInsight ? (
                <div className="space-y-2 text-sm text-[var(--muted)]">
                  <p>
                    Severity prediction: <span className="font-semibold text-[var(--accent-strong)]">{analysis.modelInsight.severity}</span>
                  </p>
                  <p>
                    Escalation prediction: <span className="font-semibold text-[var(--accent-strong)]">{analysis.modelInsight.escalationLevel}</span>
                  </p>
                  <p>
                    Pattern labels: <span className="font-semibold text-[var(--accent-strong)]">{analysis.modelInsight.abusePatterns.join(", ") || "None"}</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Additional prediction details are not available for this case yet.
                </p>
              )}
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Emotion & Stress
              </h3>
              <p className="text-2xl font-semibold text-[var(--accent-strong)]">
                {analysis.stressScore}/100
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Stress level: {analysis.stressLevel}. Detected signals:{" "}
                {analysis.emotionSignals.length > 0 ? analysis.emotionSignals.join(", ") : "none"}.
              </p>
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Repeat Offender Link
              </h3>
              <p className="text-2xl font-semibold text-[var(--accent-strong)]">
                {analysis.repeatOffenderCount}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Pattern-linked prior case IDs:{" "}
                {analysis.repeatOffenderCaseIds.length > 0
                  ? analysis.repeatOffenderCaseIds.join(", ")
                  : "none found yet"}.
              </p>
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Fake Case Check
              </h3>
              <p className="text-2xl font-semibold text-[var(--accent-strong)]">
                {analysis.fakeCaseScore}/100
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {analysis.fakeCaseFlags.length > 0
                  ? analysis.fakeCaseFlags.join(" | ")
                  : "No major inconsistency flags were detected in the current intake."}
              </p>
            </section>
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
              Risk Indicators Chart
            </h3>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <RiskChart points={chartPoints} />
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-3">
            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Privacy Protection
              </h3>
              <div className="space-y-2 text-sm text-[var(--muted)]">
                <p>
                  Redaction applied:{" "}
                  <span className="font-semibold text-[var(--accent-strong)]">
                    {analysis.privacySummary.redactionApplied ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  Encryption at rest:{" "}
                  <span className="font-semibold text-[var(--accent-strong)]">
                    {analysis.privacySummary.encryptionAtRest ? "Enabled" : "Not configured"}
                  </span>
                </p>
                <p>
                  Anonymous ID:{" "}
                  <span className="font-semibold text-[var(--accent-strong)]">
                    {analysis.privacySummary.anonymousId}
                  </span>
                </p>
              </div>
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Location Intelligence
              </h3>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Heatmap label:{" "}
                <span className="font-semibold text-[var(--accent-strong)]">
                  {analysis.locationSummary}
                </span>
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                This case will contribute to area-level hotspot visualization for deployment planning.
              </p>
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Verification Posture
              </h3>
              <p className="text-sm leading-6 text-[var(--muted)]">
                The fake-case model is a consistency aid only. It flags contradictions for advocate review
                and does not dismiss survivor testimony automatically.
              </p>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <TimelineViewer events={analysis.anonymizedTimeline} summary={analysis.timelineSummary} />
            <LegalReferencePanel items={analysis.legalReferenceSuggestions} />
          </div>

          <SafeActionNavigator data={analysis.safeActionNavigator} />

          <div className="flex justify-end">
            <Link
              href="/brief"
              className="rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(48,33,23,0.18)] hover:bg-[var(--accent)]"
            >
              View Generated Brief
            </Link>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
