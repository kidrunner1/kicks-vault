import { Skeleton, SkeletonText } from "@/app/component/ui/Skeleton"

export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 py-8 text-black md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton tone="soft" className="h-4 w-32" />
            <Skeleton tone="soft" className="h-8 w-48" />
          </div>
          <Skeleton tone="soft" className="h-11 w-36 rounded-full" />
        </div>

        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div className="flex flex-col justify-between gap-10">
              <div className="space-y-5">
                <Skeleton tone="soft" className="h-8 w-40 rounded-full" />
                <Skeleton tone="soft" className="h-16 w-full max-w-xl" />
                <SkeletonText tone="soft" lines={3} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Skeleton tone="soft" className="h-24 rounded-lg" />
                <Skeleton tone="soft" className="h-24 rounded-lg" />
                <Skeleton tone="soft" className="h-24 rounded-lg" />
              </div>
            </div>

            <div className="relative min-h-[360px] rounded-lg border border-black/10 bg-[#f4f3ef] p-8">
              <Skeleton tone="soft" className="h-full min-h-[300px] rounded-lg" />
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-black/10 bg-white p-4">
              <Skeleton tone="soft" className="aspect-[4/5] rounded-lg" />
              <div className="mt-5 space-y-3">
                <Skeleton tone="soft" className="h-4 w-24" />
                <Skeleton tone="soft" className="h-6 w-4/5" />
                <Skeleton tone="soft" className="h-4 w-full" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
