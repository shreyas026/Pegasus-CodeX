"use client";

import type { TimelineEvent } from "@/lib/types";

interface TimelineEditorProps {
  events: TimelineEvent[];
  onChange: (events: TimelineEvent[]) => void;
}

const emptyTimelineEvent: TimelineEvent = {
  date: "",
  title: "",
  details: "",
  source: "Victim statement"
};

export function TimelineEditor({ events, onChange }: TimelineEditorProps) {
  const completedEvents = events.filter(
    (event) => event.date.trim() && event.title.trim() && event.details.trim()
  ).length;

  function updateEvent(index: number, field: keyof TimelineEvent, value: string) {
    const nextEvents = [...events];
    nextEvents[index] = {
      ...nextEvents[index],
      [field]: value
    };
    onChange(nextEvents);
  }

  function addEvent() {
    onChange([...events, { ...emptyTimelineEvent }]);
  }

  function removeEvent(index: number) {
    onChange(events.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.52)] p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Entries
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--accent-strong)]">{events.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.52)] p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Complete
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--accent-strong)]">{completedEvents}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.52)] p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Coverage
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--accent-strong)]">
            {events.length === 0 ? "0%" : `${Math.round((completedEvents / events.length) * 100)}%`}
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[rgba(255,255,255,0.46)] px-4 py-5 text-sm text-[var(--muted)]">
          No timeline events added yet.
        </div>
      ) : null}

      {events.map((event, index) => (
        <div
          key={`${event.date}-${index}`}
          className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-4 shadow-[0_10px_25px_rgba(6,17,13,0.05)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-strong)] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--accent-strong)]">
                  Timeline Event {index + 1}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  {event.title.trim() ? "Draft recorded" : "Waiting for title"}
                </p>
              </div>
            </div>
            <span className="status-pill">
              {event.date.trim() && event.title.trim() && event.details.trim() ? "Complete" : "In progress"}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor={`timeline-date-${index}`}>Date</label>
              <input
                id={`timeline-date-${index}`}
                type="date"
                value={event.date}
                onChange={(currentEvent) => updateEvent(index, "date", currentEvent.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`timeline-source-${index}`}>Source</label>
              <input
                id={`timeline-source-${index}`}
                value={event.source}
                onChange={(currentEvent) => updateEvent(index, "source", currentEvent.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor={`timeline-title-${index}`}>Event title</label>
            <input
              id={`timeline-title-${index}`}
              value={event.title}
              onChange={(currentEvent) => updateEvent(index, "title", currentEvent.target.value)}
            />
          </div>

          <div className="mt-3">
            <label htmlFor={`timeline-details-${index}`}>Details</label>
            <textarea
              id={`timeline-details-${index}`}
              rows={3}
              value={event.details}
              onChange={(currentEvent) => updateEvent(index, "details", currentEvent.target.value)}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => removeEvent(index)}
              className="rounded-full border border-[var(--border-strong)] bg-[rgba(255,255,255,0.56)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] hover:bg-white"
            >
              Remove Event
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEvent}
        className="rounded-full border border-[var(--border-strong)] bg-[rgba(255,255,255,0.58)] px-5 py-3 text-sm font-medium text-[var(--accent-strong)] hover:bg-white"
      >
        Add Timeline Event
      </button>
    </div>
  );
}
