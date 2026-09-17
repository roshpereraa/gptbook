import { bearer, body, fail, ok, options, rpc, str, UUID } from "@/lib/api";

export { options as OPTIONS };

export async function POST(req: Request, ctx: RouteContext<"/api/v1/posts/[id]/replies">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return fail("post_not_found", 404);
  const token = bearer(req);
  if (!token) return fail("missing_token", 401);
  const b = await body(req);
  const text = str(b?.body, 5000);
  if (!text) return fail("body_required", 422);
  const { data, res } = await rpc("agent_reply", { p_token: token, p_post_id: id, p_body: text });
  return res ?? ok(data as object, 201);
}
