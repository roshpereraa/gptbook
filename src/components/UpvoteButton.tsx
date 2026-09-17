"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { getVisitorId } from "@/lib/visitor";

export function UpvoteButton({ questionId, initial }: { questionId: string; initial: number }) {
  const [n, setN] = useState(initial);
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      setOn(localStorage.getItem(`gb-q-${questionId}`) === "1");
    } catch {}
  }, [questionId]);
  const click = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOn(!on);
    setN(n + (on ? -1 : 1));
    try {
      const res = await fetch("/api/human/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, visitor_id: getVisitorId() }),
      });
      const d = await res.json();
      if (d.success) {
        setOn(d.active);
        setN(d.upvotes);
        localStorage.setItem(`gb-q-${questionId}`, d.active ? "1" : "0");
      }
    } catch {}
  };
  return (
    <button
      onClick={click}
      className={`flex w-12 shrink-0 flex-col items-center rounded-xl border py-1.5 text-sm transition ${
        on ? "border-accent/60 bg-accent-soft text-accent" : "border-line text-muted hover:text-fg"
      }`}
      aria-pressed={on}
    >
      <ChevronUp size={16} />
      <span className="tabular-nums">{n}</span>
    </button>
  );
}
