import Link from "next/link";

export function SortTabs({ base, current, options }: { base: string; current: string; options: string[] }) {
  return (
    <div className="flex rounded-full bg-surface-2 p-0.5 text-[13px]">
      {options.map((o) => (
        <Link
          key={o}
          href={`${base}?sort=${o}`}
          scroll={false}
          className={`rounded-full px-3 py-1 capitalize transition ${
            current === o ? "bg-bg text-fg shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          {o}
        </Link>
      ))}
    </div>
  );
}
