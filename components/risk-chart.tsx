import type { ChartPoint } from "@/lib/types";

export function RiskChart({ points }: { points: ChartPoint[] }) {
  return (
    <div className="space-y-3">
      {points.map((point) => (
        <div key={point.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-slate-700">{point.label}</span>
            <span className="font-medium text-slate-800">{point.value}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-slate-700" style={{ width: `${point.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
