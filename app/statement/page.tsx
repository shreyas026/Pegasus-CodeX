"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader } from "@/components/page-header";
import { useCaseStore } from "@/components/case-provider";
import { analyzeCase } from "@/lib/api";

export default function StatementPage() {
  const router = useRouter();
  const { isHydrated, caseId, formData, updateFormData, setAnalysis } = useCaseStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!caseId) {
      setError("Create the case intake first before submitting the statement.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const analysis = await analyzeCase({
        caseId,
        ...formData
      });
      setAnalysis(analysis);
      router.push("/result");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to analyze the statement right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Narrative Analysis"
        title="Transform unstructured survivor narratives into explainable risk signals and actionable legal support outputs."
        description="This step converts the case from static intake to analysis-ready evidence. The statement combines with case history, threat level, and chronology so the downstream result feels evidentiary rather than decorative."
        aside={
          <div className="space-y-4 text-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Analysis Inputs
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.55)] p-3">
                <p className="text-[var(--muted)]">Complaints</p>
                <p className="mt-1 text-lg font-semibold text-[var(--accent-strong)]">{formData.priorComplaintsCount}</p>
              </div>
              <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.55)] p-3">
                <p className="text-[var(--muted)]">Timeline</p>
                <p className="mt-1 text-lg font-semibold text-[var(--accent-strong)]">{formData.timelineEvents.length}</p>
              </div>
            </div>
          </div>
        }
      />

      <Card
        title="Statement Analysis"
        subtitle="Enter a detailed victim statement for linguistic and risk pattern screening"
      >
        {!isHydrated ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Loading saved case data...
          </div>
        ) : null}

        {isHydrated && !caseId ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Intake information has not been submitted yet. Continue from{" "}
            <Link href="/intake" className="font-semibold underline">
              the case intake form
            </Link>
            .
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-slate-500">Prior complaints</p>
              <p className="mt-1 font-semibold text-slate-900">{formData.priorComplaintsCount}</p>
            </div>
            <div>
              <p className="text-slate-500">Timeline events</p>
              <p className="mt-1 font-semibold text-slate-900">{formData.timelineEvents.length}</p>
            </div>
            <div>
              <p className="text-slate-500">Threat level</p>
              <p className="mt-1 font-semibold text-slate-900">{formData.threatLevel}</p>
            </div>
          </div>

          <div>
            <label htmlFor="victim-statement">Victim statement</label>
            <textarea
              id="victim-statement"
              rows={14}
              value={formData.statement}
              onChange={(event) => updateFormData({ statement: event.target.value })}
              placeholder="Enter the victim statement for analysis..."
            />
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !caseId || !isHydrated}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(48,33,23,0.18)] hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {isSubmitting ? <LoadingSpinner /> : null}
              {isSubmitting ? "Analyzing..." : "Submit Statement"}
            </button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
