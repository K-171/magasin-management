export interface ImportStats {
  totalProcessed: number
  successful: number
  failed: number
  duplicates: number
}

export function detectDelimiter(csvText: string): string {
  const lines = csvText.split("\n").slice(0, 5) // Check first 5 lines
  const delimiters = [",", ";", "\t", "|"]

  let bestDelimiter = ","
  let maxColumns = 0

  for (const delimiter of delimiters) {
    const avgColumns =
      lines.reduce((sum, line) => {
        return sum + line.split(delimiter).length
      }, 0) / lines.length

    if (avgColumns > maxColumns) {
      maxColumns = avgColumns
      bestDelimiter = delimiter
    }
  }

  return bestDelimiter
}

export function sanitizeValue(value: any): string {
  if (value === null || value === undefined) return ""
  return String(value)
    .trim()
    .replace(/^["']|["']$/g, "") // Remove quotes
}

export function validateItemName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length === 0) {
    return { valid: false, error: "Item name is required" }
  }
  if (name.length > 100) {
    return { valid: false, error: "Item name must be less than 100 characters" }
  }
  return { valid: true }
}

export function validateQuantity(quantity: any): { valid: boolean; value?: number; error?: string } {
  const num = Number(quantity)
  if (isNaN(num)) {
    return { valid: false, error: "Quantity must be a number" }
  }
  if (num < 0) {
    return { valid: false, error: "Quantity cannot be negative" }
  }
  if (!Number.isInteger(num)) {
    return { valid: false, error: "Quantity must be a whole number" }
  }
  return { valid: true, value: num }
}

export function normalizeCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    electronic: "Electronics",
    electronics: "Electronics",
    tech: "Electronics",
    technology: "Electronics",
    furniture: "Furniture",
    desk: "Furniture",
    chair: "Furniture",
    accessory: "Accessories",
    accessories: "Accessories",
    cable: "Accessories",
    office: "Office Supplies",
    supplies: "Office Supplies",
    "office supplies": "Office Supplies",
    stationery: "Office Supplies",
  }

  const normalized = category.toLowerCase().trim()
  return categoryMap[normalized] || category
}
