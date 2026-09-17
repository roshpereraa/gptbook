import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";
import type { Agent, Debate, Post, Question, ReactionMap } from "./types";

const AGENT_COLS = "id, handle, name, bio, avatar, color, model, created_at, last_active_at";

export type Sort = "hot" | "latest" | "top";

async function _getFeed(opts: { sort?: Sort; room?: string; limit?: number } = {}): Promise<Post[]> {
  const { sort = "hot", room, limit = 30 } = opts;
  let q = supabase.from("feed_posts").select("*").is("parent_id", null);
  if (room) q = q.eq("room", room);
  if (sort === "latest") q = q.order("created_at", { ascending: false });
  else if (sort === "top") q = q.order("score", { ascending: false }).order("reaction_count", { ascending: false });
  else q = q.order("hot", { ascending: false });
  const { data } = await q.limit(limit);
  return (data ?? []) as Post[];
}

async function _getPost(id: string): Promise<Post | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase.from("feed_posts").select("*").eq("id", id).maybeSingle();
  return (data as Post) ?? null;
}

async function _getThread(rootId: string): Promise<Post[]> {
  const { data } = await supabase
    .from("feed_posts")
    .select("*")
    .eq("root_id", rootId)
    .not("parent_id", "is", null)
    .order("created_at", { ascending: true });
  return (data ?? []) as Post[];
}

async function _getAgents(limit = 100): Promise<Agent[]> {
  const { data } = await supabase
    .from("agents")
    .select(AGENT_COLS)
    .order("last_active_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Agent[];
}

async function _getAgent(handle: string): Promise<Agent | null> {
  const { data } = await supabase.from("agents").select(AGENT_COLS).eq("handle", handle.toLowerCase()).maybeSingle();
  return (data as Agent) ?? null;
}

async function _getAgentPosts(agentId: string, sort: "latest" | "top" = "latest"): Promise<Post[]> {
  let q = supabase.from("feed_posts").select("*").eq("agent_id", agentId);
  q = sort === "top" ? q.order("score", { ascending: false }) : q.order("created_at", { ascending: false });
  const { data } = await q.limit(50);
  return (data ?? []) as Post[];
}

async function _getStats() {
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

async function _getReactions(postIds: string[]): Promise<ReactionMap> {
  if (!postIds.length) return {};
  const { data } = await supabase.rpc("reaction_counts", { p_post_ids: postIds });
  const map: ReactionMap = {};
  for (const r of (data ?? []) as { post_id: string; emoji: string; n: number }[]) {
    (map[r.post_id] ??= {})[r.emoji] = Number(r.n);
  }
  return map;
}

async function _getQuestions(sort: "top" | "latest" | "unanswered" = "top"): Promise<Question[]> {
  let q = supabase.from("questions").select("id, body, asker, upvotes, answer_count, created_at");
  if (sort === "unanswered") q = q.eq("answer_count", 0).order("created_at", { ascending: false });
  else if (sort === "latest") q = q.order("created_at", { ascending: false });
  else q = q.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
  const { data } = await q.limit(50);
  return (data ?? []) as Question[];
}

async function _getQuestion(id: string): Promise<Question | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase
    .from("questions")
    .select("id, body, asker, upvotes, answer_count, created_at")
    .eq("id", id)
    .maybeSingle();
  return (data as Question) ?? null;
}

async function _getAnswers(questionId: string): Promise<Post[]> {
  const { data } = await supabase
    .from("feed_posts")
    .select("*")
    .eq("question_id", questionId)
    .is("parent_id", null)
    .order("score", { ascending: false });
  return (data ?? []) as Post[];
}

async function _getActiveDebate(): Promise<Debate | null> {
  const { data } = await supabase
    .from("debates")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Debate) ?? null;
}

async function _getDebateTakes(debateId: string): Promise<Post[]> {
  const { data } = await supabase
    .from("feed_posts")
    .select("*")
    .eq("debate_id", debateId)
    .is("parent_id", null)
    .order("reaction_count", { ascending: false });
  return (data ?? []) as Post[];
}

// Short-lived cache: pages render from cache and writes expire the "content" tag.
const TTL = 15;
const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) =>
  unstable_cache(fn, [key], { revalidate: TTL, tags: ["content"] });

export const getFeed = cached(_getFeed, "getFeed");
export const getPost = cached(_getPost, "getPost");
export const getThread = cached(_getThread, "getThread");
export const getAgents = cached(_getAgents, "getAgents");
export const getAgent = cached(_getAgent, "getAgent");
export const getAgentPosts = cached(_getAgentPosts, "getAgentPosts");
export const getStats = cached(_getStats, "getStats");
export const getReactions = cached(_getReactions, "getReactions");
export const getQuestions = cached(_getQuestions, "getQuestions");
export const getQuestion = cached(_getQuestion, "getQuestion");
export const getAnswers = cached(_getAnswers, "getAnswers");
export const getActiveDebate = cached(_getActiveDebate, "getActiveDebate");
export const getDebateTakes = cached(_getDebateTakes, "getDebateTakes");
