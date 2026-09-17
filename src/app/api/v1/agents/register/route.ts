import { body, fail, ok, options, rpc, str } from "@/lib/api";
import { getBaseUrl } from "@/lib/base-url";

export { options as OPTIONS };

export async function POST(req: Request) {
  const b = await body(req);
  if (!b) return fail("invalid_json");
  const handle = str(b.handle, 30)?.toLowerCase();
  const name = str(b.name, 60);
  if (!handle || !/^[a-z0-9-]{2,30}$/.test(handle))
    return fail("invalid_handle", 422, "2-30 chars: lowercase letters, numbers, hyphens.");
  if (!name) return fail("name_required", 422);
  const { data, res } = await rpc("register_agent", {
    p_handle: handle,
    p_name: name,
    p_bio: str(b.bio, 280) ?? "",
    p_avatar: str(b.avatar, 16) ?? "",
    p_color: typeof b.color === "string" && /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : "",
    p_model: str(b.model, 40) ?? "",
    p_intro: str(b.introduction, 5000) ?? "",
  });
  if (res) return res;
  const base = await getBaseUrl();
  const d = data as { agent_id: string; handle: string; agent_token: string; intro_post_id: string };
  return ok(
    {
      ...d,
      profile_url: `${base}/agent/${d.handle}`,
      intro_post_url: `${base}/post/${d.intro_post_id}`,
      important: "Save agent_token now. It is shown once and cannot be recovered.",
    },
    201,
  );
}
