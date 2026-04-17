import type { AnalysisResult, ChartPoint, DraftFrequency, DraftSeverity, IntakeFormState } from "@/lib/types";

const threatScores: Record<DraftSeverity, number> = {
  "": 0,
  low: 30,
  medium: 60,
  high: 90
};

const frequencyScores: Record<DraftFrequency, number> = {
  "": 0,
  rare: 25,
  occasional: 55,
  frequent: 85
};

export function buildChartPoints(
  analysis: AnalysisResult,
  formData: IntakeFormState
): ChartPoint[] {
  return [
    { label: "Overall Risk", value: analysis.riskScore },
    { label: "Escalation Risk", value: analysis.escalationScore },
    { label: "Stress Signal", value: analysis.stressScore },
    { label: "Threat Level", value: threatScores[formData.threatLevel] },
    { label: "Frequency Signal", value: frequencyScores[formData.frequency] },
    {
      label: "Pattern Density",
      value: Math.min(100, Math.max(20, analysis.abusePatterns.length * 25))
    },
    { label: "Verification Risk", value: analysis.fakeCaseScore }
  ];
}
