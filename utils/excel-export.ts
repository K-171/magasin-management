import * as ExcelJS from "exceljs"

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

    if (options.dateRange) {
      const { start, end, field } = options.dateRange
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item[field])
        const startDate = new Date(start)
        const endDate = new Date(end)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    if (options.filters?.categories && options.filters.categories.length > 0) {
      filteredData = filteredData.filter((item) => options.filters!.categories!.includes(item.category))
    }

    if (options.filters?.statuses && options.filters.statuses.length > 0) {
      filteredData = filteredData.filter((item) => options.filters!.statuses!.includes(item.status))
    }

    return filteredData
  }

  private async createWorksheet(
    workbook: ExcelJS.Workbook,
    data: any[],
    columns: ExportColumn[],
    options: ExportOptions,
  ): Promise<void> {
    this.updateProgress(0, data.length, "formatting", "Formatting data for export...")

    const sheetName = options.sheetName || "Data"
    const worksheet = workbook.addWorksheet(sheetName)

    // Add headers
    if (options.includeHeaders !== false) {
      worksheet.columns = columns.map((col) => ({
        header: col.label,
        key: col.key,
        width: col.width || 15,
      }))

      // Style headers
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF2B4198" },
        }
        cell.alignment = { horizontal: "center" }
      })
    }

    // Add data rows
    data.forEach((item, index) => {
      const row = worksheet.addRow(item)

      columns.forEach((col, colIndex) => {
        const cell = row.getCell(colIndex + 1)
        switch (col.type) {
          case "currency":
            cell.numFmt = '"$"#,##0.00'
            break
          case "number":
            cell.numFmt = "#,##0"
            break
          case "date":
            cell.numFmt = "mm/dd/yyyy"
            break
        }
      })

      if ((index + 1) % 100 === 0) {
        this.updateProgress(
          index + 1,
          data.length,
          "formatting",
          `Formatting row ${index + 1} of ${data.length}...`,
        )
      }
    })

    this.updateProgress(data.length, data.length, "generating", "Worksheet created.")
  }

  async exportToExcel(data: any[], columns: ExportColumn[], options: ExportOptions = {}): Promise<void> {
    try {
      this.updateProgress(0, 100, "preparing", "Preparing export...")

      const filteredData = this.applyFilters(data, options)

      this.updateProgress(20, 100, "processing", `Processing ${filteredData.length} records...`)

      const workbook = new ExcelJS.Workbook()

      await this.createWorksheet(workbook, filteredData, columns, options)

      if (filteredData.length > 100) {
        this.updateProgress(80, 100, "generating", "Creating summary sheet...")
        this.createSummarySheet(workbook, filteredData)
      }

      this.updateProgress(90, 100, "generating", "Generating Excel file...")

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

      const timestamp = options.includeTimestamp !== false ? new Date().toISOString().split("T")[0] : ""
      const filename = options.filename || `export${timestamp ? "-" + timestamp : ""}.xlsx`

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      this.updateProgress(100, 100, "complete", "Export completed successfully!")
    } catch (error) {
      console.error("Export failed:", error)
      throw new Error("Failed to export data to Excel")
    }
  }

  private createSummarySheet(workbook: ExcelJS.Workbook, data: any[]): void {
    const summarySheet = workbook.addWorksheet("Summary")

    summarySheet.columns = [
      { header: "Summary", key: "summary", width: 20 },
      { header: "Value", key: "value", width: 15 },
    ]

    summarySheet.addRow({ summary: "Export Summary", value: "" })
    summarySheet.addRow({ summary: "Generated On", value: new Date().toLocaleString() })
    summarySheet.addRow({ summary: "Total Records", value: data.length })
    summarySheet.addRow({ summary: "", value: "" })
    summarySheet.addRow({ summary: "Category Breakdown", value: "" })

    const categoryStats: Record<string, number> = {}
    const statusStats: Record<string, number> = {}

    data.forEach((item) => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1
      statusStats[item.status] = (statusStats[item.status] || 0) + 1
    })

    Object.entries(categoryStats).forEach(([category, count]) => {
      summarySheet.addRow({ summary: category, value: count })
    })

    summarySheet.addRow({ summary: "", value: "" })
    summarySheet.addRow({ summary: "Status Breakdown", value: "" })

    Object.entries(statusStats).forEach(([status, count]) => {
      summarySheet.addRow({ summary: status, value: count })
    })
  }
}

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

export const MOVEMENT_COLUMNS: ExportColumn[] = [
  { key: "movementId", label: "Movement ID", width: 12, type: "text" },
  { key: "timestamp", label: "Date", width: 18, type: "date" },
  { key: "type", label: "Type", width: 10, type: "text" },
  { key: "itemName", label: "Item Name", width: 25, type: "text" },
  { key: "quantity", label: "Quantity", width: 12, type: "number" },
  { key: "handledBy", label: "Handled By", width: 20, type: "text" },
  { key: "expectedReturnDate", label: "Expected Return Date", width: 18, type: "date" },
  { key: "status", label: "Status", width: 15, type: "text" },
]
