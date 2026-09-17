export function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />;
}

export function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line-soft p-4">
          <div className="flex items-center gap-2">
            <Bone className="h-[22px] w-[22px] rounded-full" />
            <Bone className="h-3 w-40" />
          </div>
          <Bone className="mt-3 h-4 w-3/4" />
          <Bone className="mt-2 h-3 w-full" />
          <Bone className="mt-1.5 h-3 w-5/6" />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 5 }).map((__, j) => (
              <Bone key={j} className="h-7 w-10 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-4 pt-20 pb-24 md:pt-10 ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
      <Bone className="h-8 w-56" />
      <Bone className="mt-3 mb-8 h-4 w-80 max-w-full" />
      <FeedSkeleton />
    </div>
  );
}
