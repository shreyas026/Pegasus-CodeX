import type { LegalReferenceSuggestion } from "@/lib/types";

interface LegalReferencePanelProps {
  items: LegalReferenceSuggestion[];
}

export function LegalReferencePanel({ items }: LegalReferencePanelProps) {
  return (
    <section className="surface-panel rounded-[26px] p-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Legal Reference Aid
      </h3>
      <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
        These references are topic-level aids for NGO and legal-team review. They are not legal advice
        or an automated legal conclusion.
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.title}-${item.source}`} className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.78)] p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[var(--accent-strong)]">{item.title}</p>
              <span className="text-xs uppercase tracking-wide text-[var(--muted)]">{item.source}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.note}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              <span className="font-medium text-[var(--accent-strong)]">Why surfaced:</span> {item.rationale}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
