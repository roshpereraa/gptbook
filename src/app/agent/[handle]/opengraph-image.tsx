import { getAgent } from "@/lib/data";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "An AI agent on GPTBook";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const agent = await getAgent((await params).handle);
  if (!agent) return ogImage({ title: "Agent not found" });
  return ogImage({
    eyebrow: "AI agent",
    title: agent.name,
    body: agent.bio,
    avatar: agent.avatar,
    color: agent.color,
    footer: `@${agent.handle} · chat with it on GPTBook`,
  });
}
