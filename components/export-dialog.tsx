"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Download, FileSpreadsheet, Settings, Filter, Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { ExcelExporter, type ExportColumn, type ExportOptions, type ExportProgress } from "@/utils/excel-export"
import { useLanguage } from "@/context/language-context"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: any[]
  defaultColumns: ExportColumn[]
  title: string
  availableCategories?: string[]
  availableStatuses?: string[]
}

export function ExportDialog({
  open,
  onOpenChange,
  data,
  defaultColumns,
  title,
  availableCategories = [],
  availableStatuses = [],
}: ExportDialogProps) {
  const { t } = useLanguage()
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    filename: `${title.toLowerCase().replace(/\s+/g, "-")}-export`,
    sheetName: title,
    includeHeaders: true,
    includeTimestamp: true,
  })

  const [selectedColumns, setSelectedColumns] = useState<ExportColumn[]>(defaultColumns)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: "", end: "", enabled: false })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [exportComplete, setExportComplete] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsExporting(false)
      setExportProgress(null)
      setExportComplete(false)
      setExportError(null)
      setSelectedCategories([])
      setSelectedStatuses([])
      setDateRange({ start: "", end: "", enabled: false })
    }
  }, [open])

  const handleColumnToggle = (column: ExportColumn, checked: boolean) => {
    if (checked) {
      setSelectedColumns([...selectedColumns, column])
    } else {
      setSelectedColumns(selectedColumns.filter((col) => col.key !== column.key))
    }
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== category))
    }
  }

  const handleStatusToggle = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status])
    } else {
      setSelectedStatuses(selectedStatuses.filter((stat) => stat !== status))
    }
  }

  const getFilteredDataCount = () => {
    let filteredData = [...data]

    if (selectedCategories.length > 0) {
      filteredData = filteredData.filter((item) => selectedCategories.includes(item.category))
    }

    if (selectedStatuses.length > 0) {
      filteredData = filteredData.filter((item) => selectedStatuses.includes(item.status))
    }

    if (dateRange.enabled && dateRange.start && dateRange.end) {
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.dateAdded)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    return filteredData.length
  }

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      setExportError("Please select at least one column to export")
      return
    }

    setIsExporting(true)
    setExportError(null)
    setExportComplete(false)

    try {
      const exporter = new ExcelExporter((progress) => {
        setExportProgress(progress)
      })

      const options: ExportOptions = {
        ...exportOptions,
        customColumns: selectedColumns,
        filters: {
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        },
        dateRange:
          dateRange.enabled && dateRange.start && dateRange.end
            ? {
                start: dateRange.start,
                end: dateRange.end,
                field: "dateAdded",
              }
            : undefined,
      }

      await exporter.exportToExcel(data, selectedColumns, options)

      // Auto-close dialog after successful export
      setTimeout(() => {
        onOpenChange(false)
      }, 2000)
      setExportComplete(true)

      // Auto-close dialog after successful export
      setTimeout(() => {
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const getProgressPercentage = () => {
    if (!exportProgress) return 0
    return Math.round((exportProgress.current / exportProgress.total) * 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export {title} to Excel
          </DialogTitle>
        </DialogHeader>

        {!isExporting && !exportComplete ? (
          <Tabs defaultValue="columns" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="columns" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Columns
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="options" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Options
              </TabsTrigger>
            </TabsList>

            <TabsContent value="columns" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Columns to Export</CardTitle>
                  <CardDescription>Choose which data fields to include in your Excel export</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defaultColumns.map((column) => (
                      <div key={column.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.key}
                          checked={selectedColumns.some((col) => col.key === column.key)}
                          onCheckedChange={(checked) => handleColumnToggle(column, checked as boolean)}
                        />
                        <label
                          htmlFor={column.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {column.label}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {column.type || "text"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedColumns.length}</strong> columns selected
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="grid gap-4">
                {availableCategories.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Filter by Category</CardTitle>
                      <CardDescription>Select specific categories to include (leave empty for all)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                            />
                            <label htmlFor={`category-${category}`} className="text-sm font-medium leading-none">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {availableStatuses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Filter by Status</CardTitle>
                      <CardDescription>Select specific statuses to include (leave empty for all)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableStatuses.map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={(checked) => handleStatusToggle(status, checked as boolean)}
                            />
                            <label htmlFor={`status-${status}`} className="text-sm font-medium leading-none">
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Date Range Filter</CardTitle>
                    <CardDescription>Filter records by date added (optional)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable-date-filter"
                        checked={dateRange.enabled}
                        onCheckedChange={(checked) => setDateRange({ ...dateRange, enabled: checked as boolean })}
                      />
                      <label htmlFor="enable-date-filter" className="text-sm font-medium">
                        Enable date range filter
                      </label>
                    </div>

                    {dateRange.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date">End Date</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>{getFilteredDataCount()}</strong> of <strong>{data.length}</strong> records will be exported
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Customize your Excel export settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="filename">Filename</Label>
                      <Input
                        id="filename"
                        value={exportOptions.filename || ""}
                        onChange={(e) => setExportOptions({ ...exportOptions, filename: e.target.value })}
                        placeholder="export-filename"
                      />
                      <p className="text-xs text-muted-foreground mt-1">.xlsx extension will be added automatically</p>
                    </div>
                    <div>
                      <Label htmlFor="sheet-name">Sheet Name</Label>
                      <Input
                        id="sheet-name"
                        value={exportOptions.sheetName || ""}
                        onChange={(e) => setExportOptions({ ...exportOptions, sheetName: e.target.value })}
                        placeholder="Sheet1"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-headers"
                        checked={exportOptions.includeHeaders !== false}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeHeaders: checked as boolean })
                        }
                      />
                      <label htmlFor="include-headers" className="text-sm font-medium">
                        Include column headers
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-timestamp"
                        checked={exportOptions.includeTimestamp !== false}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeTimestamp: checked as boolean })
                        }
                      />
                      <label htmlFor="include-timestamp" className="text-sm font-medium">
                        Include timestamp in filename
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}

        {/* Export Progress */}
        {isExporting && exportProgress && (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Exporting to Excel...</h3>
              <p className="text-muted-foreground">{exportProgress.message}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="font-medium">Records Processed</p>
                <p className="text-lg">{exportProgress.current.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="font-medium">Total Records</p>
                <p className="text-lg">{exportProgress.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Export Complete */}
        {exportComplete && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Export Completed!</h3>
              <p className="text-muted-foreground">Your Excel file has been downloaded successfully.</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {exportError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {!isExporting && !exportComplete && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedColumns.length === 0}
              className="bg-[#2b4198] hover:bg-opacity-90"
            >
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
