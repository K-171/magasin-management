import * as XLSX from "xlsx"

export interface ExportColumn {
  key: string
  label: string
  width?: number
  type?: "text" | "number" | "date" | "currency"
  format?: string
}

export interface ExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
  includeTimestamp?: boolean
  customColumns?: ExportColumn[]
  dateRange?: {
    start: string
    end: string
    field: string
  }
  filters?: {
    categories?: string[]
    statuses?: string[]
  }
}

export interface ExportProgress {
  current: number
  total: number
  stage: "preparing" | "processing" | "formatting" | "generating" | "complete"
  message: string
}

export class ExcelExporter {
  private onProgress?: (progress: ExportProgress) => void

  constructor(onProgress?: (progress: ExportProgress) => void) {
    this.onProgress = onProgress
  }

  private updateProgress(current: number, total: number, stage: ExportProgress["stage"], message: string) {
    if (this.onProgress) {
      this.onProgress({ current, total, stage, message })
    }
  }

  private formatCellValue(value: any, type = "text"): any {
    if (value === null || value === undefined) return ""

    switch (type) {
      case "number":
        return typeof value === "number" ? value : Number.parseFloat(value) || 0
      case "currency":
        return typeof value === "number" ? value : Number.parseFloat(value) || 0
      case "date":
        if (typeof value === "string") {
          const date = new Date(value)
          return isNaN(date.getTime()) ? value : date
        }
        return value instanceof Date ? value : new Date(value)
      default:
        return String(value)
    }
  }

  private applyFilters(data: any[], options: ExportOptions): any[] {
    let filteredData = [...data]

    // Apply date range filter
    if (options.dateRange) {
      const { start, end, field } = options.dateRange
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item[field])
        const startDate = new Date(start)
        const endDate = new Date(end)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Apply category filter
    if (options.filters?.categories && options.filters.categories.length > 0) {
      filteredData = filteredData.filter((item) => options.filters!.categories!.includes(item.category))
    }

    // Apply status filter
    if (options.filters?.statuses && options.filters.statuses.length > 0) {
      filteredData = filteredData.filter((item) => options.filters!.statuses!.includes(item.status))
    }

    return filteredData
  }

  private createWorksheet(data: any[], columns: ExportColumn[], options: ExportOptions): XLSX.WorkSheet {
    this.updateProgress(0, data.length, "formatting", "Formatting data for export...")

    const headers = columns.map((col) => col.label)
    const rows: any[][] = []

    // Add headers if requested
    if (options.includeHeaders !== false) {
      rows.push(headers)
    }

    // Process data in chunks for better performance
    const chunkSize = 1000
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, Math.min(i + chunkSize, data.length))

      chunk.forEach((item, index) => {
        const row = columns.map((col) => this.formatCellValue(item[col.key], col.type))
        rows.push(row)

        if ((i + index) % 100 === 0) {
          this.updateProgress(
            i + index,
            data.length,
            "formatting",
            `Formatting row ${i + index + 1} of ${data.length}...`,
          )
        }
      })
    }

    this.updateProgress(data.length, data.length, "generating", "Creating worksheet...")

    const worksheet = XLSX.utils.aoa_to_sheet(rows)

    // Set column widths
    const colWidths = columns.map((col) => ({ wch: col.width || 15 }))
    worksheet["!cols"] = colWidths

    // Apply formatting
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")

    // Format headers
    if (options.includeHeaders !== false) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2B4198" } },
            alignment: { horizontal: "center" },
          }
        }
      }
    }

    // Format data cells based on column type
    for (let row = options.includeHeaders !== false ? 1 : 0; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const column = columns[col]

        if (worksheet[cellAddress] && column) {
          switch (column.type) {
            case "currency":
              worksheet[cellAddress].z = '"$"#,##0.00'
              break
            case "number":
              worksheet[cellAddress].z = "#,##0"
              break
            case "date":
              worksheet[cellAddress].z = "mm/dd/yyyy"
              break
          }
        }
      }
    }

    return worksheet
  }

  async exportToExcel(data: any[], columns: ExportColumn[], options: ExportOptions = {}): Promise<void> {
    try {
      this.updateProgress(0, 100, "preparing", "Preparing export...")

      // Apply filters
      const filteredData = this.applyFilters(data, options)

      this.updateProgress(20, 100, "processing", `Processing ${filteredData.length} records...`)

      // Create workbook
      const workbook = XLSX.utils.book_new()

      // Create main data worksheet
      const worksheet = this.createWorksheet(filteredData, columns, options)
      const sheetName = options.sheetName || "Data"
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // Add summary sheet if data is substantial
      if (filteredData.length > 100) {
        this.updateProgress(80, 100, "generating", "Creating summary sheet...")
        const summarySheet = this.createSummarySheet(filteredData)
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")
      }

      this.updateProgress(90, 100, "generating", "Generating Excel file...")

      // Generate filename
      const timestamp = options.includeTimestamp !== false ? new Date().toISOString().split("T")[0] : ""
      const filename = options.filename || `export${timestamp ? "-" + timestamp : ""}.xlsx`

      // Write file
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.updateProgress(100, 100, "complete", "Export completed successfully!")
    } catch (error) {
      console.error("Export failed:", error)
      throw new Error("Failed to export data to Excel")
    }
  }

  private createSummarySheet(data: any[]): XLSX.WorkSheet {
    const summary = [
      ["Export Summary", ""],
      ["Generated On", new Date().toLocaleString()],
      ["Total Records", data.length],
      ["", ""],
      ["Category Breakdown", ""],
    ]

    // Calculate category statistics
    const categoryStats: Record<string, number> = {}
    const statusStats: Record<string, number> = {}

    data.forEach((item) => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1
      statusStats[item.status] = (statusStats[item.status] || 0) + 1
    })

    Object.entries(categoryStats).forEach(([category, count]) => {
      summary.push([category, count])
    })

    summary.push(["", ""])
    summary.push(["Status Breakdown", ""])

    Object.entries(statusStats).forEach(([status, count]) => {
      summary.push([status, count])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(summary)

    // Format summary sheet
    worksheet["!cols"] = [{ wch: 20 }, { wch: 15 }]

    return worksheet
  }
}

// Predefined column configurations
export const INVENTORY_COLUMNS: ExportColumn[] = [
  { key: "id", label: "Item ID", width: 12, type: "text" },
  { key: "name", label: "Item Name", width: 25, type: "text" },
  { key: "category", label: "Category", width: 15, type: "text" },
  { key: "quantity", label: "Quantity", width: 12, type: "number" },
  { key: "status", label: "Status", width: 15, type: "text" },
  { key: "dateAdded", label: "Date Added", width: 15, type: "date" },
]

export const REPORTS_COLUMNS: ExportColumn[] = [
  { key: "id", label: "Item ID", width: 12, type: "text" },
  { key: "name", label: "Item Name", width: 25, type: "text" },
  { key: "category", label: "Category", width: 15, type: "text" },
  { key: "quantity", label: "Current Stock", width: 15, type: "number" },
  { key: "status", label: "Status", width: 15, type: "text" },
  { key: "dateAdded", label: "Date Added", width: 15, type: "date" },
  { key: "lastUpdated", label: "Last Updated", width: 15, type: "date" },
]
