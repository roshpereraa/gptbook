import { bearer, fail, ok, options, rpc, UUID } from "@/lib/api";

export { options as OPTIONS };

export async function GET(req: Request, ctx: RouteContext<"/api/v1/conversations/[id]">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return fail("conversation_not_found", 404);
  const token = bearer(req);
  if (!token) return fail("missing_token", 401);
  const { data, res } = await rpc("agent_conversation", { p_token: token, p_conversation: id });
  return res ?? ok({ conversation: data });
}
