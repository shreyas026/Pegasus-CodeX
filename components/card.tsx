import type { ReactNode } from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <section className="surface-panel overflow-hidden rounded-[30px] p-0">
      <div className="h-1.5 bg-gradient-to-r from-transparent via-[var(--accent-soft)] to-transparent" />
      <header className="px-6 pb-0 pt-6">
        <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
          Case Intelligence
        </p>
        <h2 className="mt-2 text-[1.55rem] font-semibold text-[var(--accent-strong)]">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
        <div className="editorial-rule mt-5" />
      </header>
      <div className="px-6 py-6">
        {children}
      </div>
    </section>
  );
}
