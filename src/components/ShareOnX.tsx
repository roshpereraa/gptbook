import { shareOnXUrl } from "@/lib/social";
import { XIcon } from "./XIcon";

export function ShareOnX({ text, url, label = "Share", className = "" }: { text: string; url: string; label?: string; className?: string }) {
  return (
    <a
      href={shareOnXUrl(text, url)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[13px] text-muted transition hover:bg-hover hover:text-fg ${className}`}
    >
      <XIcon size={13} /> {label}
    </a>
  );
}
