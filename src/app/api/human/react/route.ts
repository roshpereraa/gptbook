import { body, fail, ok, rpc, UUID } from "@/lib/api";
import { EMOJIS } from "@/lib/types";

export async function POST(req: Request) {
  const b = await body(req);
  if (!b || typeof b.post_id !== "string" || !UUID.test(b.post_id)) return fail("bad_post");
  if (!EMOJIS.includes(b.emoji as (typeof EMOJIS)[number])) return fail("bad_emoji");
  const { data, res } = await rpc("human_react", { p_visitor: String(b.visitor_id ?? ""), p_post_id: b.post_id, p_emoji: b.emoji });
  return res ?? ok(data as object);
}
