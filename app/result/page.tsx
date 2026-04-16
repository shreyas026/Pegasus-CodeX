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
import { buildChartPoints } from "@/lib/chart";

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
        title="Present an explainable case narrative that feels like legal-tech intelligence, not just raw scoring."
        description="This result view surfaces severity, escalation, trigger signals, chronology, legal reference aids, and Safe Action Navigator recommendations in one jury-facing operational layout."
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
            </div>
          </div>
        }
      />

      <Card title="Risk Result" subtitle="Automated screening output">
        <div className="space-y-6">
          <ResultSummary result={analysis} />

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Detected Abuse Patterns
              </h3>
              <ul className="grid gap-2 text-sm sm:grid-cols-2">
                {analysis.abusePatterns.map((pattern) => (
                  <li key={pattern} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    {pattern}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Trigger Flags
              </h3>
              <ul className="space-y-2 text-sm">
                {analysis.triggerFlags.map((flag) => (
                  <li key={flag} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    {flag}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Assessment Explanation
              </h3>
              <p className="text-sm leading-6 text-slate-700">{analysis.explanation}</p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Anonymized Statement Preview
              </h3>
              <p className="text-sm leading-6 text-slate-700">
                {analysis.anonymizedStatement || "No statement was provided for this case."}
              </p>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Analysis Mode
              </h3>
              <p className="text-2xl font-semibold text-[var(--accent-strong)]">{analysis.analysisMode}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                The current decision layer uses {analysis.analysisMode} inference for severity,
                escalation, and abuse-pattern outputs.
              </p>
            </section>

            <section className="surface-panel rounded-[26px] p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                ML Insight
              </h3>
              {analysis.modelInsight ? (
                <div className="space-y-2 text-sm text-[var(--muted)]">
                  <p>
                    Source: <span className="font-semibold text-[var(--accent-strong)]">{analysis.modelInsight.source}</span>
                  </p>
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
                  No trained ML artifacts were active for this run, so the backend used the explainable
                  rule engine only.
                </p>
              )}
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

          <div className="grid gap-4 xl:grid-cols-2">
            <TimelineViewer events={analysis.anonymizedTimeline} summary={analysis.timelineSummary} />
            <LegalReferencePanel items={analysis.legalReferenceSuggestions} />
          </div>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Safe Action Navigator
              </h3>
              <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {analysis.safeActionNavigator.urgency}
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Immediate Flags</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  {analysis.safeActionNavigator.immediateFlags.map((flag) => (
                    <li key={flag} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Evidence To Collect</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  {analysis.safeActionNavigator.evidenceToCollect.map((item) => (
                    <li key={item} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Missing Questions</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  {analysis.safeActionNavigator.missingQuestions.map((item) => (
                    <li key={item} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Referral Suggestions</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  {analysis.safeActionNavigator.referralSuggestions.map((item) => (
                    <li key={item} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

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
