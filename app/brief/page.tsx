"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/card";
import { useCaseStore } from "@/components/case-provider";
import { LegalReferencePanel } from "@/components/legal-reference-panel";
import { PageHeader } from "@/components/page-header";
import { TimelineViewer } from "@/components/timeline-viewer";

export default function BriefPage() {
  const { isHydrated, analysis, caseId } = useCaseStore();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopyBrief() {
    if (!analysis) {
      return;
    }

    try {
      await navigator.clipboard.writeText(analysis.generatedBrief);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  function handlePrintBrief() {
    window.print();
  }

  if (!isHydrated) {
    return (
      <AppShell>
        <Card title="Generated Brief" subtitle="Structured legal summary for case preparation">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
            Loading saved brief...
          </div>
        </Card>
      </AppShell>
    );
  }

  if (!analysis) {
    return (
      <AppShell>
        <Card title="Generated Brief" subtitle="Structured legal summary for case preparation">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
            A generated brief is not available yet. Open{" "}
            <Link href="/result" className="font-semibold underline">
              the risk result page
            </Link>{" "}
            after completing the analysis.
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Briefing"
        title="Generate a hearing-ready narrative with chronology, reference aids, and redacted legal-support context."
        description="The brief page is designed to feel presentation-grade: summary blocks, chronology context, topic-level legal references, and a structured text output ready for NGO and legal review."
        aside={
          <div className="space-y-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Brief Metadata
            </p>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <p>Case ID: <span className="font-semibold text-[var(--accent-strong)]">{caseId ?? "Not available"}</span></p>
              <p>Severity: <span className="font-semibold text-[var(--accent-strong)]">{analysis.severity}</span></p>
              <p>Escalation: <span className="font-semibold text-[var(--accent-strong)]">{analysis.escalationLevel}</span></p>
            </div>
            <div className="editorial-rule" />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrintBrief}
                className="rounded-full bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_30px_rgba(48,33,23,0.18)] hover:bg-[var(--accent)]"
              >
                Print Brief
              </button>
              <button
                type="button"
                onClick={() => void handleCopyBrief()}
                className="rounded-full border border-[rgba(123,91,45,0.18)] bg-[rgba(255,255,255,0.55)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] hover:bg-[rgba(255,255,255,0.8)]"
              >
                {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy Failed" : "Copy Brief"}
              </button>
            </div>
          </div>
        }
      />

      <Card title="Generated Brief" subtitle="Structured legal summary for case preparation">
        <div className="space-y-4 print-brief">
          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4 text-sm">
            <p>
              <span className="font-semibold">Prepared by:</span> Domestic Violence Case Analyzer
            </p>
            <p>
              <span className="font-semibold">Case ID:</span> {caseId ?? "Not available"}
            </p>
            <p>
              <span className="font-semibold">Prepared on:</span>{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
            </p>
            <p>
              <span className="font-semibold">Anonymization:</span> Sensitive statement content is redacted before analysis output.
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4 text-sm">
              <p className="text-[var(--muted)]">Severity</p>
              <p className="mt-2 text-xl font-semibold text-[var(--accent-strong)]">{analysis.severity}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4 text-sm">
              <p className="text-[var(--muted)]">Escalation</p>
              <p className="mt-2 text-xl font-semibold text-[var(--accent-strong)]">{analysis.escalationLevel}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4 text-sm">
              <p className="text-[var(--muted)]">Urgency</p>
              <p className="mt-2 text-xl font-semibold text-[var(--accent-strong)]">
                {analysis.safeActionNavigator.urgency}
              </p>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <TimelineViewer events={analysis.anonymizedTimeline} summary={analysis.timelineSummary} />
            <LegalReferencePanel items={analysis.legalReferenceSuggestions} />
          </div>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Evidence Checklist
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {analysis.safeActionNavigator.evidenceToCollect.map((item) => (
                  <li key={item} className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.78)] px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Missing Information To Clarify
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {analysis.safeActionNavigator.missingQuestions.map((item) => (
                  <li key={item} className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.78)] px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4 text-sm">
              <p className="text-[var(--muted)]">Risk Alert</p>
              <p className="mt-2 font-semibold text-[var(--accent-strong)]">
                {analysis.riskAlertLevel === "none" ? "Not triggered" : analysis.riskAlertMessage}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4 text-sm">
              <p className="text-[var(--muted)]">Repeat-Offender Link</p>
              <p className="mt-2 font-semibold text-[var(--accent-strong)]">
                {analysis.repeatOffenderCount > 0
                  ? analysis.repeatOffenderCaseIds.join(", ")
                  : "No linked anonymized cases found"}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4 text-sm">
              <p className="text-[var(--muted)]">Privacy Posture</p>
              <p className="mt-2 font-semibold text-[var(--accent-strong)]">
                Anonymous ID {analysis.privacySummary.anonymousId}
              </p>
              <p className="mt-2 text-[var(--muted)]">
                Redaction {analysis.privacySummary.redactionApplied ? "enabled" : "disabled"}, encryption{" "}
                {analysis.privacySummary.encryptionAtRest ? "enabled" : "not configured"}.
              </p>
            </div>
          </section>

          <section className="rounded-[24px] border border-[var(--border)] p-4">
            <pre className="whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
              {analysis.generatedBrief}
            </pre>
          </section>
        </div>
      </Card>
    </AppShell>
  );
}
