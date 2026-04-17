"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPinned } from "lucide-react";

import { fetchHeatmap } from "@/lib/api";
import type { HeatmapPoint } from "@/lib/types";
import { Card } from "@/components/card";

function computePosition(point: HeatmapPoint, index: number, total: number) {
  if (point.locationLat !== null && point.locationLng !== null) {
    const left = Math.min(90, Math.max(10, ((point.locationLng + 180) / 360) * 100));
    const top = Math.min(86, Math.max(14, 100 - ((point.locationLat + 90) / 180) * 100));
    return { left, top };
  }

  const columns = Math.max(1, Math.ceil(Math.sqrt(total)));
  const row = Math.floor(index / columns);
  const column = index % columns;
  return {
    left: 18 + column * (62 / Math.max(1, columns - 1 || 1)),
    top: 20 + row * 18
  };
}

function hotspotSize(point: HeatmapPoint) {
  return 28 + point.highRiskCount * 10 + Math.round(point.averageRiskScore / 8);
}

function describeHeatmapError(loadError: unknown) {
  const message = loadError instanceof Error ? loadError.message : "Unable to load heatmap.";

  if (message === "Failed to fetch") {
    return "Heatmap service is temporarily unavailable. Please refresh this panel in a moment.";
  }

  return message;
}

export function HeatmapPanel() {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHeatmap() {
    setIsLoading(true);
    try {
      const response = await fetchHeatmap();
      setPoints(response);
      setError(null);
    } catch (loadError) {
      setPoints([]);
      setError(describeHeatmapError(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadHeatmap();
  }, []);

  const plottedPoints = useMemo(
    () =>
      points.map((point, index) => ({
        point,
        ...computePosition(point, index, points.length),
        size: hotspotSize(point)
      })),
    [points]
  );

  return (
    <Card
      title="High-Risk Area Heatmap"
      subtitle="Location-linked analysis clusters help NGOs and authorities identify where urgent response capacity is under pressure."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-[var(--border)] bg-[radial-gradient(circle_at_top,_rgba(199,169,118,0.24),transparent_34%),linear-gradient(180deg,rgba(48,33,23,0.94),rgba(78,56,39,0.92))]">
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(199,169,118,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(199,169,118,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="absolute inset-x-8 top-8 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[rgba(230,245,237,0.7)]">
            <span>Hotspot map</span>
            <span>{points.length} area{points.length === 1 ? "" : "s"} tracked</span>
          </div>

          {!isLoading && plottedPoints.length > 0 ? (
            plottedPoints.map(({ point, left, top, size }) => (
              <div
                key={point.label}
                className="absolute"
                style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
              >
                <div
                  className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[radial-gradient(circle,_rgba(255,110,110,0.85),_rgba(229,76,76,0.26)_55%,_transparent_72%)] shadow-[0_0_40px_rgba(229,76,76,0.24)]"
                  style={{ width: size, height: size }}
                />
                <div className="mt-2 rounded-full bg-[rgba(6,15,12,0.8)] px-3 py-1 text-xs text-[rgba(240,251,244,0.9)] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  {point.label}
                </div>
              </div>
            ))
          ) : null}

          {isLoading ? (
            <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-4 py-4 text-sm text-[rgba(230,245,237,0.82)]">
              Loading location clusters...
            </div>
          ) : null}

          {!isLoading && plottedPoints.length === 0 ? (
            <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-4 py-4 text-sm text-[rgba(230,245,237,0.82)]">
              No location-tagged cases yet. Add an area label during intake to populate the heatmap.
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.6)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <MapPinned className="h-4 w-4" />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                  Deployment View
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadHeatmap()}
                className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.7)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)] transition hover:bg-white"
              >
                Refresh
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Areas with the highest high-risk counts should be prioritized for outreach, police
              coordination, and shelter availability planning.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-[rgba(156,60,68,0.24)] bg-[linear-gradient(135deg,rgba(156,60,68,0.12),rgba(255,255,255,0.72))] px-4 py-4 text-sm text-[#7a1f2a]">
              <p className="font-semibold">Heatmap unavailable</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          ) : null}

          {points.slice(0, 5).map((point) => (
            <article
              key={point.label}
              className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[var(--accent-strong)]">{point.label}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {point.totalCount} case{point.totalCount === 1 ? "" : "s"} linked to this area
                  </p>
                </div>
                <span className="status-pill">{point.highRiskCount} high risk</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[rgba(15,50,37,0.1)]">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,var(--low),var(--high))]"
                  style={{ width: `${Math.max(8, point.averageRiskScore)}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Average risk score:{" "}
                <span className="font-semibold text-[var(--accent-strong)]">
                  {point.averageRiskScore}/100
                </span>
              </p>
            </article>
          ))}

          {!error && !isLoading && points.length === 0 ? (
            <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--accent-strong)]">Heatmap prerequisites</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Add a location label in the intake form.</li>
                <li>Save the case so it appears in area tracking.</li>
              </ul>
              <Link
                href="/intake"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.75)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)] transition hover:bg-white"
              >
                Go to Intake
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
