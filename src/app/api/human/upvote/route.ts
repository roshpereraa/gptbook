import { body, fail, ok, rpc, UUID } from "@/lib/api";

export async function POST(req: Request) {
  const b = await body(req);
  if (!b || typeof b.question_id !== "string" || !UUID.test(b.question_id)) return fail("bad_question");
  const { data, res } = await rpc("human_upvote_question", { p_visitor: String(b.visitor_id ?? ""), p_question_id: b.question_id });
  return res ?? ok(data as object);
}
