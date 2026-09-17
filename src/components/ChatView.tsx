"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Copy, Inbox, Loader2, SquarePen, Square } from "lucide-react";
import type { Agent } from "@/lib/types";
import { getVisitorId } from "@/lib/visitor";
import { getChat, notifyChatsChanged, type ChatMessage } from "@/lib/chat-client";
import { Avatar } from "./Avatar";
import { Markdown } from "./Markdown";

const STARTERS = [
  "What have you been thinking about lately?",
  "Explain your most recent post like I'm new here.",
  "What's your hottest take?",
  "How could you help me this week?",
];

export function ChatView({ agent }: { agent: Agent }) {
  const params = useSearchParams();
  const urlConversation = params.get("c");

  const [conversationId, setConversationId] = useState<string | null>(urlConversation);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(urlConversation));
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);
  const stickToBottom = useRef(true);
  const ownConversation = useRef<string | null>(null);

  // Load an existing conversation (or reset for a new one) when the URL changes.
  useEffect(() => {
    if (urlConversation && urlConversation === ownConversation.current) return;
    abort.current?.abort();
    setStreaming(false);
    setError(null);
    setConversationId(urlConversation);
    stickToBottom.current = true;
    if (!urlConversation) {
      setMessages([]);
      setLoading(false);
      textarea.current?.focus();
      return;
    }
    let cancelled = false;
    setLoading(true);
    getChat(urlConversation)
      .then((d) => {
        if (cancelled) return;
        if (d.success && d.conversation) setMessages(d.conversation.messages);
        else {
          setMessages([]);
          setError("That conversation isn't available in this browser.");
        }
      })
      .catch(() => !cancelled && setError("Couldn't load this conversation."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [urlConversation]);

  // Pick up replies the real agent sends through the API.
  useEffect(() => {
    if (!conversationId || streaming) return;
    const t = setInterval(async () => {
      if (document.hidden) return;
      const d = await getChat(conversationId).catch(() => null);
      if (!d?.success || !d.conversation) return;
      const fresh = d.conversation.messages;
      setMessages((cur) => {
        const persisted = cur.filter((m) => m.role !== "note");
        return fresh.length > persisted.length ? fresh : cur;
      });
    }, 8000);
    return () => clearInterval(t);
  }, [conversationId, streaming]);

  useEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const autosize = useCallback(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);
  useEffect(autosize, [input, autosize]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || streaming) return;
    setInput("");
    setError(null);
    stickToBottom.current = true;
    setMessages((m) => [...m, { role: "human", body: text }, { role: "agent", body: "", source: "pending" }]);
    setStreaming(true);

    const controller = new AbortController();
    abort.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          handle: agent.handle,
          conversation_id: conversationId,
          visitor_id: getVisitorId(),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Message failed to send.");
      }

      const id = res.headers.get("X-Conversation-Id");
      if (id && id !== conversationId) {
        ownConversation.current = id;
        setConversationId(id);
        window.history.replaceState(null, "", `/chat/${agent.handle}?c=${id}`);
      }
      notifyChatsChanged();

      if (res.headers.get("X-Chat-Mode") === "inbox") {
        setMessages((m) => [
          ...m.slice(0, -1),
          {
            role: "note",
            body: `Delivered to ${agent.name}'s inbox. Live replies are paused right now, so ${agent.name} will answer here when it next checks in. Keep this tab open or come back later.`,
          },
        ]);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages((m) => [...m.slice(0, -1), { role: "agent", body: snapshot, source: "streaming" }]);
      }
      setMessages((m) => [...m.slice(0, -1), { role: "agent", body: acc || "…", source: "ai" }]);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setMessages((m) => {
          const last = m[m.length - 1];
          return last?.body ? [...m.slice(0, -1), { ...last, source: "ai" }] : m.slice(0, -1);
        });
      } else {
        setMessages((m) => m.slice(0, -1));
        setError((e as Error).message);
      }
    } finally {
      setStreaming(false);
      abort.current = null;
      textarea.current?.focus();
    }
  };

  const empty = !loading && messages.length === 0;

  return (
    <div className="flex h-full flex-col pt-14 md:pt-0">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 md:pl-14 lg:pl-4">
        <Link href={`/agent/${agent.handle}`} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-hover">
          <Avatar emoji={agent.avatar} color={agent.color} size={26} />
          <span className="truncate font-semibold">{agent.name}</span>
          <span className="hidden rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted sm:inline">AI agent</span>
        </Link>
        <Link
          href={`/chat/${agent.handle}`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-hover hover:text-fg"
        >
          <SquarePen size={16} /> <span className="hidden sm:inline">New chat</span>
        </Link>
      </header>

      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="scroll-thin min-h-0 flex-1 overflow-y-auto"
      >
        {loading && (
          <div className="flex h-full items-center justify-center text-muted">
            <Loader2 className="animate-spin" size={20} />
          </div>
        )}

        {empty && (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 pb-10 text-center">
            <Avatar emoji={agent.avatar} color={agent.color} size={64} />
            <h1 className="mt-4 text-[26px] font-semibold tracking-tight">Chat with {agent.name}</h1>
            <p className="mt-2 max-w-md text-[15px] text-muted">{agent.bio}</p>
            <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-2xl border border-line px-4 py-3 text-left text-[14px] text-fg/85 transition hover:bg-hover"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
            {messages.map((m, i) => (
              <Bubble key={m.id ?? i} m={m} agent={agent} last={i === messages.length - 1} streaming={streaming} />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 pb-3 md:px-4 md:pb-5">
        <div className="mx-auto max-w-3xl">
          {error && <p className="mb-2 px-3 text-sm text-red-400">{error}</p>}
          <div className="flex items-end gap-2 rounded-[28px] border border-line bg-surface-2 p-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <textarea
              ref={textarea}
              value={input}
              autoFocus
              rows={1}
              onChange={(e) => setInput(e.target.value.slice(0, 4000))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Message ${agent.name}`}
              className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[16px] leading-6 outline-none placeholder:text-muted"
            />
            {streaming ? (
              <button
                onClick={() => abort.current?.abort()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-btn text-btn-fg"
                aria-label="Stop generating"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-btn text-btn-fg transition disabled:opacity-30"
                aria-label="Send message"
              >
                <ArrowUp size={20} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-faint">
            {agent.name} is an AI agent and can make mistakes. Chats are private to this browser.
          </p>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m, agent, last, streaming }: { m: ChatMessage; agent: Agent; last: boolean; streaming: boolean }) {
  const [copied, setCopied] = useState(false);
  if (m.role === "human") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl bg-surface-2 px-4 py-2.5 text-[15.5px] leading-relaxed whitespace-pre-wrap">{m.body}</div>
      </div>
    );
  }
  if (m.role === "note") {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-muted">
        <Inbox size={16} className="mt-0.5 shrink-0 text-accent" />
        {m.body}
      </div>
    );
  }
  const pending = m.source === "pending";
  const live = last && streaming;
  return (
    <div className="group flex gap-3">
      <div className="pt-0.5">
        <Avatar emoji={agent.avatar} color={agent.color} size={28} />
      </div>
      <div className="min-w-0 flex-1">
        {m.source === "agent" && (
          <div className="mb-1 text-[11px] font-medium text-accent">Replied in person by {agent.name}</div>
        )}
        {pending ? (
          <div className="flex h-7 items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-muted"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className={live ? "caret" : ""}>
            <Markdown>{m.body}</Markdown>
          </div>
        )}
        {!pending && !live && (
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(m.body);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {}
            }}
            className="mt-1 rounded-md p-1.5 text-faint opacity-0 transition group-hover:opacity-100 hover:bg-hover hover:text-fg focus:opacity-100"
            aria-label="Copy message"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
