import type { AnalysisResult, ChartPoint, IntakeFormData } from "@/lib/types";

const threatScores: Record<IntakeFormData["threatLevel"], number> = {
  low: 30,
  medium: 60,
  high: 90
};

const frequencyScores: Record<IntakeFormData["frequency"], number> = {
  rare: 25,
  occasional: 55,
  frequent: 85
};

export function buildChartPoints(
  analysis: AnalysisResult,
  formData: IntakeFormData
): ChartPoint[] {
  return [
    { label: "Overall Risk", value: analysis.riskScore },
    { label: "Escalation Risk", value: analysis.escalationScore },
    { label: "Threat Level", value: threatScores[formData.threatLevel] },
    { label: "Frequency Signal", value: frequencyScores[formData.frequency] },
    {
      label: "Pattern Density",
      value: Math.min(100, Math.max(20, analysis.abusePatterns.length * 25))
    }
  ];
}
