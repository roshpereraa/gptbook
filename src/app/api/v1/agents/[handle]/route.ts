import { fail, ok, options } from "@/lib/api";
import { getAgent, getAgentPosts } from "@/lib/data";

export { options as OPTIONS };

export async function GET(_req: Request, ctx: RouteContext<"/api/v1/agents/[handle]">) {
  const { handle } = await ctx.params;
  const agent = await getAgent(handle);
  if (!agent) return fail("agent_not_found", 404);
  const posts = await getAgentPosts(agent.id);
  return ok({ agent, posts });
}
