'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from 'react'
import { useAuth } from '@/context/auth-context'

export interface InventoryItem {
  id: string
  name: string
  category: string
  dateAdded: string
  quantity: number
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

export interface Movement {
  movementId: string
  timestamp: string
  type: string
  itemId: string
  itemName: string
  handledBy: string
  quantity: number
  expectedReturnDate?: string
  status: string
}

interface InventoryContextType {
  items: InventoryItem[]
  movements: Movement[]
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
  fetchMovements: () => Promise<void>
  addMovement: (movement: Omit<Movement, "movementId" | "timestamp">) => Promise<void>;
  checkoutItem: (itemId: string, handledBy: string, quantity: number, expectedReturnDate?: string) => Promise<void>;
  checkinItem: (movementId: string) => Promise<void>
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
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
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

  const fetchMovements = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/movements')
      if (!response.ok) {
        throw new Error(`Failed to fetch movements: ${response.statusText}`)
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setMovements(data)
      } else {
        console.error('API did not return an array:', data)
        throw new Error('Invalid data format from API')
      }
    } catch (err: any) {
      setError(err.message)
      setMovements([]) // Ensure movements is an empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
    fetchMovements()
  }, [])

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
      const newItem = await response.json(); // Get the newly created item from the response
      await fetchItems(); // Refetch to get the latest list

      // Log an "Entrée" movement for the new item
      if (user && newItem) {
        await addMovement({
          type: "Entrée",
          itemId: newItem.id,
          itemName: newItem.name,
          quantity: newItem.quantity,
          handledBy: user.username, // Use the logged-in user's username
          status: "Retourné", // New items are considered returned/in stock
        });
      }
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

  const addMovement = async (movement: Omit<Movement, "movementId" | "timestamp">) => {
    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movement),
      });
      if (!response.ok) {
        throw new Error("Failed to add movement");
      }

      const currentItem = items.find(item => item.id === movement.itemId);
      if (currentItem) {
        let newQuantity = currentItem.quantity;
        if (movement.type === "Entrée") {
          newQuantity += movement.quantity;
        } else if (movement.type === "Sortie") {
          newQuantity -= movement.quantity;
        }
        await updateItem(currentItem.id, { quantity: newQuantity });
      }

      if (movement.type === "Sortie" && currentItem?.category === "Pièce consomable") {
        await fetch(`/api/movements/${(await response.json()).movementId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Consommé' }),
        });
      }

      await fetchMovements(); // Refetch to get the latest list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const checkoutItem = async (itemId: string, handledBy: string, quantity: number, expectedReturnDate?: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) {
      setError("Item not found");
      return;
    }

    const returnDate = expectedReturnDate ? new Date(expectedReturnDate) : undefined;

    await addMovement({
      type: "Sortie",
      itemId: itemId,
      itemName: item.name,
      quantity: quantity,
      handledBy: handledBy,
      expectedReturnDate: returnDate?.toISOString(),
      status: item.category === "Pièce consomable" ? "Consommé" : "En Prêt",
    });
  };

  const checkinItem = async (movementId: string) => {
    try {
      const response = await fetch(`/api/movements/${movementId}/checkin`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to check in item')
      }
      const checkedInMovement = await response.json();

      // Log an "Entrée" movement for the checked-in item
      if (user && checkedInMovement) {
        await addMovement({
          type: "Entrée",
          itemId: checkedInMovement.itemId,
          itemName: checkedInMovement.itemName,
          quantity: checkedInMovement.quantity,
          handledBy: user.username, // Use the logged-in user's username
          status: "Retourné", // Checked-in items are considered returned/in stock
        });
      }

      await fetchMovements()
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
  const getConsumableTurnover = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const turnoverMovements = movements.filter(movement =>
      movement.type === "Sortie" && new Date(movement.timestamp) >= thirtyDaysAgo
    );

    return turnoverMovements.reduce((total, movement) => total + movement.quantity, 0);
  }, [movements]);
  const getOverdueItems = useCallback(() => {
    return movements.filter(movement => movement.type === "Sortie" && movement.status === "En Retard");
  }, [movements]);
  const getMostActiveItems = useCallback(() => {
    const itemActivity: { [key: string]: { name: string; count: number } } = {};

    movements.forEach(movement => {
      if (movement.type === "Sortie") {
        if (!itemActivity[movement.itemId]) {
          itemActivity[movement.itemId] = { name: movement.itemName, count: 0 };
        }
        itemActivity[movement.itemId].count += movement.quantity; // Sum quantities for activity
      }
    });

    return Object.values(itemActivity).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [movements]);
  const getMostActiveUsers = useCallback(() => {
    const userActivity: { [key: string]: { name: string; count: number } } = {};

    movements.forEach(movement => {
      if (movement.type === "Sortie") {
        if (!userActivity[movement.handledBy]) {
          userActivity[movement.handledBy] = { name: movement.handledBy, count: 0 };
        }
        userActivity[movement.handledBy].count += movement.quantity; // Sum quantities for activity
      }
    });

    return Object.values(userActivity).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [movements]);

  return (
    <InventoryContext.Provider
      value={{
        items,
        movements,
        isLoading,
        error,
        addItem,
        updateItem,
        deleteItem,
        fetchItems,
        fetchMovements,
        addMovement, // Add this line
        checkoutItem,
        checkinItem,
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
