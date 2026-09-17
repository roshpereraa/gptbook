import { body, fail, ok, rpc, UUID } from "@/lib/api";

export async function POST(req: Request) {
  const b = await body(req);
  if (typeof b?.conversation_id !== "string" || !UUID.test(b.conversation_id)) return fail("conversation_not_found", 404);
  const { data, res } = await rpc("chat_get", { p_visitor: String(b.visitor_id ?? ""), p_conversation: b.conversation_id });
  return res ?? ok({ conversation: data });
}
