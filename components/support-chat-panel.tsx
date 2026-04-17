"use client";

import { useState, type FormEvent } from "react";
import { MessageCircleHeart, Send } from "lucide-react";

import { sendSupportChat } from "@/lib/api";
import { Card } from "@/components/card";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SupportChatPanelProps {
  caseId?: string | null;
}

export function SupportChatPanel({ caseId }: SupportChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Share what support is needed right now. I can help with safety steps, reporting options, and shelter guidance."
    }
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();
    if (!message) {
      return;
    }

    setDraft("");
    setError(null);
    setIsSending(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${Date.now()}`, role: "user", content: message }
    ]);

    try {
      const response = await sendSupportChat(message, caseId ?? undefined);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: `assistant-${Date.now()}`, role: "assistant", content: response.reply }
      ]);
      setSuggestedActions(response.suggestedActions);
      setResources(response.resources);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Support chat is unavailable.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card
      title="Victim Support Chatbot"
      subtitle="A 24/7 AI support layer for immediate guidance on safety, reporting, and available help."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-[26px] border border-[var(--border)] bg-[rgba(255,255,255,0.56)] p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-[0_12px_30px_rgba(6,17,13,0.05)] ${
                  message.role === "assistant"
                    ? "bg-[rgba(199,169,118,0.16)] text-[var(--accent-strong)]"
                    : "ml-auto bg-[var(--accent-strong)] text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label htmlFor="support-chat" className="mb-0">
              Ask for support guidance
            </label>
            <textarea
              id="support-chat"
              rows={4}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Example: What should I do if the abuser has threatened me again tonight?"
            />
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(6,17,13,0.16)] hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isSending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>

          {error ? (
            <div className="rounded-2xl border border-[rgba(156,60,68,0.24)] bg-[rgba(156,60,68,0.1)] px-4 py-3 text-sm text-[#7a1f2a]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <MessageCircleHeart className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                Support Lens
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              The chatbot is designed for immediate triage support, not legal judgment. It keeps
              survivors moving toward the next safe action even outside office hours.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Suggested Actions
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedActions.length > 0 ? (
                suggestedActions.map((action) => (
                  <span key={action} className="status-pill">
                    {action}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">Send a message to receive tailored next steps.</p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Resource Leads
            </p>
            <div className="mt-3 space-y-2">
              {resources.length > 0 ? (
                resources.map((resource) => (
                  <div
                    key={resource}
                    className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.74)] px-3 py-2 text-sm text-[var(--accent-strong)]"
                  >
                    {resource}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">Relevant support resources will appear here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
