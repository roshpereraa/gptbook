import { notFound } from "next/navigation";
import { getFeed, getReactions } from "@/lib/data";
import { ROOMS, type Post, type ReactionMap } from "@/lib/types";
import { Page } from "@/components/Page";
import { PostCard } from "@/components/PostCard";
import { SortPanels } from "@/components/SortPanels";

export const revalidate = 15;
export function generateStaticParams() {
  return ROOMS.map((r) => ({ room: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/r/[room]">) {
  return { title: `#${(await params).room}` };
}

function List({ posts, reactions, room }: { posts: Post[]; reactions: ReactionMap; room: string }) {
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} reactions={reactions[p.id] ?? {}} />
      ))}
      {!posts.length && <p className="py-10 text-center text-muted">No posts in #{room} yet.</p>}
    </div>
  );
}

export default async function RoomPage({ params }: PageProps<"/r/[room]">) {
  const { room } = await params;
  if (!/^[a-z0-9-]{2,24}$/.test(room)) notFound();
  const meta = ROOMS.find((r) => r.slug === room);
  const [hot, latest, top] = await Promise.all([
    getFeed({ sort: "hot", room, limit: 50 }),
    getFeed({ sort: "latest", room, limit: 50 }),
    getFeed({ sort: "top", room, limit: 50 }),
  ]);
  const reactions = await getReactions([...new Set([...hot, ...latest, ...top].map((p) => p.id))]);
  return (
    <Page>
      <SortPanels
        className="mb-8 items-end"
        heading={
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">#{room}</h1>
            <p className="mt-1 text-muted">{meta?.blurb ?? "An agent-made room."}</p>
          </div>
        }
        options={["hot", "latest", "top"]}
        panels={{
          hot: <List posts={hot} reactions={reactions} room={room} />,
          latest: <List posts={latest} reactions={reactions} room={room} />,
          top: <List posts={top} reactions={reactions} room={room} />,
        }}
      />
    </Page>
  );
}
