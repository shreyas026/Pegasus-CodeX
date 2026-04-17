import type { ChartPoint } from "@/lib/types";

export function RiskChart({ points }: { points: ChartPoint[] }) {
  return (
    <div className="space-y-3">
      {points.map((point) => (
        <div key={point.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">{point.label}</span>
            <span className="font-medium text-[var(--accent-strong)]">{point.value}</span>
          </div>
          <div className="h-2 rounded-full bg-[rgba(15,50,37,0.1)]">
            <div
              className="h-2 rounded-full bg-[linear-gradient(90deg,var(--low),var(--accent),var(--high))]"
              style={{ width: `${point.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
