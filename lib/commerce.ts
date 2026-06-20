export const DEFAULT_SHOE_SIZES = ["39", "40", "41", "42", "43", "44"] as const

export interface StockRow {
  size: string
  stock: number
}

export function createDefaultStockRows(): StockRow[] {
  return DEFAULT_SHOE_SIZES.map((size) => ({
    size,
    stock: 0,
  }))
}

export function normalizeStockRows(rows: StockRow[]): StockRow[] {
  const uniqueRows = new Map<string, StockRow>()

  for (const row of rows) {
    const size = row.size.trim()
    const stock = Number.isFinite(row.stock) ? Math.max(0, Math.floor(row.stock)) : 0

    if (size) {
      uniqueRows.set(size, { size, stock })
    }
  }

  return Array.from(uniqueRows.values()).sort((a, b) =>
    a.size.localeCompare(b.size, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  )
}

export function totalStock(rows: StockRow[]): number {
  return rows.reduce((sum, row) => sum + row.stock, 0)
}

export function availabilityLabel(rows: StockRow[]): string {
  const total = totalStock(rows)

  if (total === 0) return "สินค้าหมด"
  if (total <= 3) return `เหลือน้อย (${total})`

  return `มีสินค้า ${total} คู่`
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value == null) return "-"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value))
}
