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
  const { formData, updateFormData, setCaseId, setAnalysis, setDocuments } = useCaseStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const emergencyContactsValue = formData.emergencyContacts.join("\n");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (
      !formData.victimName.trim() ||
      formData.age <= 0 ||
      !formData.abuseType.trim() ||
      !formData.frequency ||
      !formData.threatLevel ||
      !formData.incidentDescription.trim()
    ) {
      setError(
        "Complete victim name, age, abuse type, frequency, threat level, and incident description before saving the intake."
      );
      return;
    }

    if (
      formData.timelineEvents.some(
        (event) => !event.date.trim() || !event.title.trim() || !event.details.trim()
      )
    ) {
      setError("Complete or remove unfinished timeline events before saving the intake.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createCase(formData);
      setCaseId(response.caseId);
      setAnalysis(null);
      setDocuments(response.data.documents);
      router.push("/statement");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to create case right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEmergencyContacts(value: string) {
    const contacts = value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    updateFormData({ emergencyContacts: contacts });
  }

  function handleUseLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFormData({
          locationLat: Number(position.coords.latitude.toFixed(6)),
          locationLng: Number(position.coords.longitude.toFixed(6))
        });
      },
      () => {
        setLocationError("Location permission was denied. You can still enter the area name manually.");
      }
    );
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
              <p>Threat level: <span className="font-semibold text-[var(--accent-strong)]">{formData.threatLevel || "Not set"}</span></p>
              <p>Prior complaints: <span className="font-semibold text-[var(--accent-strong)]">{formData.priorComplaintsCount}</span></p>
              <p>Frequency: <span className="font-semibold text-[var(--accent-strong)]">{formData.frequency || "Not set"}</span></p>
              <p>Area: <span className="font-semibold text-[var(--accent-strong)]">{formData.locationLabel || "Not mapped"}</span></p>
            </div>
          </div>
        }
      />

      <Card title="Case Intake Form" subtitle="Capture baseline details for risk triage">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2 grid gap-3 xl:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.56)] p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Incident Detail
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--accent-strong)]">
                  {formData.incidentDescription.trim().length}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">Characters in the primary incident narrative.</p>
              </div>
              <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.56)] p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  History Depth
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--accent-strong)]">
                  {formData.historySummary.trim().length}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">Characters of history and complaint context.</p>
              </div>
              <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.56)] p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Timeline Health
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--accent-strong)]">
                  {formData.timelineEvents.filter((event) => event.date && event.title && event.details).length}/
                  {formData.timelineEvents.length}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">Timeline entries with full date, title, and detail.</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[linear-gradient(135deg,rgba(255,252,247,0.95),rgba(242,231,211,0.84))] p-5">
              <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                Next Step
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--accent-strong)]">
                Save intake, then import the survivor statement as a PDF, image, or voice note
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                The statement page now acts like an evidence intake step. Once this case is saved,
                you can upload a scanned complaint, photo, or PDF, or dictate the narrative by voice,
                and then run the same analysis on the extracted text. Area tags and emergency contacts
                from this screen also power the panic button, heatmap, and live alert routing.
              </p>
            </div>
          </div>

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
              value={formData.age === 0 ? "" : formData.age}
              min={1}
              max={120}
              onChange={(event) => updateFormData({ age: Number(event.target.value) || 0 })}
              placeholder="Enter age"
            />
          </div>

          <div>
            <label htmlFor="abuse-type">Type of abuse</label>
            <select
              id="abuse-type"
              value={formData.abuseType}
              onChange={(event) => updateFormData({ abuseType: event.target.value })}
            >
              <option value="">Select abuse type</option>
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
              <option value="">Select frequency</option>
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
              <option value="">Select threat level</option>
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
              value={formData.priorComplaintsCount === 0 ? "" : formData.priorComplaintsCount}
              onChange={(event) =>
                updateFormData({ priorComplaintsCount: Number(event.target.value) || 0 })
              }
              placeholder="0"
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

          <div className="md:col-span-2 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.56)] p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Location Context
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Add a locality label so the heatmap and emergency alerts can surface high-risk areas.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="location-label">Area / locality label</label>
                  <input
                    id="location-label"
                    value={formData.locationLabel}
                    onChange={(event) => updateFormData({ locationLabel: event.target.value })}
                    placeholder="Example: Bengaluru East, Sector 12, Ward 8"
                  />
                </div>
                <div>
                  <label htmlFor="location-lat">Latitude (optional)</label>
                  <input
                    id="location-lat"
                    type="number"
                    value={formData.locationLat ?? ""}
                    onChange={(event) =>
                      updateFormData({ locationLat: event.target.value ? Number(event.target.value) : null })
                    }
                    placeholder="12.9716"
                  />
                </div>
                <div>
                  <label htmlFor="location-lng">Longitude (optional)</label>
                  <input
                    id="location-lng"
                    type="number"
                    value={formData.locationLng ?? ""}
                    onChange={(event) =>
                      updateFormData({ locationLng: event.target.value ? Number(event.target.value) : null })
                    }
                    placeholder="77.5946"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseLocation}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(123,91,45,0.18)] bg-[rgba(255,255,255,0.72)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)] transition hover:bg-white"
              >
                Use current location
              </button>
              {locationError ? (
                <p className="mt-2 text-xs text-red-600">{locationError}</p>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.56)] p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Emergency Contacts
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                List trusted contacts or NGO hotlines that should receive SOS alerts.
              </p>
              <label htmlFor="emergency-contacts" className="mt-3 block">
                Contacts (comma or new line separated)
              </label>
              <textarea
                id="emergency-contacts"
                rows={4}
                value={emergencyContactsValue}
                onChange={(event) => handleEmergencyContacts(event.target.value)}
                placeholder="NGO Hotline\nSister: +91-9000000001"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label>Timeline events</label>
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
