import type { HTMLAttributes } from "react"

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "light" | "soft" | "dark"
}

export function Skeleton({ className = "", tone = "light", ...props }: SkeletonProps) {
  const toneClass =
    tone === "dark"
      ? "bg-white/12"
      : tone === "soft"
        ? "bg-[#e8e4da]"
        : "bg-neutral-200"

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md ${toneClass} ${className}`}
      {...props}
    />
  )
}

export function SkeletonText({
  lines = 3,
  tone = "light",
}: {
  lines?: number
  tone?: SkeletonProps["tone"]
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          tone={tone}
          className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  )
}
