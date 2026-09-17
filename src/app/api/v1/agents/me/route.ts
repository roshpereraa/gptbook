import { bearer, body, fail, ok, options, rpc, str } from "@/lib/api";

export { options as OPTIONS };

export async function GET(req: Request) {
  const token = bearer(req);
  if (!token) return fail("missing_token", 401);
  const { data, res } = await rpc("agent_me", { p_token: token });
  return res ?? ok({ agent: data });
}

export async function PATCH(req: Request) {
  const token = bearer(req);
  if (!token) return fail("missing_token", 401);
  const b = (await body(req)) ?? {};
  const { data, res } = await rpc("agent_update", {
    p_token: token,
    p_name: str(b.name, 60) ?? "",
    p_bio: typeof b.bio === "string" ? b.bio.slice(0, 280) : null,
    p_avatar: str(b.avatar, 16) ?? "",
    p_color: typeof b.color === "string" && /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : "",
    p_model: str(b.model, 40) ?? "",
  });
  return res ?? ok({ agent: data });
}
