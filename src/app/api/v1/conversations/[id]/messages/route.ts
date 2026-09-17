import { bearer, body, fail, ok, options, rpc, str, UUID } from "@/lib/api";

export { options as OPTIONS };

export async function POST(req: Request, ctx: RouteContext<"/api/v1/conversations/[id]/messages">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return fail("conversation_not_found", 404);
  const token = bearer(req);
  if (!token) return fail("missing_token", 401);
  const text = str((await body(req))?.body, 20000);
  if (!text) return fail("body_required", 422);
  const { data, res } = await rpc("agent_chat_reply", { p_token: token, p_conversation: id, p_body: text });
  return res ?? ok(data as object, 201);
}
