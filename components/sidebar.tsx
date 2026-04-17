"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems: { href: Route; label: string }[] = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/intake", label: "Case Intake Form" },
  { href: "/statement", label: "Statement Analysis" },
  { href: "/result", label: "Risk Result" },
  { href: "/brief", label: "Generated Brief" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface-panel sticky top-4 w-full overflow-hidden rounded-[28px] text-[var(--accent-strong)] lg:w-[296px] lg:flex-shrink-0 lg:min-h-[calc(100vh-2rem)]">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(199,169,118,0.22),_transparent_38%),linear-gradient(180deg,rgba(255,252,247,0.86),rgba(243,235,221,0.66))] p-4">
        <div className="flex items-center justify-between">
          <span className="status-pill">Safety AI</span>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Full Suite
          </span>
        </div>
        <div className="mt-6">
          <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
            Domestic Violence
          </p>
          <h1 className="mt-3 text-[1.8rem] leading-tight font-semibold">Case Pattern Analyzer</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Privacy-first case intelligence platform for intake review, chronology analysis, risk
            prioritization, and hearing-ready briefs.
          </p>
        </div>
      </div>
      <div className="editorial-rule mx-4" />
      <nav className="space-y-2 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                isActive
                  ? "border-[rgba(123,91,45,0.16)] bg-[rgba(123,91,45,0.08)] text-[var(--accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  : "border-transparent text-[var(--muted)] hover:border-[rgba(123,91,45,0.14)] hover:bg-[rgba(255,255,255,0.3)] hover:text-[var(--accent-strong)]"
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span
                className={`text-[0.68rem] uppercase tracking-[0.18em] ${
                  isActive ? "text-[var(--accent)]" : "text-[rgba(69,101,87,0.75)] group-hover:text-[var(--accent)]"
                }`}
              >
                Open
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mx-3 mb-3 rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.22)] p-4 backdrop-blur-[24px]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Feature Coverage
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--accent-strong)]">
          AI analysis, voice intake, real-time alerts, support chat, heatmaps, repeat-offender linking, privacy controls, and brief generation.
        </p>
      </div>
    </aside>
  );
}
