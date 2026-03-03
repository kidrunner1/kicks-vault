export function normalizeImagePath(url?: string | null) {
    if (!url) return "/placeholder.png"

    const trimmed = url.trim()

    // External URL
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed
    }

    // Replace Windows backslashes
    let cleaned = trimmed.replace(/\\/g, "/")

    // Remove duplicate leading slashes
    cleaned = cleaned.replace(/^\/+/, "")

    return `/${cleaned}`
}