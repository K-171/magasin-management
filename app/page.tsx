'use client'

import { useInventory } from '@/context/inventory-context'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Clock,
  Upload,
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language-context'
import { Skeleton } from '@/components/ui/skeleton'

const ImportDialog = dynamic(
  () => import('@/components/import-dialog').then((mod) => mod.ImportDialog),
)

export default function Dashboard() {
  const {
    items,
    isLoading,
    getTotalItems,
    getLowStockItems,
    getOutOfStockItems,
    getConsumableTurnover,
    getOverdueItems,
    getMostActiveItems,
    getMostActiveUsers,
    getStatusStats,
  } = useInventory()
  const { t } = useLanguage()

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <Layout title={t('dashboard')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-3 w-1/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div className="flex items-center justify-between" key={i}>
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div className="flex items-center justify-between" key={i}>
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  const lowStockItems = getLowStockItems()
  const outOfStockItems = getOutOfStockItems()
  const totalItems = getTotalItems()
  const statusStats = getStatusStats()
  const consumableTurnover = getConsumableTurnover()
  const overdueItems = getOverdueItems()
  const mostActiveItems = getMostActiveItems()
  const mostActiveUsers = getMostActiveUsers()

  // Get recent items (last 5)
  const recentItems = [...(items || [])]
    .sort((a, b) => {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    })
    .slice(0, 5)

  return (
    <ProtectedRoute>
      <Layout title={t('dashboard')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {t('totalInventory')}
              </CardTitle>
              <Package className="h-4 w-4 text-[#2b4198]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                {(items || []).length} unique items
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {t('consumableTurnover')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[#2b4198]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {consumableTurnover.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {t('overdueItems')}
              </CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Items not returned on time
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {t('lowStockItems')}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">
                {((lowStockItems.length / ((items || []).length || 1)) * 100).toFixed(1)}%
                of inventory
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('mostActiveItems')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('itemName')}</TableHead>
                    <TableHead>{t('checkouts')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostActiveItems.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('mostActiveUsers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('userName')}</TableHead>
                    <TableHead>{t('checkouts')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostActiveUsers.map((user) => (
                    <TableRow key={user.name}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => setIsImportDialogOpen(true)}
                  className="flex items-center gap-2 bg-[#2b4198] hover:bg-opacity-90"
                >
                  <Upload className="h-4 w-4" />
                  {t('importInventoryData')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('itemName')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('dateAdded')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.dateAdded}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'In Stock'
                              ? 'default'
                              : item.status === 'Low Stock'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('inventoryStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#2b4198]"></div>
                      <span>{t('inStock')}</span>
                    </div>
                    <span className="font-medium">
                      {statusStats['In Stock'] || 0}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-[#2b4198]"
                      style={{
                        width: `${
                          ((statusStats['In Stock'] || 0) /
                            ((items || []).length || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                      <span>{t('lowStock')}</span>
                    </div>
                    <span className="font-medium">
                      {statusStats['Low Stock'] || 0}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{
                        width: `${
                          ((statusStats['Low Stock'] || 0) /
                            ((items || []).length || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span>{t('outOfStock')}</span>
                    </div>
                    <span className="font-medium">
                      {statusStats['Out of Stock'] || 0}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{
                        width: `${
                          ((statusStats['Out of Stock'] || 0) /
                            ((items || []).length || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('inventoryAlerts')}</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  {t('noAlertsMessage')}
                </p>
              ) : (
                <div className="space-y-4">
                  {outOfStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.category}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">{t('outOfStock')}</Badge>
                    </div>
                  ))}

                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {item.quantity} left
                        </span>
                        <Badge variant="secondary">Low Stock</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <ImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
        />
      </Layout>
    </ProtectedRoute>
  )
}
