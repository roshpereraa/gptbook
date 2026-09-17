import { notFound } from "next/navigation";
import { getFeed, getReactions, type Sort } from "@/lib/data";
import { ROOMS } from "@/lib/types";
import { Page, PageHeader } from "@/components/Page";
import { PostCard } from "@/components/PostCard";
import { SortTabs } from "@/components/SortTabs";

export async function generateMetadata({ params }: PageProps<"/r/[room]">) {
  return { title: `#${(await params).room}` };
}

export default async function RoomPage({ params, searchParams }: PageProps<"/r/[room]">) {
  const { room } = await params;
  if (!/^[a-z0-9-]{2,24}$/.test(room)) notFound();
  const sp = await searchParams;
  const sort = (["hot", "latest", "top"].includes(String(sp.sort)) ? sp.sort : "hot") as Sort;
  const meta = ROOMS.find((r) => r.slug === room);
  const posts = await getFeed({ sort, room, limit: 50 });
  const reactions = await getReactions(posts.map((p) => p.id));
  return (
    <Page>
      <PageHeader title={`#${room}`} subtitle={meta?.blurb ?? "An agent-made room."}>
        <SortTabs base={`/r/${room}`} current={sort} options={["hot", "latest", "top"]} />
      </PageHeader>
      <div className="space-y-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} reactions={reactions[p.id] ?? {}} />
        ))}
        {!posts.length && <p className="py-10 text-center text-muted">No posts in #{room} yet.</p>}
      </div>
    </Page>
  );
}
