import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Bot,
  FileText,
  Fingerprint,
  HeartPulse,
  MapPinned,
  Mic,
  Radar,
  Scale,
  ShieldCheck,
  Siren,
  Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Case Pattern Analyzer | Domestic violence risk intelligence",
  description:
    "Privacy-first domestic violence case intelligence with alerts, heatmaps, voice intake, support chat, repeat-offender linking, and advocate-ready briefs."
};

const featureGroups = [
  {
    title: "Real-Time Risk Alert System",
    description: "Automatic high-risk alerts plus manual panic escalation routed to NGOs, police, and emergency contacts.",
    icon: BellRing
  },
  {
    title: "Voice-Based Complaint Analysis",
    description: "Victims can speak instead of typing using live microphone capture and audio-file transcription.",
    icon: Mic
  },
  {
    title: "Emotion & Stress Detection",
    description: "Fear, anxiety, panic, and stress signals are extracted from the narrative for hidden-danger screening.",
    icon: HeartPulse
  },
  {
    title: "Heatmap of High-Risk Areas",
    description: "Location-linked case clusters surface hotspot zones for targeted deployment and intervention planning.",
    icon: MapPinned
  },
  {
    title: "Repeat Offender Detection",
    description: "Pattern signatures connect related anonymized cases so repeat-risk behavior is not missed.",
    icon: Fingerprint
  },
  {
    title: "Legal Suggestion Engine",
    description: "Relevant IPC, BNS, and PWDVA topic references are surfaced directly inside the result workflow.",
    icon: Scale
  },
  {
    title: "Mobile-Ready Panic Button",
    description: "A floating SOS trigger sends an emergency alert with case context and location routing support.",
    icon: Siren
  },
  {
    title: "Chatbot for Victim Support",
    description: "A 24/7 support assistant answers what to do next, where to report, and how to reach help.",
    icon: Bot
  },
  {
    title: "Advanced Privacy Protection",
    description: "Redaction, anonymous IDs, encrypted storage support, and privacy summaries protect survivor data.",
    icon: ShieldCheck
  },
  {
    title: "Timeline Visualization",
    description: "Chronology is visualized as a progression trail so escalation becomes easy to understand in seconds.",
    icon: Radar
  },
  {
    title: "Fake Case Detection",
    description: "Consistency checks flag contradictions for review without overriding advocate judgment.",
    icon: Sparkles
  },
  {
    title: "AI Prediction Model",
    description: "AI models classify severity, escalation, and abuse patterns from survivor narratives, history, and chronology.",
    icon: FileText
  }
];

const workflow = [
  "Capture intake, location, emergency contacts, and case history in one record.",
  "Import typed, scanned, photographed, or spoken complaints into the same analysis pipeline.",
  "Score severity, escalation risk, abuse patterns, stress signals, and verification flags.",
  "Generate alerts, hotspot visibility, legal references, safe actions, and an advocate-ready brief."
];

function SectionTag({ children }: { children: string }) {
  return (
    <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.26em]">
      {children}
    </p>
  );
}

export default function HomePage() {
  return (
    <div className="page-fade relative isolate">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_top_left,rgba(199,169,118,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(123,91,45,0.18),transparent_34%)]" />

      <div className="relative mx-auto w-full max-w-[1680px] px-4 pb-12 pt-4 sm:px-5 lg:px-6">
        <nav className="surface-panel flex flex-col gap-4 rounded-[28px] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),#c7a976)] text-white shadow-[0_16px_32px_rgba(48,33,23,0.18)]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--accent-strong)]">Case Pattern Analyzer</p>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Domestic violence intelligence suite
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a href="#features" className="rounded-full px-4 py-2 text-[var(--muted)] transition hover:bg-[rgba(255,255,255,0.26)] hover:text-[var(--accent-strong)]">
              Features
            </a>
            <a href="#workflow" className="rounded-full px-4 py-2 text-[var(--muted)] transition hover:bg-[rgba(255,255,255,0.26)] hover:text-[var(--accent-strong)]">
              Workflow
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-5 py-3 font-medium text-white shadow-[0_14px_30px_rgba(6,17,13,0.18)] transition hover:bg-[var(--accent)]"
            >
              Open platform
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className="surface-panel overflow-hidden rounded-[32px] px-5 py-7 sm:px-6 lg:px-8 lg:py-8">
            <div className="max-w-[820px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.24)] px-4 py-2 text-sm text-[var(--accent-strong)] backdrop-blur-[20px]">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                End-to-end protection, review, and legal-preparation features are integrated
              </div>

              <SectionTag>Privacy-first legal aid workflow</SectionTag>
              <h1 className="headline-balance mt-4 max-w-[18ch] text-[2.8rem] leading-[0.95] font-semibold tracking-[-0.05em] text-[var(--accent-strong)] sm:text-[3.8rem] xl:text-[4.8rem]">
                Full-screen case intelligence for urgent survivor protection.
              </h1>
              <p className="mt-5 max-w-[720px] text-[1.02rem] leading-8 text-[var(--muted)]">
                This platform processes anonymized intake forms, statements, documents, and voice
                complaints to detect abuse patterns, score severity, predict escalation, generate
                advocate-ready briefs, trigger alerts, and surface area-level risk patterns without
                losing privacy controls.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/intake"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(6,17,13,0.18)] transition hover:bg-[var(--accent)]"
                >
                  Start case intake
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/result"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[rgba(255,255,255,0.24)] px-5 py-3 text-sm font-medium text-[var(--accent-strong)] transition hover:bg-[rgba(255,255,255,0.34)] backdrop-blur-[20px]"
                >
                  Review intelligence view
                  <Radar className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Inputs
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--accent-strong)]">4</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Intake form, free-text statement, case timeline, and legal references.
                  </p>
                </div>
                <div className="rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Feature Modules
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--accent-strong)]">12</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Alerts, chat, heatmap, voice, privacy, repeat-offender, and more.
                  </p>
                </div>
                <div className="rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Outcomes
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--accent-strong)]">1</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    One connected safety-to-briefing flow instead of fragmented screens.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="surface-panel rounded-[30px] p-5">
              <SectionTag>Live outputs</SectionTag>
              <div className="mt-4 space-y-4">
                <div className="rounded-[24px] bg-[linear-gradient(135deg,var(--accent-strong),#5d4733)] p-5 text-white">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.7)]">
                    Response stack
                  </p>
                  <p className="mt-3 text-2xl font-semibold">Risk score + escalation + legal brief</p>
                </div>
                <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.24)] p-5 backdrop-blur-[22px]">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Safety stack
                  </p>
                  <p className="mt-3 text-lg font-semibold text-[var(--accent-strong)]">
                    Panic button, alert queue, support chatbot, and hotspot visibility
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-panel rounded-[30px] p-5">
              <SectionTag>Platform Highlights</SectionTag>
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <li className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.22)] px-4 py-3 backdrop-blur-[20px]">
                  A full-screen command layout keeps intake, alerts, heatmaps, and legal preparation in one connected flow.
                </li>
                <li className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.22)] px-4 py-3 backdrop-blur-[20px]">
                  Glassmorphism styling and calm layered surfaces support a professional, privacy-first experience.
                </li>
                <li className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.22)] px-4 py-3 backdrop-blur-[20px]">
                  Emergency action, hotspot monitoring, and case review remain visible throughout the product journey.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="features" className="mt-5">
          <div className="surface-panel rounded-[32px] px-5 py-7 sm:px-6">
            <SectionTag>Feature Matrix</SectionTag>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="headline-balance max-w-[20ch] text-[2.2rem] leading-[0.98] font-semibold tracking-[-0.045em] text-[var(--accent-strong)] sm:text-[3rem]">
                  The complete feature set is now visible in the product.
                </h2>
                <p className="mt-4 max-w-[760px] text-[1.02rem] leading-8 text-[var(--muted)]">
                  Each module contributes to one connected response system, helping NGOs and legal
                  teams move from survivor disclosure to risk review and case preparation faster.
                </p>
              </div>
              <div className="rounded-[26px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] px-5 py-4 text-right">
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Coverage
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--accent-strong)]">12 / 12</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featureGroups.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                  className="rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.22)] p-5 shadow-[0_16px_36px_rgba(48,33,23,0.06)] backdrop-blur-[24px]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-strong)] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[var(--accent-strong)]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <div className="surface-panel rounded-[32px] px-5 py-7 sm:px-6">
            <SectionTag>Workflow</SectionTag>
            <h2 className="headline-balance mt-4 max-w-[18ch] text-[2.2rem] leading-[0.98] font-semibold tracking-[-0.045em] text-[var(--accent-strong)] sm:text-[3rem]">
              One connected path from first disclosure to hearing prep.
            </h2>

            <div className="mt-8 space-y-4">
              {workflow.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-[26px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-5"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(123,91,45,0.12)] text-sm font-semibold text-[var(--accent-strong)]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-[var(--muted)]">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel rounded-[32px] px-5 py-7">
            <SectionTag>Open The Product</SectionTag>
            <div className="mt-5 space-y-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-between rounded-[26px] bg-[linear-gradient(135deg,var(--accent-strong),#5d4733)] px-5 py-5 text-white shadow-[0_18px_36px_rgba(48,33,23,0.16)]"
              >
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.7)]">
                    Command center
                  </p>
                  <p className="mt-2 text-xl font-semibold">Open dashboard</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/statement"
                className="flex items-center justify-between rounded-[26px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] px-5 py-5 text-[var(--accent-strong)]"
              >
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Voice + document intake
                  </p>
                  <p className="mt-2 text-xl font-semibold">Go to statement analysis</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/brief"
                className="flex items-center justify-between rounded-[26px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] px-5 py-5 text-[var(--accent-strong)]"
              >
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Briefing output
                  </p>
                  <p className="mt-2 text-xl font-semibold">Open generated brief</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
