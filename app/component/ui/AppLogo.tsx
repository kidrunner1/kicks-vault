type AppLogoProps = {
  label?: string
  subLabel?: string
  inverse?: boolean
  compact?: boolean
  className?: string
}

export default function AppLogo({
  label = "Kicks Vault",
  subLabel,
  inverse = false,
  compact = false,
  className = "",
}: AppLogoProps) {
  const markClass = inverse
    ? "border-white bg-white text-black"
    : "border-black bg-[#d8ff6a] text-black"
  const textClass = inverse ? "text-white" : "text-black"
  const mutedClass = inverse ? "text-white/65" : "text-black/55"

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center rounded-full border text-xs font-semibold tracking-tight shadow-sm ${
          compact ? "h-8 w-8" : "h-10 w-10"
        } ${markClass}`}
        aria-hidden="true"
      >
        KV
      </span>

      <span className="min-w-0 leading-tight">
        <span
          className={`block font-semibold tracking-tight ${
            compact ? "text-sm" : "text-base"
          } ${textClass}`}
        >
          {label}
        </span>
        {subLabel && (
          <span className={`block text-xs ${mutedClass}`}>
            {subLabel}
          </span>
        )}
      </span>
    </span>
  )
}
