"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useInventory } from "@/context/inventory-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { parseExcel, validateImportData, generateSampleExcel, type ImportResult } from "@/utils/file-parser"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { addItem } = useInventory()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportResult(null)
    }
  }

  const processFile = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const buffer = await selectedFile.arrayBuffer()
      setProgress(25)

      const rows = await parseExcel(buffer)
      setProgress(50)

      const result = validateImportData(rows)
      setProgress(75)

      setImportResult(result)
      setProgress(100)
    } catch (error) {
      setImportResult({
        success: false,
        data: [],
        errors: [`Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings: [],
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (!importResult?.success || !importResult.data.length) return

    setIsProcessing(true)
    setProgress(0)

    try {
      for (let i = 0; i < importResult.data.length; i++) {
        const item = importResult.data[i]
        addItem(item)
        setProgress(((i + 1) / importResult.data.length) * 100)

        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      setTimeout(() => {
        onOpenChange(false)
        resetDialog()
      }, 1000)
    } catch (error) {
      console.error("Import failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setImportResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const downloadSample = async () => {
    const blob = await generateSampleExcel()
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "inventory-template.xlsx")
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Inventory Data
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="template">Download Template</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select Excel File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">Supported format: Excel (.xlsx)</p>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected file: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={processFile}
                  disabled={!selectedFile || isProcessing}
                  className="bg-[#2b4198] hover:bg-opacity-90"
                >
                  {isProcessing ? "Processing..." : "Process File"}
                </Button>
                <Button variant="outline" onClick={resetDialog}>
                  Reset
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {importResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Valid Items</p>
                      <p className="text-sm text-green-700">{importResult.data.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Errors</p>
                      <p className="text-sm text-red-700">{importResult.errors.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900">Warnings</p>
                      <p className="text-sm text-amber-700">{importResult.warnings.length}</p>
                    </div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Errors found:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index} className="text-sm">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Warnings:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {importResult.warnings.map((warning, index) => (
                            <li key={index} className="text-sm">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.data.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Preview of items to import:</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importResult.data.slice(0, 5).map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                          {importResult.data.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground">
                                ... and {importResult.data.length - 5} more items
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {importResult.success && importResult.data.length > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={handleImport} disabled={isProcessing} className="bg-[#2b4198] hover:bg-opacity-90">
                      {isProcessing
                        ? `Importing... ${progress.toFixed(0)}%`
                        : `Import ${importResult.data.length} Items`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            <div className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Download a sample Excel template to see the required format for importing inventory data.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-medium">Required Columns:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <Badge className="mb-2">Required</Badge>
                    <p className="font-medium">name</p>
                    <p className="text-sm text-muted-foreground">Item name or title</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Badge className="mb-2">Required</Badge>
                    <p className="font-medium">category</p>
                    <p className="text-sm text-muted-foreground">
                      Outillage, Pièce consomable
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Badge className="mb-2">Required</Badge>
                    <p className="font-medium">quantity</p>
                    <p className="text-sm text-muted-foreground">Number of items in stock</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Sample Data Preview:</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>name</TableHead>
                          <TableHead>category</TableHead>
                          <TableHead>quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Wireless Mouse</TableCell>
                          <TableCell>Outillage</TableCell>
                          <TableCell>50</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Office Chair</TableCell>
                          <TableCell>Pièce consomable</TableCell>
                          <TableCell>25</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Button onClick={downloadSample} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Excel Template
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}