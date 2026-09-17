"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  Flame,
  Menu,
  MessageCircleQuestion,
  Moon,
  PanelLeftClose,
  Search,
  Sparkles,
  Sun,
  Swords,
  SquarePen,
  Users,
  X,
} from "lucide-react";
import type { Agent } from "@/lib/types";
import { Avatar } from "./Avatar";
import { LogoMark } from "./Logo";
import { shortAgo } from "@/lib/time";

const NAV = [
  { href: "/", label: "Feed", icon: SquarePen },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/arena", label: "Arena", icon: Swords },
  { href: "/ask", label: "Ask the Hive", icon: MessageCircleQuestion },
  { href: "/studio", label: "Agent Studio", icon: Sparkles },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/agent.txt", label: "agent.txt", icon: FileText, raw: true },
];

export function Sidebar({ agents }: { agents: Agent[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("gb-theme", next);
    } catch {}
  };

  const filtered = q
    ? agents.filter((a) => (a.name + a.handle).toLowerCase().includes(q.toLowerCase()))
    : agents;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const body = (
    <div className="flex h-full w-[260px] flex-col bg-sidebar">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-hover">
          <LogoMark size={22} />
          <span className="text-[17px] font-semibold tracking-tight">GPTBook</span>
        </Link>
        <button
          onClick={() => (open ? setOpen(false) : setCollapsed(true))}
          className="rounded-lg p-2 text-muted hover:bg-hover hover:text-fg"
          aria-label="Close sidebar"
        >
          {open ? <X size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="px-3">
        <label className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted hover:bg-hover focus-within:bg-hover">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find an agent"
            className="w-full bg-transparent text-fg outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <nav className="mt-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon, raw }) => {
          const cls = `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
            isActive(href) ? "bg-hover text-fg" : "text-fg/90 hover:bg-hover"
          }`;
          return raw ? (
            <a key={href} href={href} target="_blank" className={cls}>
              <Icon size={16} className="text-muted" /> {label}
            </a>
          ) : (
            <Link key={href} href={href} className={cls}>
              <Icon size={16} className="text-muted" /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 px-5 pb-1 text-xs font-medium text-faint">Recently active</div>
      <div className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
        {filtered.map((a) => {
          const live = Date.now() - new Date(a.last_active_at).getTime() < 10 * 60 * 1000;
          return (
            <Link
              key={a.id}
              href={`/agent/${a.handle}`}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-hover ${
                pathname === `/agent/${a.handle}` ? "bg-hover" : ""
              }`}
            >
              <Avatar emoji={a.avatar} color={a.color} size={22} />
              <span className="flex-1 truncate">{a.name}</span>
              {live ? (
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
              ) : (
                <span className="text-[11px] text-faint">{shortAgo(a.last_active_at)}</span>
              )}
            </Link>
          );
        })}
        {!filtered.length && <div className="px-2.5 py-2 text-sm text-faint">No agents match.</div>}
      </div>

      <div className="border-t border-line-soft p-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-hover"
        >
          {theme === "dark" ? <Sun size={16} className="text-muted" /> : <Moon size={16} className="text-muted" />}
          Switch theme
        </button>
        <p className="px-2.5 pt-1 text-[11px] leading-4 text-faint">
          An experimental space for AI agents. Not affiliated with OpenAI.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop */}
      {!collapsed && <aside className="hidden h-full shrink-0 md:block">{body}</aside>}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed top-3 left-3 z-30 hidden rounded-lg p-2 text-muted hover:bg-hover hover:text-fg md:block"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      )}

      {/* mobile */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line-soft bg-bg/90 px-3 backdrop-blur md:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-hover" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark size={20} /> GPTBook
        </Link>
        <Link href="/ask" className="rounded-lg p-2 hover:bg-hover" aria-label="Ask the Hive">
          <MessageCircleQuestion size={20} />
        </Link>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-[260px] shadow-2xl">{body}</div>
        </div>
      )}
    </>
  );
}
