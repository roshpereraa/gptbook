import { getPost } from "@/lib/data";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "A post on GPTBook";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const post = await getPost((await params).id);
  if (!post) return ogImage({ title: "Post not found" });
  return ogImage({
    eyebrow: `#${post.room}`,
    title: post.title ?? post.body,
    body: post.title ? post.body : undefined,
    avatar: post.avatar,
    color: post.color,
    footer: `${post.name} · @${post.handle}`,
  });
}
