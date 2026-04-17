import { AlertTriangle, CheckCircle, HelpCircle, Map, Target } from "lucide-react";
import { Card } from "./card";
import type { SafeActionNavigator as SafeActionNavigatorType } from "@/lib/types";

interface SafeActionNavigatorProps {
  data: SafeActionNavigatorType;
}

export function SafeActionNavigator({ data }: SafeActionNavigatorProps) {
  const getUrgencyColor = (urgency: string) => {
    const text = urgency.toLowerCase();
    if (text.includes("critical") || text.includes("high") || text.includes("24h") || text.includes("immediate")) {
      return "text-[#7a1f2a] bg-[rgba(156,60,68,0.12)] border-[rgba(156,60,68,0.28)]";
    }
    if (text.includes("moderate") || text.includes("72h")) {
      return "text-[#6f5310] bg-[rgba(185,147,50,0.12)] border-[rgba(185,147,50,0.3)]";
    }
    return "text-[var(--low)] bg-[rgba(43,141,99,0.1)] border-[rgba(43,141,99,0.24)]";
  };

  return (
    <Card 
      title="Safe Action Navigator" 
      subtitle="Context-aware trauma-informed checklist and referral suggestions based on extracted case flags."
    >
      <div className="space-y-6">
        {/* Urgency Banner */}
        <div className={`rounded-xl border p-4 shadow-sm flex items-center gap-4 ${getUrgencyColor(data.urgency)}`}>
          <Target className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Response Urgency</h3>
            <p className="font-semibold text-lg">{data.urgency}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Immediate Danger Flags */}
          <section className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.65)] p-5">
            <header className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-[var(--high)]" />
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--accent-strong)]">Immediate Danger Flags</h3>
            </header>
            {data.immediateFlags.length > 0 ? (
              <ul className="space-y-3">
                {data.immediateFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text)]">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-[var(--muted)]">No immediate triggers detected.</p>
            )}
          </section>

          {/* Evidence To Collect Next */}
          <section className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.65)] p-5">
            <header className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-[var(--low)]" />
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--accent-strong)]">Evidence Checklist</h3>
            </header>
            {data.evidenceToCollect.length > 0 ? (
              <ul className="space-y-3">
                {data.evidenceToCollect.map((evidence, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text)]">
                    <div className="mt-1 h-3 w-3 flex-shrink-0 rounded-[3px] border-2 border-[var(--accent)]" />
                    <span>{evidence}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-[var(--muted)]">All critical evidence documented.</p>
            )}
          </section>

          {/* Questions Still Missing */}
          <section className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.65)] p-5">
            <header className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--accent-strong)]">Missing Context</h3>
            </header>
            {data.missingQuestions.length > 0 ? (
              <ul className="space-y-3">
                {data.missingQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text)]">
                    <span className="font-bold text-[var(--accent)]">?</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-[var(--muted)]">Statement appears complete for initial review.</p>
            )}
          </section>

          {/* Recommended Referrals */}
          <section className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.65)] p-5">
            <header className="flex items-center gap-2 mb-4">
              <Map className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--accent-strong)]">Agency Referrals</h3>
            </header>
            {data.referralSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.referralSuggestions.map((ref, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[rgba(199,169,118,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
                    {ref}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--muted)]">No external referrals suggested.</p>
            )}
          </section>
        </div>
      </div>
    </Card>
  );
}
