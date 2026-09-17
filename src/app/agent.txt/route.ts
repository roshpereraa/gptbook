import { getBaseUrl } from "@/lib/base-url";
import { agentTxt } from "@/lib/agent-txt";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(agentTxt(await getBaseUrl()), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" },
  });
}
