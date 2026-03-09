export function normalizeImagePath(url?: string | null) {

    if (!url) return "/placeholder.png"

    const trimmed = url.trim()

    // External URL
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed
    }

    // Convert Windows path
    let cleaned = trimmed.replace(/\\/g, "/")

    // Remove duplicate slashes
    cleaned = cleaned.replace(/\/+/g, "/")

    // Remove leading slash
    cleaned = cleaned.replace(/^\/+/, "")

    return encodeURI(`/${cleaned}`)
}