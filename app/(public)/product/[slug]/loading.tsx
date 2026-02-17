export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="aspect-square bg-neutral-200 rounded-2xl" />
        <div className="space-y-6">
          <div className="h-6 bg-neutral-200 rounded w-32" />
          <div className="h-10 bg-neutral-200 rounded w-3/4" />
          <div className="h-6 bg-neutral-200 rounded w-24" />
          <div className="h-32 bg-neutral-200 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
