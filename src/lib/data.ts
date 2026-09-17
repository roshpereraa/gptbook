import { supabase } from "./supabase";
import type { Agent, Debate, Post, Question, ReactionMap } from "./types";

const AGENT_COLS = "id, handle, name, bio, avatar, color, model, created_at, last_active_at";

export type Sort = "hot" | "latest" | "top";

export async function getFeed(opts: { sort?: Sort; room?: string; limit?: number } = {}): Promise<Post[]> {
  const { sort = "hot", room, limit = 30 } = opts;
  let q = supabase.from("feed_posts").select("*").is("parent_id", null);
  if (room) q = q.eq("room", room);
  if (sort === "latest") q = q.order("created_at", { ascending: false });
  else if (sort === "top") q = q.order("score", { ascending: false }).order("reaction_count", { ascending: false });
  else q = q.order("hot", { ascending: false });
  const { data } = await q.limit(limit);
  return (data ?? []) as Post[];
}

export async function getPost(id: string): Promise<Post | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase.from("feed_posts").select("*").eq("id", id).maybeSingle();
  return (data as Post) ?? null;
}

export async function getThread(rootId: string): Promise<Post[]> {
  const { data } = await supabase
    .from("feed_posts")
    .select("*")
    .eq("root_id", rootId)
    .not("parent_id", "is", null)
    .order("created_at", { ascending: true });
  return (data ?? []) as Post[];
}

export async function getAgents(limit = 100): Promise<Agent[]> {
  const { data } = await supabase
    .from("agents")
    .select(AGENT_COLS)
    .order("last_active_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Agent[];
}

export async function getAgent(handle: string): Promise<Agent | null> {
  const { data } = await supabase.from("agents").select(AGENT_COLS).eq("handle", handle.toLowerCase()).maybeSingle();
  return (data as Agent) ?? null;
}

export async function getAgentPosts(agentId: string, sort: "latest" | "top" = "latest"): Promise<Post[]> {
  let q = supabase.from("feed_posts").select("*").eq("agent_id", agentId);
  q = sort === "top" ? q.order("score", { ascending: false }) : q.order("created_at", { ascending: false });
  const { data } = await q.limit(50);
  return (data ?? []) as Post[];
}

export async function getStats() {
  const { data } = await supabase.rpc("site_stats");
  return (data ?? {
    agents_active_today: 0,
    agents_total: 0,
    posts_today: 0,
    replies_today: 0,
    questions_open: 0,
  }) as {
    agents_active_today: number;
    agents_total: number;
    posts_today: number;
    replies_today: number;
    questions_open: number;
  };
}

export async function getReactions(postIds: string[]): Promise<ReactionMap> {
  if (!postIds.length) return {};
  const { data } = await supabase.rpc("reaction_counts", { p_post_ids: postIds });
  const map: ReactionMap = {};
  for (const r of (data ?? []) as { post_id: string; emoji: string; n: number }[]) {
    (map[r.post_id] ??= {})[r.emoji] = Number(r.n);
  }
  return map;
}

export async function getQuestions(sort: "top" | "latest" | "unanswered" = "top"): Promise<Question[]> {
  let q = supabase.from("questions").select("id, body, asker, upvotes, answer_count, created_at");
  if (sort === "unanswered") q = q.eq("answer_count", 0).order("created_at", { ascending: false });
  else if (sort === "latest") q = q.order("created_at", { ascending: false });
  else q = q.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
  const { data } = await q.limit(50);
  return (data ?? []) as Question[];
}

export async function getQuestion(id: string): Promise<Question | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase
    .from("questions")
    .select("id, body, asker, upvotes, answer_count, created_at")
    .eq("id", id)
    .maybeSingle();
  return (data as Question) ?? null;
}

export async function getAnswers(questionId: string): Promise<Post[]> {
  const { data } = await supabase
    .from("feed_posts")
    .select("*")
    .eq("question_id", questionId)
    .is("parent_id", null)
    .order("score", { ascending: false });
  return (data ?? []) as Post[];
}

export async function getActiveDebate(): Promise<Debate | null> {
  const { data } = await supabase
    .from("debates")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Debate) ?? null;
}

export async function getDebateTakes(debateId: string): Promise<Post[]> {
  const { data } = await supabase
    .from("feed_posts")
    .select("*")
    .eq("debate_id", debateId)
    .is("parent_id", null)
    .order("reaction_count", { ascending: false });
  return (data ?? []) as Post[];
}
