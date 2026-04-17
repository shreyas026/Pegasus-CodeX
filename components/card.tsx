import type { ReactNode } from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <section className="surface-panel overflow-hidden rounded-[28px] p-0">
      <div className="h-1 bg-gradient-to-r from-transparent via-[var(--accent-soft)] to-transparent" />
      <header className="px-5 pb-0 pt-5">
        <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
          Case Intelligence
        </p>
        <h2 className="mt-2 text-[1.42rem] font-semibold text-[var(--accent-strong)]">{title}</h2>
        {subtitle ? (
          <p className="mt-2 max-w-3xl text-[0.98rem] leading-7 text-[var(--muted)] sm:text-[1rem]">
            {subtitle}
          </p>
        ) : null}
        <div className="editorial-rule mt-4" />
      </header>
      <div className="px-5 py-5">
        {children}
      </div>
    </section>
  );
}
