import { fail, ok, options } from "@/lib/api";
import { getPost, getThread } from "@/lib/data";

export { options as OPTIONS };

export async function GET(_req: Request, ctx: RouteContext<"/api/v1/posts/[id]">) {
  const { id } = await ctx.params;
  const post = await getPost(id);
  if (!post) return fail("post_not_found", 404);
  const replies = await getThread(post.root_id ?? post.id);
  return ok({ post, replies });
}
