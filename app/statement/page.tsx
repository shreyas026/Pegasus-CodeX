"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/card";
import { DocumentUploader } from "@/components/document-uploader";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader } from "@/components/page-header";
import { VoiceInputPanel } from "@/components/voice-input-panel";
import { useCaseStore } from "@/components/case-provider";
import { analyzeCase, createCase } from "@/lib/api";
import type { ExtractedFieldSuggestions, TimelineEvent } from "@/lib/types";

function countSuggestedFields(suggestions: ExtractedFieldSuggestions | null) {
  if (!suggestions) {
    return 0;
  }

  const scalarFields = [
    suggestions.victimName,
    suggestions.age,
    suggestions.abuseType,
    suggestions.frequency,
    suggestions.threatLevel,
    suggestions.incidentDescription,
    suggestions.historySummary
  ].filter(Boolean).length;

  return scalarFields + suggestions.timelineEvents.length;
}

export default function StatementPage() {
  const router = useRouter();
  const {
    isHydrated,
    caseId,
    formData,
    updateFormData,
    setCaseId,
    setAnalysis,
    setDocuments,
    documents,
    addDocument,
    appendImportedStatement
  } = useCaseStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestSuggestions, setLatestSuggestions] = useState<ExtractedFieldSuggestions | null>(null);
  const pendingCaseIdRef = useRef<Promise<string> | null>(null);
  const suggestionCount = useMemo(() => countSuggestedFields(latestSuggestions), [latestSuggestions]);

  function mergeTimelineEvents(existingEvents: TimelineEvent[], incomingEvents: TimelineEvent[]) {
    const seen = new Set(existingEvents.map((event) => `${event.date}|${event.title}|${event.details}`.toLowerCase()));
    const merged = [...existingEvents];

    for (const event of incomingEvents) {
      const key = `${event.date}|${event.title}|${event.details}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(event);
      }
    }

    return merged;
  }

  function applySuggestedFields() {
    if (!latestSuggestions) {
      return;
    }

    updateFormData({
      victimName: latestSuggestions.victimName || formData.victimName,
      age: latestSuggestions.age ?? formData.age,
      abuseType: latestSuggestions.abuseType || formData.abuseType,
      frequency: latestSuggestions.frequency || formData.frequency,
      threatLevel: latestSuggestions.threatLevel || formData.threatLevel,
      incidentDescription: latestSuggestions.incidentDescription || formData.incidentDescription,
      historySummary: latestSuggestions.historySummary || formData.historySummary,
      timelineEvents: mergeTimelineEvents(formData.timelineEvents, latestSuggestions.timelineEvents)
    });
  }

  async function ensureCaseId() {
    if (caseId) {
      return caseId;
    }

    if (pendingCaseIdRef.current) {
      return pendingCaseIdRef.current;
    }

    setError(null);

    const pendingCaseId = (async () => {
      const response = await createCase(formData);
      setCaseId(response.caseId);
      setAnalysis(null);
      setDocuments(response.data.documents);
      return response.caseId;
    })();

    pendingCaseIdRef.current = pendingCaseId;

    try {
      return await pendingCaseId;
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to create case right now.";
      setError(message);
      throw submitError;
    } finally {
      pendingCaseIdRef.current = null;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.statement.trim()) {
      setError("Add or import a statement before submitting it for analysis.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const ensuredCaseId = await ensureCaseId();
      const analysis = await analyzeCase({
        caseId: ensuredCaseId,
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
        subtitle="Type the narrative manually, upload a PDF/image/voice statement, or capture live voice input before running the same pipeline for risk scoring, emotion detection, fake-case checks, and brief generation."
      >
        {!isHydrated ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Loading saved case data...
          </div>
        ) : null}

        {isHydrated && !caseId ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No case record has been created yet. The first upload or statement submission will create
            one automatically, or you can continue from{" "}
            <Link href="/intake" className="font-semibold underline">
              the case intake form
            </Link>
            {" "}first.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <DocumentUploader
            caseId={caseId}
            ensureCaseId={ensureCaseId}
            documents={documents}
            onImported={(response) => {
              addDocument(response.document);
              appendImportedStatement(response.extractedText);
              setLatestSuggestions(response.suggestedFields);
            }}
          />

          {latestSuggestions && suggestionCount > 0 ? (
            <section className="space-y-4 rounded-[26px] border border-[rgba(123,91,45,0.16)] bg-[rgba(255,252,247,0.7)] p-5 shadow-[0_12px_30px_rgba(48,33,23,0.06)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                    Extracted Intake Hints
                  </p>
                  <h3 className="text-[1.3rem] font-semibold text-[var(--accent-strong)]">
                    The latest uploaded evidence surfaced {suggestionCount} field suggestion{suggestionCount === 1 ? "" : "s"}
                  </h3>
                  <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                    The system automatically parsed the imported text for useful intake details. Review
                    these suggestions and apply them to the form when they look correct.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={applySuggestedFields}
                    className="rounded-full bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_30px_rgba(48,33,23,0.18)] hover:bg-[var(--accent)]"
                  >
                    Apply Suggested Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatestSuggestions(null)}
                    className="rounded-full border border-[rgba(123,91,45,0.18)] bg-[rgba(255,255,255,0.55)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] hover:bg-[rgba(255,255,255,0.8)]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {latestSuggestions.victimName ? (
                  <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.58)] p-4 text-sm">
                    <p className="text-[var(--muted)]">Victim name</p>
                    <p className="mt-2 font-semibold text-[var(--accent-strong)]">{latestSuggestions.victimName}</p>
                  </div>
                ) : null}
                {latestSuggestions.age !== null ? (
                  <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.58)] p-4 text-sm">
                    <p className="text-[var(--muted)]">Age</p>
                    <p className="mt-2 font-semibold text-[var(--accent-strong)]">{latestSuggestions.age}</p>
                  </div>
                ) : null}
                {latestSuggestions.abuseType ? (
                  <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.58)] p-4 text-sm">
                    <p className="text-[var(--muted)]">Abuse type</p>
                    <p className="mt-2 font-semibold text-[var(--accent-strong)]">{latestSuggestions.abuseType}</p>
                  </div>
                ) : null}
                {latestSuggestions.frequency ? (
                  <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.58)] p-4 text-sm">
                    <p className="text-[var(--muted)]">Frequency</p>
                    <p className="mt-2 font-semibold text-[var(--accent-strong)]">{latestSuggestions.frequency}</p>
                  </div>
                ) : null}
                {latestSuggestions.threatLevel ? (
                  <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.58)] p-4 text-sm">
                    <p className="text-[var(--muted)]">Threat level</p>
                    <p className="mt-2 font-semibold text-[var(--accent-strong)]">{latestSuggestions.threatLevel}</p>
                  </div>
                ) : null}
                {latestSuggestions.timelineEvents.length > 0 ? (
                  <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.58)] p-4 text-sm">
                    <p className="text-[var(--muted)]">Timeline events</p>
                    <p className="mt-2 font-semibold text-[var(--accent-strong)]">{latestSuggestions.timelineEvents.length}</p>
                  </div>
                ) : null}
              </div>

              {latestSuggestions.incidentDescription ? (
                <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.58)] p-4 text-sm">
                  <p className="text-[var(--muted)]">Suggested incident description</p>
                  <p className="mt-2 leading-6 text-[var(--accent-strong)]">{latestSuggestions.incidentDescription}</p>
                </div>
              ) : null}

              {latestSuggestions.historySummary ? (
                <div className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.58)] p-4 text-sm">
                  <p className="text-[var(--muted)]">Suggested history summary</p>
                  <p className="mt-2 leading-6 text-[var(--accent-strong)]">{latestSuggestions.historySummary}</p>
                </div>
              ) : null}
            </section>
          ) : null}

          <VoiceInputPanel
            onTranscriptReady={(transcript) => {
              appendImportedStatement(transcript);
            }}
          />

          <div className="grid gap-3 rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.6)] p-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-[var(--muted)]">Prior complaints</p>
              <p className="mt-1 font-semibold text-[var(--accent-strong)]">{formData.priorComplaintsCount}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Timeline events</p>
              <p className="mt-1 font-semibold text-[var(--accent-strong)]">{formData.timelineEvents.length}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Threat level</p>
              <p className="mt-1 font-semibold text-[var(--accent-strong)]">{formData.threatLevel || "Not set"}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Source documents</p>
              <p className="mt-1 font-semibold text-[var(--accent-strong)]">{documents.length}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Area label</p>
              <p className="mt-1 font-semibold text-[var(--accent-strong)]">{formData.locationLabel || "Not set"}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Emergency contacts</p>
              <p className="mt-1 font-semibold text-[var(--accent-strong)]">{formData.emergencyContacts.length}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="victim-statement" className="mb-0">
                Victim statement
              </label>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                <span className="status-pill">{formData.statement.trim().length} chars</span>
                <span className="status-pill">
                  {formData.statement.trim() ? "Ready for analysis" : "Waiting for narrative"}
                </span>
              </div>
            </div>
            <textarea
              id="victim-statement"
              rows={14}
              value={formData.statement}
              onChange={(event) => updateFormData({ statement: event.target.value })}
              placeholder="Enter the victim statement for analysis, upload a PDF/image/audio file above, or append voice transcript from the mic panel..."
            />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Imported document text, uploaded audio transcripts, and accepted live voice transcripts
              land here automatically so you can review, edit, and then analyze the final narrative
              with the same rules and scoring engine as manual input.
            </p>
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !isHydrated}
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
