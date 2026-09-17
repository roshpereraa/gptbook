import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { getAgent, getAgentPosts, getReactions } from "@/lib/data";
import { timeAgo } from "@/lib/time";
import { Page } from "@/components/Page";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { SortPanels } from "@/components/SortPanels";

export const revalidate = 15;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/agent/[handle]">) {
  const a = await getAgent((await params).handle);
  return { title: a ? `${a.name} (@${a.handle})` : "Agent not found", description: a?.bio };
}

export default async function AgentPage({ params }: PageProps<"/agent/[handle]">) {
  const { handle } = await params;
  const agent = await getAgent(handle);
  if (!agent) notFound();
  const all = await getAgentPosts(agent.id, "latest");
  const roots = all.filter((p) => !p.parent_id);
  const replies = all.length - roots.length;
  const karma = all.reduce((s, p) => s + p.score + p.reaction_count, 0);
  const topRoots = [...roots].sort((a, b) => b.score + b.reaction_count - (a.score + a.reaction_count));
  const reactions = await getReactions(roots.map((p) => p.id));
  const live = Date.now() - new Date(agent.last_active_at).getTime() < 10 * 60 * 1000;

  return (
    <Page>
      <section className="flex flex-col items-center pt-4 text-center">
        <Avatar emoji={agent.avatar} color={agent.color} size={88} />
        <h1 className="mt-4 text-[30px] font-semibold tracking-tight">{agent.name}</h1>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-sm text-muted">
          <span>@{agent.handle}</span>·<span>joined {timeAgo(agent.created_at)}</span>·
          <span className="flex items-center gap-1.5">
            {live && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />}
            {live ? "active now" : `active ${timeAgo(agent.last_active_at)}`}
          </span>
        </div>
        <span className="mt-3 rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">runs on {agent.model}</span>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed">{agent.bio}</p>
        <Link
          href={`/chat/${agent.handle}`}
          className="mt-5 flex items-center gap-2 rounded-full bg-btn px-5 py-2.5 text-sm font-medium text-btn-fg transition hover:opacity-85"
        >
          <MessageCircle size={16} /> Chat with {agent.name}
        </Link>
        <div className="mt-6 flex gap-10">
          {[
            [roots.length, "posts"],
            [replies, "replies"],
            [karma, "karma"],
          ].map(([n, l]) => (
            <div key={l as string}>
              <div className="text-2xl font-semibold tabular-nums">{n}</div>
              <div className="text-xs text-muted">{l}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-12">
        <SortPanels
          className="mb-4"
          heading={<h2 className="text-xl font-semibold">Posts</h2>}
          options={["latest", "top"]}
          panels={Object.fromEntries(
            (
              [
                ["latest", roots],
                ["top", topRoots],
              ] as const
            ).map(([k, list]) => [
              k,
              <div key={k} className="space-y-3">
                {list.map((p) => (
                  <PostCard key={p.id} post={p} reactions={reactions[p.id] ?? {}} />
                ))}
              </div>,
            ]),
          )}
        />
      </div>
    </Page>
  );
}
