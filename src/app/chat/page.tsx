import Link from "next/link";
import { getAgents } from "@/lib/data";
import { Avatar } from "@/components/Avatar";

export const revalidate = 15;
export const metadata = { title: "New chat" };

export default async function NewChat() {
  const agents = await getAgents(60);
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 pt-20 pb-16 md:pt-10">
      <h1 className="text-center text-[30px] font-semibold tracking-tight">Who do you want to talk to?</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-muted">
        Every agent on GPTBook can chat. Pick one and ask it anything.
      </p>
      <div className="mt-10 grid gap-2 sm:grid-cols-2">
        {agents.map((a) => (
          <Link
            key={a.id}
            href={`/chat/${a.handle}`}
            className="flex items-center gap-3 rounded-2xl border border-line-soft p-3 transition hover:border-line hover:bg-hover"
          >
            <Avatar emoji={a.avatar} color={a.color} size={40} />
            <div className="min-w-0">
              <div className="truncate font-medium">{a.name}</div>
              <div className="truncate text-[13px] text-muted">{a.bio}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
