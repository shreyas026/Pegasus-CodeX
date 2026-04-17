"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SpeechRecognitionResultLike = {
  readonly isFinal: boolean;
  readonly 0: {
    readonly transcript: string;
  };
};

type SpeechRecognitionEventLike = Event & {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceInputPanelProps {
  onTranscriptReady: (transcript: string) => void;
}

const LANGUAGE_OPTIONS = [
  { value: "en-IN", label: "English (India)" },
  { value: "en-US", label: "English (US)" },
  { value: "hi-IN", label: "Hindi (India)" }
];

export function VoiceInputPanel({ onTranscriptReady }: VoiceInputPanelProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const [language, setLanguage] = useState("en-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [latestSavedTranscript, setLatestSavedTranscript] = useState("");

  const isSupported = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  function ensureRecognition() {
    if (!isSupported || typeof window === "undefined") {
      return null;
    }

    if (!recognitionRef.current) {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        return null;
      }

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const transcript = result[0]?.transcript?.trim() ?? "";

          if (!transcript) {
            continue;
          }

          if (result.isFinal) {
            finalTranscriptRef.current = [finalTranscriptRef.current, transcript]
              .filter(Boolean)
              .join(" ")
              .trim();
          } else {
            interimTranscript = [interimTranscript, transcript].filter(Boolean).join(" ").trim();
          }
        }

        setLiveTranscript([finalTranscriptRef.current, interimTranscript].filter(Boolean).join(" ").trim());
      };
      recognition.onerror = (event) => {
        setIsRecording(false);
        setError(
          event.error === "not-allowed"
            ? "Microphone permission was denied. Allow microphone access and try again."
            : "Voice transcription stopped unexpectedly. Please try again."
        );
      };
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.lang = language;
    return recognitionRef.current;
  }

  function handleStartRecording() {
    setError(null);
    finalTranscriptRef.current = "";
    setLiveTranscript("");
    setLatestSavedTranscript("");

    const recognition = ensureRecognition();
    if (!recognition) {
      setError("Voice transcription is not supported in this browser. Use a Chromium browser for the live mic flow.");
      return;
    }

    try {
      recognition.start();
      setIsRecording(true);
    } catch {
      setError("Voice transcription could not start. If another recording is active, stop it and try again.");
    }
  }

  function handleStopRecording() {
    recognitionRef.current?.stop();
  }

  function handleUseTranscript() {
    const transcript = liveTranscript.trim();
    if (!transcript) {
      setError("No transcript is available yet. Speak for a few seconds and try again.");
      return;
    }

    onTranscriptReady(transcript);
    setLatestSavedTranscript(transcript);
    setLiveTranscript("");
    finalTranscriptRef.current = "";
    setError(null);
  }

  return (
    <section className="space-y-4 rounded-[26px] border border-[var(--border)] bg-[rgba(255,255,255,0.66)] p-5 shadow-[0_12px_30px_rgba(6,17,13,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
            Voice Intake
          </p>
          <h3 className="text-[1.3rem] font-semibold text-[var(--accent-strong)]">
            Capture the narrative by voice when typing is too slow
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Use the browser microphone to dictate the survivor narrative, then append the transcript
            into the statement field before analysis. This works best in Chromium-based browsers.
          </p>
        </div>

        <div className="w-full max-w-[220px]">
          <label htmlFor="voice-language">Recognition language</label>
          <select
            id="voice-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            disabled={isRecording}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleStartRecording}
          disabled={isRecording}
          className="rounded-full bg-[var(--accent-strong)] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_30px_rgba(6,17,13,0.18)] hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {isRecording ? "Listening..." : "Start Voice Input"}
        </button>
        <button
          type="button"
          onClick={handleStopRecording}
          disabled={!isRecording}
          className="rounded-full border border-[var(--border-strong)] bg-[rgba(255,255,255,0.55)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] hover:bg-[rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Stop Recording
        </button>
        <button
          type="button"
          onClick={handleUseTranscript}
          disabled={!liveTranscript.trim()}
          className="rounded-full border border-[var(--border-strong)] bg-[rgba(255,255,255,0.55)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] hover:bg-[rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Use Transcript
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Live Transcript
          </p>
          <p className="mt-3 min-h-[112px] text-sm leading-6 text-[var(--accent-strong)]">
            {liveTranscript || "Start recording to capture the spoken narrative here."}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Last Imported Voice Note
          </p>
          <p className="mt-3 min-h-[112px] text-sm leading-6 text-[var(--accent-strong)]">
            {latestSavedTranscript || "The accepted transcript will be appended to the statement field."}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}
