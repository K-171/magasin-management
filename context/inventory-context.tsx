"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useNotification } from "./notification-context"

export interface InventoryItem {
  id: string
  name: string
  category: string
  dateAdded: string
  quantity: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
}

export interface Movement {
  movementId: string
  timestamp: string
  type: "Sortie" | "Entrée"
  itemId: string
  itemName: string
  handledBy: string
  quantity: number
  expectedReturnDate?: string
  status: "En Prêt" | "Retourné" | "En Retard"
}

const initialItems: InventoryItem[] = []

const initialMovements: Movement[] = []

interface InventoryContextType {
  items: InventoryItem[]
  movements: Movement[]
  addItem: (item: { name: string; category: string; quantity: number; id?: string }) => void
  updateItem: (id: string, item: Partial<InventoryItem>) => void
  deleteItem: (id: string) => void
  getItemById: (id: string) => InventoryItem | undefined
  getCategoryStats: () => Record<string, number>
  getStatusStats: () => Record<string, number>
  getTotalItems: () => number
  getLowStockItems: () => InventoryItem[]
  getOutOfStockItems: () => InventoryItem[]
  getConsumableTurnover: (days?: number) => number
  getOverdueItems: () => Movement[]
  getMostActiveItems: (limit?: number) => { name: string; count: number }[]
  getMostActiveUsers: (limit?: number) => { name: string; count: number }[]
  addMovement: (movement: Omit<Movement, "movementId" | "timestamp">) => void
  updateMovement: (movementId: string, updates: Partial<Movement>) => void
  checkoutItem: (itemId: string, handledBy: string, quantity: number, expectedReturnDate: string) => void
  checkinItem: (movementId: string) => void
  getConsumableTurnover: (days?: number) => number
  getOverdueItems: () => Movement[]
  getMostActiveItems: (limit?: number) => { name: string; count: number }[]
  getMostActiveUsers: (limit?: number) => { name: string; count: number }[]
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems)
  const [movements, setMovements] = useState<Movement[]>(initialMovements)
  const { addNotification } = useNotification()

  // Generate unique ID for new items
  const generateId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = "#"
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generate unique movement ID
  const generateMovementId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = "MVT-"
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Determine status based on quantity and category
  const getStatus = (quantity: number, category: string): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (quantity === 0) {
      return "Out of Stock"
    }
    if (category === "Outillage") {
      return "In Stock"
    }
    if (category === "Pièce consomable") {
      if (quantity <= 10) {
        return "Low Stock"
      }
    }
    return "In Stock"
  }

  const addItem = (item: { name: string; category: string; quantity: number; id?: string }) => {
    const newItem: InventoryItem = {
      ...item,
      id: item.id || generateId(),
      dateAdded: new Date().toISOString().split("T")[0],
      status: getStatus(item.quantity, item.category),
    }
    setItems([newItem, ...items])
    addNotification(`New item added: ${newItem.name}`, `/all-stock?highlight=${newItem.id}`)

    // Add entry movement
    const entryMovement: Movement = {
      movementId: generateMovementId(),
      timestamp: new Date().toISOString(),
      type: "Entrée",
      itemId: newItem.id,
      itemName: newItem.name,
      handledBy: "System",
      quantity: item.quantity,
      status: "Retourné",
    }
    setMovements((prev) => [entryMovement, ...prev])
  }

  const updateItem = (id: string, updatedFields: Partial<InventoryItem>) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const oldStatus = item.status
          const updatedItem = { ...item, ...updatedFields }
          // Recalculate status if quantity or category changed
          if (updatedFields.quantity !== undefined || updatedFields.category !== undefined) {
            updatedItem.status = getStatus(updatedItem.quantity, updatedItem.category)
          }
          if (updatedItem.status === "Low Stock" && oldStatus === "In Stock") {
            addNotification(`${updatedItem.name} is low on stock`, `/all-stock?highlight=${updatedItem.id}`)
          }
          if (updatedItem.status === "Out of Stock" && oldStatus !== "Out of Stock") {
            addNotification(`${updatedItem.name} is out of stock`, `/all-stock?highlight=${updatedItem.id}`)
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const getItemById = (id: string) => {
    return items.find((item) => item.id === id)
  }

  const getCategoryStats = () => {
    return items.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  const getStatusStats = () => {
    return items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getLowStockItems = () => {
    return items.filter((item) => item.status === "Low Stock")
  }

  const getOutOfStockItems = () => {
    return items.filter((item) => item.status === "Out of Stock")
  }

  const getConsumableTurnover = (days = 30) => {
    const now = new Date()
    const periodStart = new Date(now.setDate(now.getDate() - days))

    const consumableMovements = movements.filter((m) => {
      const item = getItemById(m.itemId)
      const movementDate = new Date(m.timestamp)
      return (
        item?.category === "Pièce consomable" &&
        m.type === "Sortie" &&
        movementDate >= periodStart
      )
    })

    const totalConsumed = consumableMovements.reduce((sum, m) => sum + m.quantity, 0)
    const averageStock = items
      .filter((i) => i.category === "Pièce consomable")
      .reduce((sum, i) => sum + i.quantity, 0) / 2 // Simplified average

    return averageStock > 0 ? totalConsumed / averageStock : 0
  }

  const getOverdueItems = () => {
    return movements.filter((m) => m.status === "En Retard")
  }

  const getMostActiveItems = (limit = 5) => {
    const itemCounts = movements
      .filter((m) => m.type === "Sortie")
      .reduce((acc, m) => {
        acc[m.itemName] = (acc[m.itemName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }))
  }

  const getMostActiveUsers = (limit = 5) => {
    const userCounts = movements
      .filter((m) => m.type === "Sortie")
      .reduce((acc, m) => {
        acc[m.handledBy] = (acc[m.handledBy] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }))
  }

  const addMovement = (movement: Omit<Movement, "movementId" | "timestamp">) => {
    const newMovement: Movement = {
      ...movement,
      movementId: generateMovementId(),
      timestamp: new Date().toISOString(),
    }
    setMovements([newMovement, ...movements])

    const item = getItemById(movement.itemId)
    if (item) {
      const newQuantity =
        movement.type === "Entrée"
          ? item.quantity + movement.quantity
          : item.quantity - movement.quantity
      updateItem(movement.itemId, { quantity: newQuantity })
    }
  }

  const updateMovement = (movementId: string, updates: Partial<Movement>) => {
    setMovements(
      movements.map((movement) => (movement.movementId === movementId ? { ...movement, ...updates } : movement)),
    )
  }

  const checkoutItem = (itemId: string, handledBy: string, quantity: number, expectedReturnDate: string) => {
    const item = getItemById(itemId)
    if (!item || item.quantity < quantity) return

    // Update item quantity
    updateItem(itemId, { quantity: item.quantity - quantity })

    // Add checkout movement
    const checkoutMovement: Movement = {
      movementId: generateMovementId(),
      timestamp: new Date().toISOString(),
      type: "Sortie",
      itemId,
      itemName: item.name,
      handledBy,
      quantity,
      expectedReturnDate,
      status: new Date(expectedReturnDate) < new Date() ? "En Retard" : "En Prêt",
    }
    setMovements([checkoutMovement, ...movements])
    addNotification(`${item.name} checked out by ${handledBy}`, `/movement-log?highlight=${checkoutMovement.movementId}`)
  }

  const checkinItem = (movementId: string) => {
    const movement = movements.find((m) => m.movementId === movementId)
    if (!movement || movement.type !== "Sortie") return

    // Update movement status
    updateMovement(movementId, { status: "Retourné" })

    // Update item quantity
    const item = getItemById(movement.itemId)
    if (item) {
      updateItem(movement.itemId, { quantity: item.quantity + movement.quantity })
    }

    // Add return movement
    const returnMovement: Movement = {
      movementId: generateMovementId(),
      timestamp: new Date().toISOString(),
      type: "Entrée",
      itemId: movement.itemId,
      itemName: movement.itemName,
      handledBy: movement.handledBy,
      quantity: movement.quantity,
      status: "Retourné",
    }
    setMovements([returnMovement, ...movements])
    addNotification(`${item.name} returned by ${movement.handledBy}`, `/movement-log?highlight=${returnMovement.movementId}`)
  }

  return (
    <InventoryContext.Provider
      value={{
        items,
        movements,
        addItem,
        updateItem,
        deleteItem,
        getItemById,
        getCategoryStats,
        getStatusStats,
        getTotalItems,
        getLowStockItems,
        getOutOfStockItems,
        getConsumableTurnover,
        getOverdueItems,
        getMostActiveItems,
        getMostActiveUsers,
        addMovement,
        updateMovement,
        checkoutItem,
        checkinItem,
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
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
