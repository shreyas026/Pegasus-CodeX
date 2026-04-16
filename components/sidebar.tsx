"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems: { href: Route; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/intake", label: "Case Intake Form" },
  { href: "/statement", label: "Statement Analysis" },
  { href: "/result", label: "Risk Result" },
  { href: "/brief", label: "Generated Brief" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface-panel sticky top-5 w-full overflow-hidden rounded-[28px] text-[var(--accent-strong)] lg:w-[320px] lg:min-h-[calc(100vh-2.5rem)]">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(199,169,118,0.24),_transparent_38%),linear-gradient(180deg,rgba(255,252,247,0.95),rgba(243,235,221,0.82))] p-5">
        <div className="flex items-center justify-between">
          <span className="status-pill">Legal-Tech</span>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Case Review
          </span>
        </div>
        <div className="mt-8">
          <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
            Domestic Violence
          </p>
          <h1 className="mt-3 text-[2rem] leading-tight font-semibold">Case Pattern Analyzer</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Privacy-first legal-tech workspace for intake review, chronology analysis, risk
            prioritization, and hearing-ready briefs.
          </p>
        </div>
      </div>
      <div className="editorial-rule mx-5" />
      <nav className="space-y-2 px-4 py-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                isActive
                  ? "border-[var(--accent-soft)] bg-[rgba(123,91,45,0.08)] text-[var(--accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  : "border-transparent text-[var(--muted)] hover:border-[rgba(123,91,45,0.14)] hover:bg-[rgba(255,252,247,0.75)] hover:text-[var(--accent-strong)]"
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span
                className={`text-[0.68rem] uppercase tracking-[0.18em] ${
                  isActive ? "text-[var(--accent)]" : "text-[rgba(93,85,76,0.7)] group-hover:text-[var(--accent)]"
                }`}
              >
                Open
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mx-4 mb-4 rounded-[22px] border border-[rgba(123,91,45,0.16)] bg-[rgba(255,252,247,0.72)] p-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          System Posture
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--accent-strong)]">
          Explainable scoring, redacted narratives, chronology-aware review, and structured NGO support outputs.
        </p>
      </div>
    </aside>
  );
}
