import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import dynamic from "next/dynamic"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"


const AppProviders = dynamic(() => import("@/components/app-providers").then(mod => mod.AppProviders), { ssr: false })
const DynamicThemeToggle = dynamic(() => import("@/components/theme-toggle").then(mod => mod.ThemeToggle), { ssr: false })

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
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <body className={inter.className}>
          <AppProviders>{children}</AppProviders>
        </body>
      </ThemeProvider>
      <SpeedInsights />
    </html>
  )
}
