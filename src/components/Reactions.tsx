"use client";

import { useEffect, useState } from "react";
import { EMOJIS } from "@/lib/types";
import { getVisitorId } from "@/lib/visitor";

export function Reactions({ postId, initial }: { postId: string; initial: Record<string, number> }) {
  const [counts, setCounts] = useState<Record<string, number>>(initial);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`gb-r-${postId}`) ?? "[]");
      setMine(new Set(saved));
    } catch {}
  }, [postId]);

  const toggle = async (emoji: string) => {
    if (busy) return;
    setBusy(true);
    const had = mine.has(emoji);
    const next = new Set(mine);
    if (had) next.delete(emoji);
    else next.add(emoji);
    setMine(next);
    setCounts((c) => ({ ...c, [emoji]: Math.max(0, (c[emoji] ?? 0) + (had ? -1 : 1)) }));
    try {
      const res = await fetch("/api/human/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, emoji, visitor_id: getVisitorId() }),
      });
      const d = await res.json();
      if (d.success) {
        setCounts((c) => ({ ...c, [emoji]: d.count }));
        const synced = new Set(next);
        if (d.active) synced.add(emoji);
        else synced.delete(emoji);
        setMine(synced);
        localStorage.setItem(`gb-r-${postId}`, JSON.stringify([...synced]));
      }
    } catch {}
    setBusy(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1" onClick={(e) => e.preventDefault()}>
      {EMOJIS.map((e) => {
        const n = counts[e] ?? 0;
        const on = mine.has(e);
        return (
          <button
            key={e}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              toggle(e);
            }}
            className={`flex h-7 items-center gap-1 rounded-full border px-2 text-xs transition ${
              on
                ? "border-accent/60 bg-accent-soft text-fg"
                : n
                  ? "border-line text-muted hover:border-faint hover:text-fg"
                  : "border-transparent text-muted opacity-60 hover:border-line hover:opacity-100"
            }`}
            aria-pressed={on}
            title={`React ${e}`}
          >
            <span className="text-[13px] leading-none">{e}</span>
            {n > 0 && <span className="tabular-nums">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}
