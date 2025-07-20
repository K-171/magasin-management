"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useInventory } from "@/context/inventory-context"
import { useLanguage } from "@/context/language-context"
import { useSearchParams } from "next/navigation"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Filter, SortAsc, SortDesc, Trash2, Upload, FileSpreadsheet, LogOut } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { INVENTORY_COLUMNS } from "@/utils/excel-export"

const ImportDialog = dynamic(() => import("@/components/import-dialog").then((mod) => mod.ImportDialog))
const ExportDialog = dynamic(() => import("@/components/export-dialog").then((mod) => mod.ExportDialog))
const CheckoutDialog = dynamic(() => import("@/components/checkout-dialog").then((mod) => mod.CheckoutDialog))

export default function AllStock() {
  const { items, updateItem, deleteItem, checkoutItem } = useInventory()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const highlightedId = searchParams.get("highlight")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [checkoutingItem, setCheckoutingItem] = useState<any>(null)
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const itemsPerPage = 10

  // Get unique categories
  const categories = Array.from(new Set(items.map((item) => item.category)))

  // Get unique statuses
  const statuses = Array.from(new Set(items.map((item) => item.status)))

  // Filter items based on search term and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category)

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortField === "quantity") {
      return sortDirection === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity
    }

    if (sortField === "dateAdded") {
      return sortDirection === "asc"
        ? new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        : new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    }

    const aValue = a[sortField as keyof typeof a] || ""
    const bValue = b[sortField as keyof typeof b] || ""

    return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  })

  // Paginate sorted items
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage)

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Edit item
  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleUpdateItem = () => {
    if (!editingItem) return

    updateItem(editingItem.id, {
      name: editingItem.name,
      category: editingItem.category,
      quantity: editingItem.quantity,
    })

    setEditingItem(null)
    setIsEditDialogOpen(false)
  }

  // Delete item
  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(id)
    }
  }

  // Checkout item
  const handleCheckoutItem = (item: any) => {
    setCheckoutingItem(item)
    setIsCheckoutDialogOpen(true)
  }

  const handleCheckout = (itemId: string, handledBy: string, quantity: number, expectedReturnDate: string) => {
    checkoutItem(itemId, handledBy, quantity, expectedReturnDate)
  }

  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  // Clear filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedStatuses([])
    setSearchTerm("")
  }

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

  return (
    <Layout title={t("allStockTitle")}>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#3d414a]">{t("inventoryItems")}</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsExportDialogOpen(true)}
              className="flex items-center gap-2 bg-[#2b4198] hover:bg-opacity-90"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {t("exportExcel")}
            </Button>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t("importData")}
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t("filters")}
              {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                <Badge className="ml-1 bg-[#2b4198]">{selectedCategories.length + selectedStatuses.length}</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                {t("clearFilters")}
              </Button>
            )}
          </div>

          {showFilters && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-2 block">Filter by {t("category")}</Label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategoryFilter(category)}
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {t(category)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Filter by {t("status")}</Label>
                    <div className="space-y-2">
                      {statuses.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatusFilter(status)}
                          />
                          <label
                            htmlFor={`status-${status}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                    onClick={() => handleSort("id")}
                  >
                    {t("itemId")}
                    {sortField === "id" &&
                      (sortDirection === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                    onClick={() => handleSort("name")}
                  >
                    {t("itemName")}
                    {sortField === "name" &&
                      (sortDirection === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                    onClick={() => handleSort("category")}
                  >
                    {t("category")}
                    {sortField === "category" &&
                      (sortDirection === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                    onClick={() => handleSort("dateAdded")}
                  >
                    {t("dateAdded")}
                    {sortField === "dateAdded" &&
                      (sortDirection === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                    onClick={() => handleSort("quantity")}
                  >
                    {t("quantity")}
                    {sortField === "quantity" &&
                      (sortDirection === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                    onClick={() => handleSort("status")}
                  >
                    {t("status")}
                    {sortField === "status" &&
                      (sortDirection === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-center">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item.id} className={`hover:bg-gray-50 ${highlightedId === item.id ? 'bg-blue-100' : ''}`}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.dateAdded}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status) as any} className="whitespace-nowrap">
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCheckoutItem(item)}
                      className="text-[#2b4198] hover:text-[#2b4198] hover:bg-blue-50 mr-2"
                      disabled={item.quantity === 0}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                      className="text-[#2b4198] hover:text-[#2b4198] hover:bg-blue-50 mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedItems.length)}{" "}
            of {sortedItems.length} entries
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="hover:bg-[#2b4198] hover:text-white"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum = i + 1
              if (totalPages > 5) {
                if (currentPage > 3) {
                  pageNum = currentPage - 3 + i
                }
                if (pageNum > totalPages - 4) {
                  pageNum = totalPages - 4 + i
                }
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={
                    currentPage === pageNum ? "bg-[#2b4198] text-white" : "hover:bg-[#2b4198] hover:text-white"
                  }
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="hover:bg-[#2b4198] hover:text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editItem")}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">{t("itemName")}</Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">{t("category")}</Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outillage">{t("Outillage")}</SelectItem>
                    <SelectItem value="Pièce consomable">{t("Pièce consomable")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-quantity">{t("quantity")}</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button onClick={handleUpdateItem} className="w-full bg-[#2b4198] hover:bg-opacity-90">
                {t("updateItem")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CheckoutDialog
        open={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
        item={checkoutingItem}
        onCheckout={handleCheckout}
      />

      <ImportDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        data={sortedItems}
        defaultColumns={INVENTORY_COLUMNS}
        title="All Stock"
        availableCategories={categories}
        availableStatuses={statuses}
      />
    </Layout>
  )
}
