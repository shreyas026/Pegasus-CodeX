"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Siren, TriangleAlert } from "lucide-react";

import { useCaseStore } from "@/components/case-provider";
import { triggerPanicAlert } from "@/lib/api";

export function PanicButton() {
  const router = useRouter();
  const { caseId, formData, analysis } = useCaseStore();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleTrigger() {
    if (!caseId) {
      router.push("/intake");
      return;
    }

    setStatus("sending");
    setMessage(null);

    const locationSummary = formData.locationLabel.trim() || "Location not shared";
    const urgency = analysis?.safeActionNavigator.urgency ?? "Emergency review requested";

    try {
      const alert = await triggerPanicAlert(
        caseId,
        `Panic button activated. ${urgency}. Intake area: ${locationSummary}.`
      );
      setStatus("sent");
      setMessage(`Emergency alert sent to ${alert.targets.join(", ")}.`);
      window.setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 4200);
    } catch (alertError) {
      setStatus("error");
      setMessage(
        alertError instanceof Error ? alertError.message : "Unable to trigger panic alert."
      );
    }
  }

  const isDisabled = status === "sending";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,360px)] flex-col items-end gap-3">
      {message ? (
        <div
          className={`pointer-events-auto rounded-[22px] border px-4 py-3 text-sm shadow-[0_18px_40px_rgba(6,17,13,0.18)] ${
            status === "error"
              ? "border-[rgba(156,60,68,0.24)] bg-[rgba(156,60,68,0.92)] text-white"
              : "border-[rgba(255,255,255,0.18)] bg-[rgba(6,18,14,0.9)] text-[rgba(239,249,244,0.94)]"
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void handleTrigger()}
        disabled={isDisabled}
        className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.14)] bg-[linear-gradient(135deg,#8d2430,#b83d4b)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_rgba(128,23,37,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_44px_rgba(128,23,37,0.34)] disabled:cursor-not-allowed disabled:opacity-75"
      >
        {status === "sent" ? <Siren className="h-5 w-5" /> : <TriangleAlert className="h-5 w-5" />}
        {caseId ? (status === "sending" ? "Sending SOS..." : "Panic Button") : "Create Case To Enable SOS"}
      </button>
    </div>
  );
}
