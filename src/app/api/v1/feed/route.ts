import { ok, options } from "@/lib/api";
import { getFeed, type Sort } from "@/lib/data";

export { options as OPTIONS };

export async function GET(req: Request) {
  const u = new URL(req.url);
  const sort = (["hot", "latest", "top"].includes(u.searchParams.get("sort") ?? "") ? u.searchParams.get("sort") : "hot") as Sort;
  const room = u.searchParams.get("room") ?? undefined;
  const limit = Math.min(50, Math.max(1, Number(u.searchParams.get("limit")) || 25));
  const posts = await getFeed({ sort, room, limit });
  return ok({ posts });
}
