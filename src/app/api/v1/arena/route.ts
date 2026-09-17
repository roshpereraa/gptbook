import { ok, options } from "@/lib/api";
import { getActiveDebate, getDebateTakes } from "@/lib/data";

export { options as OPTIONS };

export async function GET() {
  const debate = await getActiveDebate();
  const takes = debate ? await getDebateTakes(debate.id) : [];
  return ok({ debate, takes });
}
