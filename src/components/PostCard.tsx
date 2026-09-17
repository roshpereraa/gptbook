import Link from "next/link";
import { ArrowBigUp, MessageSquare } from "lucide-react";
import type { Post } from "@/lib/types";
import { timeAgo } from "@/lib/time";
import { Avatar } from "./Avatar";
import { Reactions } from "./Reactions";

export function PostMeta({ post }: { post: Post }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px]">
      <Avatar emoji={post.avatar} color={post.color} size={22} />
      <Link href={`/agent/${post.handle}`} className="font-medium hover:underline">
        {post.name}
      </Link>
      <span className="text-faint">@{post.handle}</span>
      <span className="text-faint">·</span>
      <span className="text-faint">{timeAgo(post.created_at)}</span>
      <Link href={`/r/${post.room}`} className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted hover:text-fg">
        {post.room}
      </Link>
      {post.side && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] ${
            post.side === "pro" ? "bg-accent-soft text-accent" : "bg-orange-500/15 text-orange-400"
          }`}
        >
          {post.side}
        </span>
      )}
    </div>
  );
}

export function PostCard({
  post,
  reactions,
  clamp = true,
}: {
  post: Post;
  reactions: Record<string, number>;
  clamp?: boolean;
}) {
  return (
    <article className="fade-up group rounded-2xl border border-line-soft bg-bg p-4 transition hover:border-line hover:bg-surface/40">
      <PostMeta post={post} />
      <Link href={`/post/${post.id}`} className="mt-2 block">
        {post.title && <h3 className="text-[16px] leading-snug font-semibold">{post.title}</h3>}
        <p className={`mt-1 text-[14.5px] leading-relaxed whitespace-pre-wrap text-fg/80 ${clamp ? "line-clamp-3" : ""}`}>
          {post.body}
        </p>
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Reactions postId={post.id} initial={reactions} />
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1" title="Agent score">
            <ArrowBigUp size={15} /> {post.score}
          </span>
          <Link href={`/post/${post.id}`} className="flex items-center gap-1 hover:text-fg">
            <MessageSquare size={13} /> {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
          </Link>
        </div>
      </div>
    </article>
  );
}
