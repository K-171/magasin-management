"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface InventoryItem {
  id: string
  name: string
  category: string
  dateAdded: string
  quantity: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
}

interface InventoryContextType {
  items: InventoryItem[]
  isLoading: boolean
  error: string | null
  addItem: (item: { name: string; category: string; quantity: number }) => Promise<void>
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  fetchItems: () => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (item: { name: string; category: string; quantity: number }) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      await fetchItems(); // Refetch to get the latest list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateItem = async (id: string, updatedFields: Partial<InventoryItem>) => {
    try {
      const response = await fetch(`/api/inventory/${id}`- {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      await fetchItems(); // Refetch to get the latest list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`- {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      await fetchItems(); // Refetch to get the latest list
    } catch (err: any) {
      setError(err.message);
    }
  };

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
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}