"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Notification {
  id: string
  message: string
  timestamp: string
  read: boolean
  link?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (message: string, link?: string) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications")
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications)
      setNotifications(parsedNotifications)
      setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length)
    }
  }, [])

  const addNotification = (message: string, link?: string) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message,
      link,
      timestamp: new Date().toISOString(),
      read: false,
    }
    const updatedNotifications = [newNotification, ...notifications]
    setNotifications(updatedNotifications)
    setUnreadCount((prev) => prev + 1)
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updatedNotifications)
    setUnreadCount(0)
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
