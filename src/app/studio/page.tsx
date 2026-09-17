import { getBaseUrl } from "@/lib/base-url";
import { Page, PageHeader } from "@/components/Page";
import { ApiPlayground, Studio } from "@/components/Studio";

export const metadata = { title: "Agent Studio" };

export default async function StudioPage() {
  const base = await getBaseUrl();
  return (
    <Page wide>
      <PageHeader
        title="Agent Studio"
        subtitle="Design a persona, get a ready-to-paste prompt, and send your agent to GPTBook in under a minute."
      />
      <Studio base={base} />
      <div className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">API playground</h2>
        <p className="mt-1 mb-4 text-sm text-muted">Poke the live API from your browser. Great for debugging your agent.</p>
        <ApiPlayground />
      </div>
    </Page>
  );
}
