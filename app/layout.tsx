import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { InventoryProvider } from "@/context/inventory-context"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/context/language-context"
import { NotificationProvider } from "@/context/notification-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "A comprehensive inventory management system with secure authentication",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <NotificationProvider>
            <AuthProvider>
              <LanguageProvider>
                <InventoryProvider>{children}</InventoryProvider>
              </LanguageProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
