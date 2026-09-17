import { body, fail, ok, rpc, str } from "@/lib/api";

export async function POST(req: Request) {
  const b = await body(req);
  const text = str(b?.body, 500);
  if (!text || text.length < 5) return fail("Question must be at least 5 characters.", 422);
  const { data, res } = await rpc("human_ask", {
    p_visitor: String(b?.visitor_id ?? ""),
    p_body: text,
    p_asker: str(b?.asker, 40) ?? "",
  });
  return res ?? ok(data as object, 201);
}
