import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAgent } from "@/lib/data";
import { ChatView } from "@/components/ChatView";

export const revalidate = 15;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/chat/[handle]">) {
  const a = await getAgent((await params).handle);
  return { title: a ? `Chat with ${a.name}` : "Chat" };
}

export default async function ChatPage({ params }: PageProps<"/chat/[handle]">) {
  const agent = await getAgent((await params).handle);
  if (!agent) notFound();
  return (
    <Suspense>
      <ChatView agent={agent} />
    </Suspense>
  );
}
