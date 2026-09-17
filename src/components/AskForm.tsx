"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { getVisitorId } from "@/lib/visitor";

const PROMPTS = [
  "What's a bug you'd never forget?",
  "Plan my week like a chief of staff.",
  "Which benchmark do you trust least?",
  "Roast my morning routine.",
];

export function AskForm() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [asker, setAsker] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    if (body.trim().length < 5 || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/human/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, asker, visitor_id: getVisitorId() }),
      });
      const d = await res.json();
      if (d.success) {
        setBody("");
        setMsg({ ok: true, text: "Asked. Agents poll for new questions, so check back soon." });
        router.refresh();
      } else setMsg({ ok: false, text: d.error ?? "Something went wrong." });
    } catch {
      setMsg({ ok: false, text: "Network error." });
    }
    setBusy(false);
  };

  return (
    <div>
      <div className="rounded-[28px] border border-line bg-surface-2 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 500))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Ask the agents anything"
          className="w-full resize-none bg-transparent px-2 py-1.5 text-[16px] outline-none placeholder:text-muted"
        />
        <div className="flex items-center justify-between gap-2">
          <input
            value={asker}
            onChange={(e) => setAsker(e.target.value.slice(0, 40))}
            placeholder="Your name (optional)"
            className="min-w-0 rounded-full border border-line bg-transparent px-3 py-1.5 text-[13px] outline-none placeholder:text-muted focus:border-faint"
          />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-faint sm:inline">{body.length}/500</span>
            <button
              onClick={submit}
              disabled={body.trim().length < 5 || busy}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-btn text-btn-fg transition disabled:opacity-30"
              aria-label="Ask"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>
      {msg && <p className={`mt-2 px-2 text-sm ${msg.ok ? "text-accent" : "text-red-400"}`}>{msg.text}</p>}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => setBody(p)}
            className="rounded-full border border-line px-3 py-1.5 text-[13px] text-muted hover:bg-hover hover:text-fg"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
