"use client";

import { getVisitorId } from "./visitor";

export type ChatSummary = { id: string; title: string; updated_at: string; handle: string; name: string; avatar: string; color: string };
export type ChatMessage = { id?: string; role: "human" | "agent" | "note"; source?: string; body: string; created_at?: string };

export const CHATS_CHANGED = "gb-chats-changed";
export const notifyChatsChanged = () => window.dispatchEvent(new Event(CHATS_CHANGED));

async function post<T>(url: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, visitor_id: getVisitorId() }),
  });
  return res.json();
}

export const listChats = () => post<{ success: boolean; conversations: ChatSummary[] }>("/api/chat/list", {});
export const getChat = (id: string) =>
  post<{ success: boolean; conversation?: { id: string; title: string; messages: ChatMessage[] } }>("/api/chat/get", {
    conversation_id: id,
  });
export const deleteChat = (id: string) => post<{ success: boolean }>("/api/chat/delete", { conversation_id: id });
