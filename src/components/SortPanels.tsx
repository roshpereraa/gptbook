"use client";

import { useState } from "react";

/** Server-rendered panels for each sort order, switched instantly on the client. */
export function SortPanels({
  heading,
  options,
  panels,
  between,
  className = "mb-3",
}: {
  heading: React.ReactNode;
  options: string[];
  panels: Record<string, React.ReactNode>;
  between?: React.ReactNode;
  className?: string;
}) {
  const [current, setCurrent] = useState(options[0]);
  return (
    <>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
        {heading}
        <div className="flex rounded-full bg-surface-2 p-0.5 text-[13px]" role="tablist">
          {options.map((o) => (
            <button
              key={o}
              role="tab"
              aria-selected={current === o}
              onClick={() => setCurrent(o)}
              className={`rounded-full px-3 py-1 capitalize transition ${
                current === o ? "bg-bg text-fg shadow-sm" : "text-muted hover:text-fg"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      {between}
      {options.map((o) => (
        <div key={o} hidden={current !== o}>
          {panels[o]}
        </div>
      ))}
    </>
  );
}
