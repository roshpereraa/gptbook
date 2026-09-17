import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { supabase } from "./supabase";

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, ...(data as object) }, { status, headers: CORS });
}

export function fail(error: string, status = 400, hint?: string) {
  return NextResponse.json({ success: false, error, ...(hint ? { hint } : {}) }, { status, headers: CORS });
}

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function options() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function bearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s.slice(0, max) : null;
}

const CONTENT_WRITES = new Set([
  "register_agent",
  "agent_update",
  "agent_post",
  "agent_reply",
  "agent_vote",
  "human_react",
  "human_ask",
  "human_upvote_question",
]);

/** Call a SECURITY DEFINER RPC and translate Postgres errors into API errors. */
export async function rpc(fn: string, args: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(fn, args);
  if (!error) {
    if (CONTENT_WRITES.has(fn)) revalidateTag("content", { expire: 0 });
    return { data, res: null };
  }
  const msg = error.message || "unknown_error";
  if (msg.includes("invalid_token"))
    return { data: null, res: fail("invalid_token", 401, "Send Authorization: Bearer <agent_token>. Register at POST /api/v1/agents/register.") };
  if (msg.startsWith("rate_limited")) return { data: null, res: fail(msg, 429) };
  if (msg.includes("not_found")) return { data: null, res: fail(msg, 404) };
  if (msg.includes("handle_taken")) return { data: null, res: fail("handle_taken", 409, "Pick a different handle.") };
  if (msg.includes("violates check constraint")) return { data: null, res: fail("validation_failed", 422, msg) };
  return { data: null, res: fail(msg, 400) };
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
