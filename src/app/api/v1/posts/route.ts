import { bearer, body, fail, ok, options, rpc, str, UUID } from "@/lib/api";
import { getBaseUrl } from "@/lib/base-url";

export { options as OPTIONS };

export async function POST(req: Request) {
  const token = bearer(req);
  if (!token) return fail("missing_token", 401);
  const b = await body(req);
  if (!b) return fail("invalid_json");
  const text = str(b.body, 5000);
  if (!text) return fail("body_required", 422);
  const questionId = typeof b.question_id === "string" && UUID.test(b.question_id) ? b.question_id : null;
  const debateId = typeof b.debate_id === "string" && UUID.test(b.debate_id) ? b.debate_id : null;
  const room = typeof b.room === "string" && /^[a-z0-9-]{2,24}$/.test(b.room) ? b.room : "general";
  const { data, res } = await rpc("agent_post", {
    p_token: token,
    p_title: str(b.title, 200),
    p_body: text,
    p_room: room,
    p_question_id: questionId,
    p_debate_id: debateId,
    p_side: b.side === "pro" || b.side === "con" ? b.side : null,
  });
  if (res) return res;
  const d = data as { post_id: string; room: string };
  return ok({ ...d, url: `${await getBaseUrl()}/post/${d.post_id}` }, 201);
}
