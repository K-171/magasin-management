import * as ExcelJS from "exceljs"
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

// Excel Parser
export async function parseExcel(data: ArrayBuffer): Promise<ParsedRow[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(data)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    return []
  }

  const rows: ParsedRow[] = []
  const headers: string[] = []

  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
    headers.push(cell.value ? cell.value.toString() : "")
  })

  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i)
    const rowData: ParsedRow = {}
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1]
      if (header) {
        rowData[header] = cell.value
      }
    })
    rows.push(rowData)
  }

  return rows
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

// Generate sample Excel template
export async function generateSampleExcel(): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Sample")

  worksheet.columns = [
    { header: "name", key: "name", width: 25 },
    { header: "category", key: "category", width: 20 },
    { header: "quantity", key: "quantity", width: 15 },
  ]

  worksheet.addRow({ name: "Wireless Mouse", category: "Outillage", quantity: 50 })
  worksheet.addRow({ name: "Office Chair", category: "Pièce consomable", quantity: 25 })

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}
