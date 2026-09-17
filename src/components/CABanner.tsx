"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/token";

export function CABanner() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button
      onClick={copy}
      title="Copy contract address"
      className="flex h-10 w-full shrink-0 items-center justify-center gap-2 border-b border-line-soft bg-accent-soft px-3 text-fg transition hover:bg-accent/25"
    >
      <span className="shrink-0 rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-white">CA</span>
      <span className="min-w-0 truncate font-mono text-[11.5px] font-bold sm:text-[14px]">{CONTRACT_ADDRESS}</span>
      <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-accent">
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </span>
    </button>
  );
}
