import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

export type AdminTone =
  | "neutral"
  | "accent"
  | "warning"
  | "danger"
  | "success"
  | "info"
  | "refund"

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export const adminButtonClass = {
  primary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-black bg-[#d8ff6a] px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
} as const

export const adminInputClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

export const adminSelectClass =
  "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

export const adminTextareaClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

export const adminStatusToneClass: Record<AdminTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  accent: "border-lime-300 bg-lime-50 text-lime-900",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  refund: "border-violet-200 bg-violet-50 text-violet-800",
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  )
}

export function AdminPanel({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

export function AdminStatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string
  tone?: AdminTone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold",
        className ?? adminStatusToneClass[tone],
      )}
    >
      {label}
    </span>
  )
}

export function AdminChartBar({
  label,
  value,
  helper,
  percent,
  tone = "accent",
}: {
  label: string
  value: string
  helper?: string
  percent: number
  tone?: AdminTone
}) {
  const width = percent > 0 ? Math.max(percent, 4) : 0
  const barTone: Record<AdminTone, string> = {
    neutral: "bg-slate-400",
    accent: "bg-lime-400",
    warning: "bg-amber-400",
    danger: "bg-red-500",
    success: "bg-emerald-500",
    info: "bg-sky-500",
    refund: "bg-violet-500",
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 font-medium text-slate-800">{label}</span>
        <span className="shrink-0 font-semibold text-slate-950">{value}</span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={cn("h-full rounded-full", barTone[tone])}
          style={{ width: `${width}%` }}
        />
      </div>
      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </div>
  )
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
      <p className="font-medium text-slate-800">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

export function AdminLinkButton({
  className,
  variant = "secondary",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & {
  variant?: keyof typeof adminButtonClass
}) {
  return (
    <Link className={cn(adminButtonClass[variant], className)} {...props} />
  )
}
