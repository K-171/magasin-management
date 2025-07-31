"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useInventory } from "@/context/inventory-context"
import { useLanguage } from "@/context/language-context"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, PieChart, FileSpreadsheet } from "lucide-react"
import { REPORTS_COLUMNS } from "@/utils/excel-export"
import { formatDate } from "@/lib/utils"

const ExportDialog = dynamic(() => import("@/components/export-dialog").then((mod) => mod.ExportDialog))

export default function Reports() {
  const { items, getCategoryStats, getStatusStats } = useInventory()
  const { t } = useLanguage()
  const [reportType, setReportType] = useState("inventory")
  const [timeFrame, setTimeFrame] = useState("all")
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const categoryStats = getCategoryStats()
  const statusStats = getStatusStats()

  // Filter items based on timeframe
  const filteredItems = items.filter((item) => {
    if (timeFrame === "all") return true

    const itemDate = new Date(item.dateAdded)
    const now = new Date()

    switch (timeFrame) {
      case "week":
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7))
        return itemDate >= oneWeekAgo
      case "month":
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))
        return itemDate >= oneMonthAgo
      case "quarter":
        const oneQuarterAgo = new Date(now.setMonth(now.getMonth() - 3))
        return itemDate >= oneQuarterAgo
      default:
        return true
    }
  })

  // Calculate category distribution
  const categoryDistribution = Object.entries(categoryStats).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / items.length) * 100),
  }))

  // Calculate status distribution
  const statusDistribution = Object.entries(statusStats).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / items.length) * 100),
  }))

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "In Stock":
        return "default"
      case "Low Stock":
        return "secondary"
      case "Out of Stock":
        return "destructive"
      default:
        return "default"
    }
  }

  // Get category color
  const getCategoryColor = (category: string, index: number) => {
    const colors = ["#2b4198", "#4CAF50", "#FFC107", "#9C27B0", "#FF5722"]
    const categoryIndex = Object.keys(categoryStats).indexOf(category)
    return colors[categoryIndex % colors.length]
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "#2b4198"
      case "Low Stock":
        return "#FFC107"
      case "Out of Stock":
        return "#F44336"
      default:
        return "#2b4198"
    }
  }

  // Generate CSV data
  const generateCSV = () => {
    const headers = ["ID", "Name", "Category", "Date Added", "Quantity", "Status"]
    const rows = filteredItems.map((item) => [
      item.id,
      item.name,
      item.category,
      item.dateAdded,
      item.quantity,
      item.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `inventory-report-${new Date().toISOString().split("T")[0]}.csv`)
    link.click()
  }

  // Get unique categories and statuses for export dialog
  const availableCategories = Array.from(new Set(items.map((item) => item.category)))
  const availableStatuses = Array.from(new Set(items.map((item) => item.status)))

  return (
    <Layout title={t("inventoryReports")} showSearch={false}>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-2 gap-4">
            <CardTitle>{t("inventoryReports")}</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("timeFrame")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allTime")}</SelectItem>
                  <SelectItem value="week">{t("lastWeek")}</SelectItem>
                  <SelectItem value="month">{t("lastMonth")}</SelectItem>
                  <SelectItem value="quarter">{t("lastQuarter")}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setIsExportDialogOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2b4198] hover:bg-opacity-90"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {t("exportExcel")}
              </Button>
              <Button onClick={generateCSV} variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                {t("exportCSV")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inventory" onValueChange={setReportType}>
              <TabsList className="mb-6">
                <TabsTrigger value="inventory" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t("inventoryReport")}
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  {t("distributionAnalysis")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inventory">
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-600">{t("itemId")}</TableHead>
                        <TableHead className="font-semibold text-gray-600">{t("itemName")}</TableHead>
                        <TableHead className="font-semibold text-gray-600">{t("category")}</TableHead>
                        <TableHead className="font-semibold text-gray-600">{t("dateAdded")}</TableHead>
                        <TableHead className="font-semibold text-gray-600">{t("quantity")}</TableHead>
                        <TableHead className="font-semibold text-gray-600">{t("status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{formatDate(item.dateAdded)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(item.status) as any} className="whitespace-nowrap">
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="bg-white shadow-sm rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <p className="font-bold text-lg text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.id}</p>
                          </div>
                          <Badge variant={getStatusVariant(item.status) as any} className="whitespace-nowrap">
                            {item.status}
                          </Badge>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">{t("category")}</p>
                            <p className="font-medium">{item.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t("quantity")}</p>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500">{t("dateAdded")}</p>
                            <p className="font-medium">{formatDate(item.dateAdded)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="distribution">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("categoryDistribution")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryDistribution.map(({ category, count, percentage }, index) => (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: getCategoryColor(category, index) }}
                                ></div>
                                <span>{t(category)}</span>
                              </div>
                              <span className="font-medium">
                                {count} {t("items")} ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: getCategoryColor(category, index),
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("statusDistribution")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {statusDistribution.map(({ status, count, percentage }) => (
                          <div key={status} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: getStatusColor(status) }}
                                ></div>
                                <span>{status}</span>
                              </div>
                              <span className="font-medium">
                                {count} {t("items")} ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: getStatusColor(status),
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        data={filteredItems}
        defaultColumns={REPORTS_COLUMNS}
        title="Inventory Report"
        availableCategories={availableCategories}
        availableStatuses={availableStatuses}
      />
    </Layout>
  )
}
