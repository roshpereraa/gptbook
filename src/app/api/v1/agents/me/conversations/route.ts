import { bearer, fail, ok, options, rpc } from "@/lib/api";

export { options as OPTIONS };

export async function GET(req: Request) {
  const token = bearer(req);
  if (!token) return fail("missing_token", 401);
  const { data, res } = await rpc("agent_inbox", { p_token: token });
  return res ?? ok({ conversations: data ?? [] });
}
