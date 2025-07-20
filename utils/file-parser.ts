import type { InventoryItem } from "@/context/inventory-context"

export interface ImportResult {
  success: boolean
  data: Omit<InventoryItem, "id" | "dateAdded" | "status">[]
  errors: string[]
  warnings: string[]
}

export interface ParsedRow {
  [key: string]: string | number
}

// CSV Parser
export function parseCSV(csvText: string): ParsedRow[] {
  const lines = csvText.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row: ParsedRow = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }

  return rows
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

// Excel Parser (simplified - in a real app you'd use a library like xlsx)
export function parseExcel(data: ArrayBuffer): ParsedRow[] {
  // This is a simplified implementation
  // In a real application, you would use a library like 'xlsx' or 'exceljs'
  throw new Error("Excel parsing requires additional libraries. Please use CSV format for now.")
}

// Validate and transform imported data
export function validateImportData(rows: ParsedRow[]): ImportResult {
  const errors: string[] = []
  const warnings: string[] = []
  const validData: Omit<InventoryItem, "id" | "dateAdded" | "status">[] = []

  const requiredFields = ["name", "category", "quantity"]
  const validCategories = ["Outillage", "Pièce consomable"]

  rows.forEach((row, index) => {
    const rowNumber = index + 2 // +2 because index starts at 0 and we skip header

    // Check required fields
    const missingFields = requiredFields.filter((field) => !row[field] || row[field] === "")
    if (missingFields.length > 0) {
      errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(", ")}`)
      return
    }

    // Validate name
    const name = String(row.name || row.Name || row.item_name || row["Item Name"] || "").trim()
    if (!name) {
      errors.push(`Row ${rowNumber}: Item name is required`)
      return
    }

    // Validate category
    const category = String(row.category || row.Category || "").trim()
    if (!validCategories.includes(category)) {
      if (category) {
        warnings.push(`Row ${rowNumber}: Category "${category}" will be added as new category`)
      } else {
        errors.push(`Row ${rowNumber}: Valid category is required`)
        return
      }
    }

    // Validate quantity
    const quantityValue = row.quantity || row.Quantity || row.qty || row.Qty || 0
    const quantity = typeof quantityValue === "number" ? quantityValue : Number.parseInt(String(quantityValue))
    if (isNaN(quantity) || quantity < 0) {
      errors.push(`Row ${rowNumber}: Quantity must be a valid non-negative number`)
      return
    }

    // Add valid item
    validData.push({
      name,
      category,
      quantity,
    })
  })

  return {
    success: errors.length === 0,
    data: validData,
    errors,
    warnings,
  }
}

// Generate sample CSV template
export function generateSampleCSV(): string {
  const headers = ["name", "category", "quantity"]
  const sampleData = [
    ["Wireless Mouse", "Outillage", "50"],
    ["Office Chair", "Pièce consomable", "25"],
  ]

  return [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")
}
