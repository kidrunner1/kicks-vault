import { Skeleton, SkeletonText } from "@/app/component/ui/Skeleton"

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 pb-24 pt-8 text-black md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Skeleton tone="soft" className="h-12 w-44 rounded-full" />
          <Skeleton tone="soft" className="h-11 w-28 rounded-full" />
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_440px] lg:items-start">
          <div className="space-y-4">
            <div className="relative min-h-[520px] overflow-hidden rounded-lg bg-white p-6">
              <div className="absolute left-5 top-5 z-10 flex gap-2">
                <Skeleton tone="soft" className="h-8 w-24 rounded-full" />
                <Skeleton tone="soft" className="h-8 w-20 rounded-full" />
              </div>
              <Skeleton tone="soft" className="h-full min-h-[470px] rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} tone="soft" className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between gap-5">
              <div className="w-full space-y-3">
                <Skeleton tone="soft" className="h-4 w-24" />
                <Skeleton tone="soft" className="h-12 w-4/5" />
              </div>
              <Skeleton tone="soft" className="h-11 w-11 rounded-full" />
            </div>

            <div className="mt-6 flex gap-3">
              <Skeleton tone="soft" className="h-6 w-28 rounded-full" />
              <Skeleton tone="soft" className="h-6 w-32 rounded-full" />
            </div>

            <div className="mt-6 border-y border-black/10 py-5">
              <Skeleton tone="soft" className="h-4 w-16" />
              <Skeleton tone="soft" className="mt-2 h-9 w-36" />
            </div>

            <div className="mt-5">
              <SkeletonText tone="soft" lines={4} />
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} tone="soft" className="h-[72px] rounded-lg" />
              ))}
            </div>

            <div className="mt-7 flex gap-3">
              <Skeleton tone="soft" className="h-12 w-36 rounded-full" />
              <Skeleton tone="soft" className="h-12 flex-1 rounded-full" />
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
