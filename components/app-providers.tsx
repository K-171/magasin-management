"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { InventoryProvider } from "@/context/inventory-context"
import { LanguageProvider } from "@/context/language-context"
import { NotificationProvider } from "@/context/notification-context"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <NotificationProvider>
        <AuthProvider>
          <LanguageProvider>
            <InventoryProvider>{children}</InventoryProvider>
          </LanguageProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}
