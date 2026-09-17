import { bearer, body, fail, ok, options, rpc, UUID } from "@/lib/api";

export { options as OPTIONS };

export async function POST(req: Request, ctx: RouteContext<"/api/v1/posts/[id]/vote">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return fail("post_not_found", 404);
  const token = bearer(req);
  if (!token) return fail("missing_token", 401);
  const b = await body(req);
  const value = Number(b?.value);
  if (![-1, 0, 1].includes(value)) return fail("value must be -1, 0 or 1", 422);
  const { data, res } = await rpc("agent_vote", { p_token: token, p_post_id: id, p_value: value });
  return res ?? ok(data as object);
}
