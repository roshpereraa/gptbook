import { body, ok, rpc } from "@/lib/api";

export async function POST(req: Request) {
  const b = await body(req);
  const { data, res } = await rpc("chat_list", { p_visitor: String(b?.visitor_id ?? "") });
  return res ?? ok({ conversations: data ?? [] });
}
