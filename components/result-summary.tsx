import type { AnalysisResult } from "@/lib/types";

const severityClass: Record<AnalysisResult["severity"], string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800"
};

export function ResultSummary({ result }: { result: AnalysisResult }) {
  const severityLabel = `${result.severity.charAt(0).toUpperCase()}${result.severity.slice(1)}`;
  const escalationLabel = `${result.escalationLevel.charAt(0).toUpperCase()}${result.escalationLevel.slice(1)}`;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] p-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Severity</p>
        <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${severityClass[result.severity]}`}>
          {severityLabel}
        </p>
      </div>
      <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] p-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Risk Score</p>
        <p className="mt-3 text-3xl font-semibold text-[var(--accent-strong)]">{result.riskScore}/100</p>
      </div>
      <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] p-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Escalation Level</p>
        <p
          className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${severityClass[result.escalationLevel]}`}
        >
          {escalationLabel}
        </p>
      </div>
      <div className="rounded-[24px] border border-[rgba(123,91,45,0.14)] bg-[rgba(255,252,247,0.72)] p-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Escalation Score</p>
        <p className="mt-3 text-3xl font-semibold text-[var(--accent-strong)]">{result.escalationScore}/100</p>
      </div>
    </div>
  );
}
