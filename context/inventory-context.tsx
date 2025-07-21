'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from 'react'

export interface InventoryItem {
  id: string
  name: string
  category: string
  dateAdded: string
  quantity: number
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

interface InventoryContextType {
  items: InventoryItem[]
  isLoading: boolean
  error: string | null
  addItem: (item: {
    name: string
    category: string
    quantity: number
  }) => Promise<void>
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  fetchItems: () => Promise<void>
  getTotalItems: () => number
  getLowStockItems: () => InventoryItem[]
  getOutOfStockItems: () => InventoryItem[]
  getCategoryStats: () => Record<string, number>
  getStatusStats: () => Record<string, number>
  getConsumableTurnover: () => number
  getOverdueItems: () => any[]
  getMostActiveItems: () => any[]
  getMostActiveUsers: () => any[]
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/inventory')
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.statusText}`)
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setItems(data)
      } else {
        console.error('API did not return an array:', data)
        throw new Error('Invalid data format from API')
      }
    } catch (err: any) {
      setError(err.message)
      setItems([]) // Ensure items is an empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = async (item: {
    name: string
    category: string
    quantity: number
  }) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      if (!response.ok) {
        throw new Error('Failed to add item')
      }
      await fetchItems() // Refetch to get the latest list
    } catch (err: any) {
      setError(err.message)
    }
  }

  const updateItem = async (id: string, updatedFields: Partial<InventoryItem>) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      })
      if (!response.ok) {
        throw new Error('Failed to update item')
      }
      await fetchItems() // Refetch to get the latest list
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete item')
      }
      await fetchItems() // Refetch to get the latest list
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getTotalItems = useCallback(() => {
    return (items || []).reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const getLowStockItems = useCallback(() => {
    return (items || []).filter((item) => item.status === 'Low Stock')
  }, [items])

  const getOutOfStockItems = useCallback(() => {
    return (items || []).filter((item) => item.status === 'Out of Stock')
  }, [items])

  const getCategoryStats = useCallback(() => {
    return (items || []).reduce(
      (stats, item) => {
        stats[item.category] = (stats[item.category] || 0) + 1
        return stats
      },
      {} as Record<string, number>,
    )
  }, [items])

  const getStatusStats = useCallback(() => {
    return (items || []).reduce(
      (stats, item) => {
        stats[item.status] = (stats[item.status] || 0) + 1
        return stats
      },
      {} as Record<string, number>,
    )
  }, [items])

  // NOTE: The following functions require movement data which is not yet fetched.
  // Returning dummy data for now.
  const getConsumableTurnover = useCallback(() => 0, [])
  const getOverdueItems = useCallback(() => [], [])
  const getMostActiveItems = useCallback(() => [], [])
  const getMostActiveUsers = useCallback(() => [], [])

  return (
    <InventoryContext.Provider
      value={{
        items,
        isLoading,
        error,
        addItem,
        updateItem,
        deleteItem,
        fetchItems,
        getTotalItems,
        getLowStockItems,
        getOutOfStockItems,
        getCategoryStats,
        getStatusStats,
        getConsumableTurnover,
        getOverdueItems,
        getMostActiveItems,
        getMostActiveUsers,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}
