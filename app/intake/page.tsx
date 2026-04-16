"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader } from "@/components/page-header";
import { TimelineEditor } from "@/components/timeline-editor";
import { useCaseStore } from "@/components/case-provider";
import { createCase } from "@/lib/api";

export default function IntakePage() {
  const router = useRouter();
  const { formData, updateFormData, setCaseId, setAnalysis } = useCaseStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await createCase(formData);
      setCaseId(response.caseId);
      setAnalysis(null);
      router.push("/statement");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to create case right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Intake"
        title="Capture structured evidence with chronology, risk context, and case history from the very first touchpoint."
        description="The intake flow now mirrors the documentation more closely: baseline victim details, abuse-type signals, prior complaints, history summary, and a timeline builder that sets up later analysis and brief generation."
        aside={
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Intake Snapshot
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--accent-strong)]">
                {formData.timelineEvents.length} recorded event{formData.timelineEvents.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="editorial-rule" />
            <div className="space-y-2 text-[var(--muted)]">
              <p>Threat level: <span className="font-semibold text-[var(--accent-strong)]">{formData.threatLevel}</span></p>
              <p>Prior complaints: <span className="font-semibold text-[var(--accent-strong)]">{formData.priorComplaintsCount}</span></p>
              <p>Frequency: <span className="font-semibold text-[var(--accent-strong)]">{formData.frequency}</span></p>
            </div>
          </div>
        }
      />

      <Card title="Case Intake Form" subtitle="Capture baseline details for risk triage">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="victim-name">Victim name</label>
            <input
              id="victim-name"
              value={formData.victimName}
              onChange={(event) => updateFormData({ victimName: event.target.value })}
            />
          </div>

          <div>
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              value={formData.age}
              min={1}
              max={120}
              onChange={(event) => updateFormData({ age: Number(event.target.value) || 0 })}
            />
          </div>

          <div>
            <label htmlFor="abuse-type">Type of abuse</label>
            <select
              id="abuse-type"
              value={formData.abuseType}
              onChange={(event) => updateFormData({ abuseType: event.target.value })}
            >
              <option>Physical abuse</option>
              <option>Psychological and verbal abuse</option>
              <option>Financial abuse</option>
              <option>Verbal abuse</option>
              <option>Mixed abuse</option>
            </select>
          </div>

          <div>
            <label htmlFor="frequency">Frequency</label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(event) =>
                updateFormData({
                  frequency: event.target.value as typeof formData.frequency
                })
              }
            >
              <option value="rare">Rare</option>
              <option value="occasional">Occasional</option>
              <option value="frequent">Frequent</option>
            </select>
          </div>

          <div>
            <label htmlFor="threat-level">Threat level</label>
            <select
              id="threat-level"
              value={formData.threatLevel}
              onChange={(event) =>
                updateFormData({
                  threatLevel: event.target.value as typeof formData.threatLevel
                })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="incident-description">Incident description</label>
            <textarea
              id="incident-description"
              rows={5}
              value={formData.incidentDescription}
              onChange={(event) => updateFormData({ incidentDescription: event.target.value })}
            />
          </div>

          <div>
            <label htmlFor="prior-complaints">Prior complaints count</label>
            <input
              id="prior-complaints"
              type="number"
              min={0}
              value={formData.priorComplaintsCount}
              onChange={(event) =>
                updateFormData({ priorComplaintsCount: Number(event.target.value) || 0 })
              }
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="history-summary">History summary</label>
            <textarea
              id="history-summary"
              rows={4}
              value={formData.historySummary}
              onChange={(event) => updateFormData({ historySummary: event.target.value })}
              placeholder="Summarize prior complaints, police contact, family intervention, or case history..."
            />
          </div>

          <div className="md:col-span-2">
            <label>Timeline / history viewer input</label>
            <TimelineEditor
              events={formData.timelineEvents}
              onChange={(timelineEvents) => updateFormData({ timelineEvents })}
            />
          </div>

          {error ? (
            <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(48,33,23,0.18)] hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {isSubmitting ? <LoadingSpinner /> : null}
              {isSubmitting ? "Saving Intake..." : "Save Intake"}
            </button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
