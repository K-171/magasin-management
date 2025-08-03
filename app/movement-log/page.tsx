'use client'

import { useState, useEffect } from 'react'
import { useInventory } from '@/context/inventory-context'
import { useAuth } from '@/context/auth-context'
import { useLanguage } from '@/context/language-context'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Filter, Download, RotateCcw, SortAsc, SortDesc } from 'lucide-react';

import dynamic from "next/dynamic"
import { MOVEMENT_COLUMNS } from "@/utils/excel-export"
import { formatDate } from "@/lib/utils"

import { useIsMobile } from '@/hooks/use-mobile';

const ExportDialog = dynamic(() => import("@/components/export-dialog").then((mod) => mod.ExportDialog))

export default function MovementLog() {
  const { movements, isLoading, checkinItem, fetchMovements } = useInventory()
  const { user } = useAuth()
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const highlightedId = searchParams.get('highlight')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  const itemsPerPage = 10

  // Get unique types and statuses
  const types = Array.from(new Set((movements || []).map((movement) => movement.type)))
  const statuses = Array.from(
    new Set((movements || []).map((movement) => movement.status)),
  )

  // Filter movements based on search term and filters
  const filteredMovements = (movements || []).filter((movement) => {
    const matchesSearch =
      movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.handledBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.movementId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(movement.type)
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(movement.status)

    return matchesSearch && matchesType && matchesStatus
  })

  // Sort movements
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    if (sortField === 'timestamp') {
      return sortDirection === 'asc'
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }

    if (sortField === 'quantity') {
      return sortDirection === 'asc'
        ? a.quantity - b.quantity
        : b.quantity - a.quantity
    }

    const aValue = (a as any)[sortField] || ''
    const bValue = (b as any)[sortField] || ''

    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  })

  // Paginate sorted movements
  const paginatedMovements = sortedMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )
  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage)

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    )
  }

  // Clear filters
  const clearFilters = () => {
    setSelectedTypes([])
    setSelectedStatuses([])
    setSearchTerm('')
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'En Prêt':
        return 'default'
      case 'Retourné':
        return 'secondary'
      case 'En Retard':
        return 'destructive'
      default:
        return 'default'
    }
  }

  // Get type badge variant
  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'Entrée':
        return 'default'
      case 'Sortie':
        return 'secondary'
      default:
        return 'default'
    }
  }

  // Check if movement is overdue
  const isOverdue = (movement: any) => {
    return movement.status === 'En Retard' && movement.type === 'Sortie'
  }

  // Handle check-in
  const handleCheckin = (movementId: string) => {
    if (confirm('Are you sure you want to check in this item?')) {
      checkinItem(movementId)
    }
  }

  const handleClearLog = async () => {
    if (confirm(t('confirmClearLog'))) {
      try {
        const response = await fetch('/api/movements/clear', {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchMovements();
        } else {
          console.error('Failed to clear movement log');
        }
      } catch (error) {
        console.error('Error clearing movement log:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout title={t('movementLog')}>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="mb-6">
            <Skeleton className="h-10 w-1/3" />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(8)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-5 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(itemsPerPage)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('movementLog')}>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-[#3d414a]">
            {t('movementHistory')}
          </h3>
          <div className="flex gap-2">
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4 mr-2" />
                    {t('filters')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('exportExcel')}
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem onClick={handleClearLog}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t('clearLog')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {t('filters')}
                  {(selectedTypes.length > 0 || selectedStatuses.length > 0) && (
                    <Badge className="ml-1 bg-[#2b4198]">
                      {selectedTypes.length + selectedStatuses.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsExportDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('exportExcel')}
                </Button>
                {user?.role === 'admin' && (
                  <Button
                    variant="destructive"
                    onClick={handleClearLog}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t('clearLog')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            {(selectedTypes.length > 0 || selectedStatuses.length > 0) && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                {t('clearFilters')}
              </Button>
            )}
          </div>

          {showFilters && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-2 block">
                      Filter by {t('movementType')}
                    </Label>
                    <div className="space-y-2">
                      {types.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => toggleTypeFilter(type)}
                          />
                          <label
                            htmlFor={`type-${type}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {type === 'Entrée' ? t('entry') : t('exit')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Filter by {t('status')}</Label>
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
                            {status === 'En Prêt'
                              ? t('onLoan')
                              : status === 'Retourné'
                                ? t('returned')
                                : t('overdue')}
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

        {/* Table and Mobile Card View */}
        <div className="overflow-x-auto">
          {isMobile ? (
            <div className="space-y-4">
              {paginatedMovements.map((movement) => (
                <Card key={movement.movementId} className={`bg-white shadow-sm rounded-lg ${
                  isOverdue(movement) ? 'border-red-500' : ''
                } ${
                  highlightedId === movement.movementId ? 'border-blue-500' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-800">{movement.itemName}</p>
                        <p className="text-sm text-gray-500">{movement.movementId}</p>
                      </div>
                      <Badge
                        variant={getTypeVariant(movement.type) as any}
                        className="whitespace-nowrap"
                      >
                        {movement.type === 'Entrée' ? t('entry') : t('exit')}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">{t('movementDate')}</p>
                        <p className="font-medium">{formatDate(movement.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('quantity')}</p>
                        <p className="font-medium">{movement.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('handledBy')}</p>
                        <p className="font-medium">{movement.handledBy}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('status')}</p>
                        <Badge
                          variant={getStatusVariant(movement.status) as any}
                          className="whitespace-nowrap"
                        >
                          {movement.status === 'En Prêt'
                            ? t('onLoan')
                            : movement.status === 'Retourné'
                              ? t('returned')
                              : t('overdue')}
                        </Badge>
                      </div>
                      {movement.expectedReturnDate && (
                        <div className="col-span-2">
                          <p className="text-gray-500">{t('expectedReturnDate')}</p>
                          <p className="font-medium">{formatDate(movement.expectedReturnDate)}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                      {(movement.status === 'En Prêt' ||
                        movement.status === 'En Retard') &&
                        movement.type === 'Sortie' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckin(movement.movementId)}
                            className="text-[#2b4198] hover:text-[#2b4198] hover:bg-blue-50"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            {t('checkin')}
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort('timestamp')}
                    >
                      {t('movementDate')}
                      {sortField === 'timestamp' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort('itemName')}
                    >
                      {t('itemName')}
                      {sortField === 'itemName' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort('type')}
                    >
                      {t('movementType')}
                      {sortField === 'type' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort('quantity')}
                    >
                      {t('quantity')}
                      {sortField === 'quantity' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort('handledBy')}
                    >
                      {t('handledBy')}
                      {sortField === 'handledBy' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    {t('expectedReturnDate')}
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort('status')}
                    >
                      {t('status')}
                      {sortField === 'status' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">
                    {t('actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovements.map((movement) => (
                  <TableRow
                    key={movement.movementId}
                    className={`hover:bg-gray-50 ${
                      isOverdue(movement) ? 'bg-red-50' : ''
                    } ${
                      highlightedId === movement.movementId ? 'bg-blue-100' : ''
                    }`}
                  >
                    <TableCell className="font-medium">
                      {formatDate(movement.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{movement.itemName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getTypeVariant(movement.type) as any}
                        className="whitespace-nowrap"
                      >
                        {movement.type === 'Entrée' ? t('entry') : t('exit')}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.handledBy}</TableCell>
                    <TableCell>
                      {movement.expectedReturnDate
                        ? formatDate(movement.expectedReturnDate)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(movement.status) as any}
                        className="whitespace-nowrap"
                      >
                        {movement.status === 'En Prêt'
                          ? t('onLoan')
                          : movement.status === 'Retourné'
                            ? t('returned')
                            : t('overdue')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {(movement.status === 'En Prêt' ||
                        movement.status === 'En Retard') &&
                        movement.type === 'Sortie' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckin(movement.movementId)}
                            className="text-[#2b4198] hover:text-[#2b4198] hover:bg-blue-50"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedMovements.length)} of{" "}
            {sortedMovements.length} entries
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
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={
                    currentPage === pageNum
                      ? 'bg-[#2b4198] text-white'
                      : 'hover:bg-[#2b4198] hover:text-white'
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
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        data={movements}
        defaultColumns={MOVEMENT_COLUMNS}
        title={t("movementLogData")}
        availableCategories={Array.from(new Set(movements.map((movement) => movement.type)))}
        availableStatuses={Array.from(new Set(movements.map((movement) => movement.status)))}
      />
    </Layout>
  )
}