const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"

const disabledPrimary =
  "disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300 disabled:text-neutral-700 disabled:opacity-100 disabled:hover:border-neutral-300 disabled:hover:bg-neutral-300 disabled:hover:text-neutral-700"

const disabledSecondary =
  "disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-black/45 disabled:opacity-100 disabled:hover:border-neutral-200 disabled:hover:bg-neutral-100 disabled:hover:text-black/45"

const disabledAccent =
  "disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-black/45 disabled:opacity-100 disabled:hover:border-neutral-300 disabled:hover:bg-neutral-200 disabled:hover:text-black/45"

const filterControl =
  `inline-flex items-center gap-2 border text-sm transition ${focusRing}`

const filterSelected =
  "border-black bg-[#d8ff6a] text-black shadow-sm hover:bg-[#e4ff84] hover:text-black"

const filterIdle =
  "border-black/10 bg-[#f8f7f3] text-black/70 hover:border-black/35 hover:bg-white hover:text-black"

export const uiAction = {
  primary:
    `inline-flex items-center justify-center gap-2 rounded-full border border-black bg-black text-white transition hover:bg-white hover:text-black ${focusRing} ${disabledPrimary}`,
  accent:
    `inline-flex items-center justify-center gap-2 rounded-full border border-black bg-[#d8ff6a] text-black shadow-sm transition hover:bg-white hover:text-black ${focusRing} ${disabledAccent}`,
  surface:
    `inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white text-black/70 transition hover:border-black/35 hover:bg-[#f8f7f3] hover:text-black ${focusRing} ${disabledSecondary}`,
  secondary:
    `inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white text-black/70 transition hover:border-black hover:bg-black hover:text-white ${focusRing} ${disabledSecondary}`,
  primaryPanel:
    `inline-flex items-center justify-center gap-2 rounded-lg border border-black bg-black text-white transition hover:bg-white hover:text-black ${focusRing} ${disabledPrimary}`,
  surfacePanel:
    `inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white text-black/70 transition hover:border-black/35 hover:bg-[#f8f7f3] hover:text-black ${focusRing} ${disabledSecondary}`,
  secondaryPanel:
    `inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-[#f4f3ef] text-black/70 transition hover:border-black hover:bg-black hover:text-white ${focusRing} ${disabledSecondary}`,
  ghost:
    `inline-flex items-center gap-2 text-black/60 transition hover:text-black ${focusRing}`,
  danger:
    `inline-flex items-center justify-center gap-2 rounded-full text-red-600 transition hover:bg-red-50 hover:text-red-700 ${focusRing} disabled:cursor-not-allowed disabled:text-red-400 disabled:opacity-100`,
  navActive:
    `flex items-center justify-between rounded-xl border border-black bg-[#d8ff6a] text-black shadow-sm transition hover:bg-[#e4ff84] hover:text-black ${focusRing}`,
  navItem:
    `flex items-center justify-between rounded-xl border border-transparent text-black/70 transition hover:border-black/35 hover:bg-white hover:text-black ${focusRing}`,
}

export function filterActionClass({
  active,
  className = "",
  shape = "rounded-lg",
}: {
  active: boolean
  className?: string
  shape?: string
}) {
  return `${filterControl} ${shape} ${active ? filterSelected : filterIdle} ${className}`.trim()
}
