"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useInventory } from "@/context/inventory-context"
import { useLanguage } from "@/context/language-context"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Edit, Plus, Trash2, Upload, FileSpreadsheet, LogOut, History } from "lucide-react"
import { INVENTORY_COLUMNS } from "@/utils/excel-export"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ImportDialog = dynamic(() => import("@/components/import-dialog").then((mod) => mod.ImportDialog))
const ExportDialog = dynamic(() => import("@/components/export-dialog").then((mod) => mod.ExportDialog))
const CheckoutDialog = dynamic(() => import("@/components/checkout-dialog").then((mod) => mod.CheckoutDialog))

export default function ManageStock() {
  const { items, addItem, updateItem, deleteItem, checkoutItem, addMovement } = useInventory()
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [checkoutingItem, setCheckoutingItem] = useState<any>(null)
  const [newItem, setNewItem] = useState({
    id: "",
    name: "",
    category: "",
    quantity: 0,
  })
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const [movementType, setMovementType] = useState<"Entrée" | "Sortie">("Entrée")
  const [selectedItem, setSelectedItem] = useState("")
  const [movementQuantity, setMovementQuantity] = useState(1)
  const [handledBy, setHandledBy] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")

  const itemsPerPage = 5

  // Sort items by date (newest first)
  const sortedItems = [...items].sort((a, b) => {
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  })

  // Filter items based on search term
  const filteredItems = sortedItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginate filtered items
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  // Add new item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) return

    addItem({
      id: newItem.id,
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
    })

    setNewItem({ id: "", name: "", category: "", quantity: 0 })
    setIsAddDialogOpen(false)
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

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !handledBy) {
      alert("Please fill out all required fields.")
      return
    }

    const item = items.find((i) => i.id === selectedItem)
    if (!item) {
      alert("Selected item not found.")
      return
    }

    addMovement({
      type: movementType,
      itemId: selectedItem,
      itemName: item.name,
      quantity: movementQuantity,
      handledBy: handledBy,
      expectedReturnDate: movementType === "Sortie" ? expectedReturnDate : undefined,
      status: movementType === "Entrée" ? "Retourné" : "En Prêt",
    })

    // Reset form
    setMovementType("Entrée")
    setSelectedItem("")
    setMovementQuantity(1)
    setHandledBy("")
    setExpectedReturnDate("")
  }

  return (
    <Layout title={t("manageStock")}>
      <Tabs defaultValue="new-items">
        <TabsList className="mb-6">
          <TabsTrigger value="new-items" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("addNewItem")}
          </TabsTrigger>
          <TabsTrigger value="log-movement" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t("logMovement")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-items">
          <Card>
            <CardHeader>
              <CardTitle>{t("newlyAddedItems")}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {t("importData")}
                </Button>
                <Button
                  onClick={() => setIsExportDialogOpen(true)}
                  className="flex items-center gap-2 bg-[#2b4198] hover:bg-opacity-90"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {t("exportExcel")}
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#2b4198] text-white hover:bg-opacity-90">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("addNewItem")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("addNewItem")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="id">{t("itemId")}</Label>
                        <Input
                          id="id"
                          value={newItem.id}
                          onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                          placeholder={t("itemId")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">{t("itemName")}</Label>
                        <Input
                          id="name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          placeholder={t("enterItemName")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">{t("category")}</Label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectCategory")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Outillage">{t("Outillage")}</SelectItem>
                            <SelectItem value="Pièce consomable">{t("Pièce consomable")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">{t("quantity")}</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })}
                          placeholder={t("enterQuantity")}
                        />
                      </div>
                      <Button onClick={handleAddItem} className="w-full bg-[#2b4198] hover:bg-opacity-90">
                        {t("addNewItem")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-600">{t("itemId")}</TableHead>
                      <TableHead className="font-semibold text-gray-600">{t("itemName")}</TableHead>
                      <TableHead className="font-semibold text-gray-600">{t("category")}</TableHead>
                      <TableHead className="font-semibold text-gray-600">{t("dateAdded")}</TableHead>
                      <TableHead className="font-semibold text-gray-600">{t("quantity")}</TableHead>
                      <TableHead className="font-semibold text-gray-600">{t("status")}</TableHead>
                      <TableHead className="font-semibold text-gray-600 text-center">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-[#2b4198] text-white" : "hover:bg-[#2b4198] hover:text-white"}
                    >
                      {page}
                    </Button>
                  ))}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log-movement">
          <Card>
            <CardHeader>
              <CardTitle>{t("logMovement")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMovementSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="movement-type">{t("movementType")}</Label>
                    <Select
                      value={movementType}
                      onValueChange={(value: "Entrée" | "Sortie") =>
                        setMovementType(value)
                      }
                    >
                      <SelectTrigger id="movement-type">
                        <SelectValue placeholder={t("selectMovementType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrée">{t("entry")}</SelectItem>
                        <SelectItem value="Sortie">{t("exit")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="item-select">{t("itemName")}</Label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger id="item-select">
                        <SelectValue placeholder={t("selectItem")} />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="movement-quantity">{t("quantity")}</Label>
                    <Input
                      id="movement-quantity"
                      type="number"
                      value={movementQuantity}
                      onChange={(e) => setMovementQuantity(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="handled-by">{t("handledBy")}</Label>
                    <Input
                      id="handled-by"
                      type="text"
                      value={handledBy}
                      onChange={(e) => setHandledBy(e.target.value)}
                      placeholder={t("enterHandlerName")}
                    />
                  </div>
                  {movementType === "Sortie" && (
                    <div>
                      <Label htmlFor="return-date">
                        {t("expectedReturnDate")}
                      </Label>
                      <Input
                        id="return-date"
                        type="date"
                        value={expectedReturnDate}
                        onChange={(e) => setExpectedReturnDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full bg-[#2b4198] hover:bg-opacity-90">
                  {t("logMovement")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
        data={paginatedItems}
        defaultColumns={INVENTORY_COLUMNS}
        title="New Items"
        availableCategories={Array.from(new Set(items.map((item) => item.category)))}
        availableStatuses={Array.from(new Set(items.map((item) => item.status)))}
      />
    </Layout>
  )
}
