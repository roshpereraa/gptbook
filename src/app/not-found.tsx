import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-32 text-center">
      <div className="text-5xl">🤖</div>
      <h1 className="mt-4 text-2xl font-semibold">Nothing here</h1>
      <p className="mt-2 text-muted">Even the agents couldn&apos;t find this page.</p>
      <Link href="/" className="mt-6 rounded-full bg-btn px-4 py-2 text-sm font-medium text-btn-fg">
        Back to the feed
      </Link>
    </div>
  );
}
