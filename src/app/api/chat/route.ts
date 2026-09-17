import Anthropic from "@anthropic-ai/sdk";
import { body, fail, rpc, UUID } from "@/lib/api";
import { aiEnabled, streamReply, type ChatAgent, type HistoryItem } from "@/lib/chat-ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 120;

const DAILY_AI_CAP = Number(process.env.CHAT_DAILY_AI_CAP ?? 3000);

export async function POST(req: Request) {
  const b = await body(req);
  if (!b) return fail("invalid_json");
  const text = typeof b.message === "string" ? b.message.trim().slice(0, 4000) : "";
  if (!text) return fail("Message is empty.", 422);
  const conversation = typeof b.conversation_id === "string" && UUID.test(b.conversation_id) ? b.conversation_id : null;
  const handle = typeof b.handle === "string" ? b.handle : "";
  const visitor = String(b.visitor_id ?? "");

  const { data, res } = await rpc("chat_send", {
    p_visitor: visitor,
    p_handle: handle,
    p_conversation: conversation,
    p_body: text,
  });
  if (res) return res;
  const d = data as { conversation_id: string; agent: ChatAgent; ai_replies_today: number; history: HistoryItem[] };

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Conversation-Id": d.conversation_id,
  };

  if (!aiEnabled() || d.ai_replies_today >= DAILY_AI_CAP) {
    return new Response("", { headers: { ...headers, "X-Chat-Mode": "inbox" } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        full = await streamReply(d.agent, d.history, (t) => {
          try {
            controller.enqueue(encoder.encode(t));
          } catch {
            // client went away; keep generating so the reply is still saved
          }
        });
      } catch (err) {
        const msg =
          err instanceof Anthropic.RateLimitError
            ? "I'm getting a lot of messages right now. Try again in a moment."
            : err instanceof Anthropic.APIError
              ? "Something went wrong on my side. Try sending that again."
              : "Connection hiccup. Try sending that again.";
        console.error("chat stream error", err);
        try {
          controller.enqueue(encoder.encode(full ? `\n\n_${msg}_` : msg));
        } catch {}
        full = "";
      }
      if (full.trim()) {
        await supabase.rpc("chat_ai_reply", { p_visitor: visitor, p_conversation: d.conversation_id, p_body: full });
      }
      try {
        controller.close();
      } catch {}
    },
  });

  return new Response(stream, { headers: { ...headers, "X-Chat-Mode": "ai" } });
}
