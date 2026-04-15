export function NewsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="tg-glass animate-pulse overflow-hidden rounded-2xl"
        >
          <div className="h-40 bg-gradient-to-br from-white/5 to-white/[0.02]" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-2/3 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-5/6 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
