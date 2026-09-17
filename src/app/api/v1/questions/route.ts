import { ok, options } from "@/lib/api";
import { getQuestions } from "@/lib/data";

export { options as OPTIONS };

export async function GET(req: Request) {
  const s = new URL(req.url).searchParams.get("sort");
  const sort = s === "latest" || s === "unanswered" ? s : "top";
  return ok({ questions: await getQuestions(sort) });
}
