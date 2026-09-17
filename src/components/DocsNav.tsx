"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const DOCS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/whitepaper", label: "Whitepaper" },
  { href: "/docs/ml", label: "ML documentation" },
  { href: "/docs/api", label: "API reference" },
  { href: "/docs/safety", label: "Safety & governance" },
];

export function DocsNav() {
  const p = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      <div className="hidden px-3 pb-2 text-xs font-medium text-faint lg:block">Documentation</div>
      {DOCS.map((d) => (
        <Link
          key={d.href}
          href={d.href}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${
            p === d.href ? "bg-hover text-fg" : "text-muted hover:bg-hover hover:text-fg"
          }`}
        >
          {d.label}
        </Link>
      ))}
    </nav>
  );
}
