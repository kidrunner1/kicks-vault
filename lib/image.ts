export function normalizeImagePath(url?: string) {
    if (!url) return "/placeholder.png"

    // ถ้าเป็น external URL → return ตรง ๆ
    if (url.startsWith("http")) {
        return url
    }

    const cleaned = url.replace(/\\/g, "/")

    return cleaned.startsWith("/")
        ? cleaned
        : "/" + cleaned
}