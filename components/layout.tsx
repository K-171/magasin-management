'use client'

import { useState, type ReactNode } from 'react'
import { Bell, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { useLanguage } from '@/context/language-context'
import { useAuth } from '@/context/auth-context'
import { GlobalSearch } from '@/components/global-search'
import { useNotification } from '@/context/notification-context'
import { useIsMobile } from '@/hooks/use-mobile'

interface LayoutProps {
  children: ReactNode
  title: string
  showSearch?: boolean
}

export function Layout({ children, title, showSearch = true }: LayoutProps) {
  const { t, isLoading } = useLanguage()
  const { logout } = useAuth()
  const { unreadCount, markAllAsRead } = useNotification()
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center py-4 px-6 bg-white border-b-2 border-gray-200">
          <div className="flex items-center">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-[#3d414a]">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {showSearch && !isMobile && <GlobalSearch />}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-600 hover:text-[#2b4198]"
                onClick={markAllAsRead}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-[#2b4198]"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

