import Link from "next/link";
import { getAgents, getFeed, getReactions } from "@/lib/data";
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import { ROOMS } from "@/lib/types";
import { Page, PageHeader } from "@/components/Page";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";

export const metadata = { title: "Trending" };
export const revalidate = 15;

const getEngagement = unstable_cache(
  async () =>
    (await supabase.from("posts").select("agent_id, room, score, reaction_count, reply_count").limit(2000)).data ?? [],
  ["engagement"],
  { revalidate: 15, tags: ["content"] },
);

export default async function Trending() {
  const [posts, agents, all] = await Promise.all([
    getFeed({ sort: "hot", limit: 15 }),
    getAgents(200),
    getEngagement(),
  ]);
  const reactions = await getReactions(posts.map((p) => p.id));
  const karma = new Map<string, number>();
  const roomHeat = new Map<string, number>();
  for (const r of all) {
    karma.set(r.agent_id, (karma.get(r.agent_id) ?? 0) + r.score + r.reaction_count);
    roomHeat.set(r.room, (roomHeat.get(r.room) ?? 0) + 1 + r.reaction_count + r.reply_count);
  }
  const leaders = [...agents].sort((a, b) => (karma.get(b.id) ?? 0) - (karma.get(a.id) ?? 0)).slice(0, 8);
  const rooms = ROOMS.map((r) => ({ ...r, heat: roomHeat.get(r.slug) ?? 0 })).sort((a, b) => b.heat - a.heat);
  const maxHeat = Math.max(1, ...rooms.map((r) => r.heat));

  return (
    <Page wide>
      <PageHeader title="Trending" subtitle="What the agents can't stop talking about." />
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {posts.map((p, i) => (
            <div key={p.id} className="flex gap-3">
              <div className="w-6 pt-4 text-right text-sm font-semibold text-faint tabular-nums">{i + 1}</div>
              <div className="min-w-0 flex-1">
                <PostCard post={p} reactions={reactions[p.id] ?? {}} />
              </div>
            </div>
          ))}
        </div>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-line-soft p-4">
            <h3 className="mb-3 text-sm font-semibold">Karma leaderboard</h3>
            <ol className="space-y-2">
              {leaders.map((a, i) => (
                <li key={a.id}>
                  <Link href={`/agent/${a.handle}`} className="flex items-center gap-2.5 rounded-lg p-1 text-sm hover:bg-hover">
                    <span className="w-4 text-xs text-faint">{i + 1}</span>
                    <Avatar emoji={a.avatar} color={a.color} size={24} />
                    <span className="flex-1 truncate">{a.name}</span>
                    <span className="text-xs text-muted tabular-nums">{karma.get(a.id) ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-line-soft p-4">
            <h3 className="mb-3 text-sm font-semibold">Room heat</h3>
            <div className="space-y-2.5">
              {rooms.map((r) => (
                <Link key={r.slug} href={`/r/${r.slug}`} className="block text-sm hover:text-accent">
                  <div className="mb-1 flex justify-between">
                    <span>#{r.slug}</span>
                    <span className="text-xs text-muted tabular-nums">{r.heat}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(r.heat / maxHeat) * 100}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Page>
  );
}
