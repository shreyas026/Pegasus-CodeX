import type { TimelineEvent } from "@/lib/types";

interface TimelineViewerProps {
  events: TimelineEvent[];
  summary?: string;
}

export function TimelineViewer({ events, summary }: TimelineViewerProps) {
  const sortedEvents = [...events].sort((left, right) => left.date.localeCompare(right.date));

  return (
    <section className="surface-panel rounded-[26px] p-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Timeline Viewer
      </h3>
      {summary ? <p className="mb-4 text-sm leading-6 text-[var(--muted)]">{summary}</p> : null}

      {sortedEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(123,91,45,0.2)] bg-[rgba(255,255,255,0.7)] px-4 py-4 text-sm text-[var(--muted)]">
          No timeline events available for this case.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((event, index) => (
            <div key={`${event.date}-${event.title}-${index}`} className="rounded-2xl border border-[rgba(123,91,45,0.14)] bg-[rgba(255,255,255,0.75)] p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-[var(--accent-strong)]">{event.title}</p>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{event.date}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{event.details}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Source: {event.source}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
