import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, aside }: PageHeaderProps) {
  return (
    <section className="surface-panel overflow-hidden rounded-[30px]">
      <div className="grid gap-6 bg-[radial-gradient(circle_at_top_left,_rgba(199,169,118,0.24),_transparent_32%),linear-gradient(135deg,rgba(255,252,247,0.95),rgba(243,235,221,0.76))] px-6 py-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.7fr)] lg:px-8">
        <div>
          <p className="display-kicker text-[0.7rem] font-semibold uppercase tracking-[0.26em]">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-4xl text-[2rem] leading-tight font-semibold text-[var(--accent-strong)] sm:text-[2.5rem]">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-[0.98rem]">
            {description}
          </p>
        </div>
        <div className="rounded-[24px] border border-[rgba(123,91,45,0.16)] bg-[rgba(255,252,246,0.84)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          {aside}
        </div>
      </div>
    </section>
  );
}
