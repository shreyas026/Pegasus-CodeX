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
        <div className="relative space-y-4 pl-4 before:absolute before:bottom-4 before:left-[14px] before:top-4 before:w-px before:bg-[linear-gradient(180deg,rgba(199,169,118,0.08),rgba(123,91,45,0.34),rgba(138,47,47,0.18))]">
          {sortedEvents.map((event, index) => (
            <div key={`${event.date}-${event.title}-${index}`} className="relative pl-8">
              <span className="absolute left-0 top-5 h-3 w-3 rounded-full border-2 border-white bg-[var(--accent)] shadow-[0_0_0_6px_rgba(199,169,118,0.16)]" />
              <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.74)] p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[var(--accent-strong)]">{event.title}</p>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{event.date}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{event.details}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="status-pill">{event.source}</span>
                  <span className="status-pill">Step {index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
