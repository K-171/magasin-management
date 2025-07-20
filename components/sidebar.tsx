"use client"

import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, ShoppingCart, Package, BarChart3, Settings, Globe, History, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const navigationItemsBase = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", active: false },
  { name: "New Items", icon: ShoppingCart, href: "/new-items", active: true },
  { name: "All Stock", icon: Package, href: "/all-stock", active: false },
  { name: "Movement Log", icon: History, href: "/movement-log", active: false },
  { name: "Reports", icon: BarChart3, href: "/reports", active: false },
  { name: "Settings", icon: Settings, href: "/settings", active: false },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  const navigationItems = [
    { name: t("dashboard"), icon: LayoutDashboard, href: "/", active: false },
    { name: t("manageStock"), icon: Package, href: "/manage-stock", active: false },
    { name: t("movementLog"), icon: History, href: "/movement-log", active: false },
    { name: t("reports"), icon: BarChart3, href: "/reports", active: false },
    ...(user?.role === "admin" ? [{ name: t("adminPanel"), icon: Settings, href: "/admin", active: false }] : []),
    { name: t("settings"), icon: Settings, href: "/settings", active: false },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="w-64 bg-[#001f3f] text-white flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-center">MAGASIN</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.name}
              variant="ghost"
              className={`w-full justify-start px-4 py-2 mt-5 text-left ${
                isActive ? "bg-[#2b4198] text-white" : "text-gray-300 hover:bg-[#2b4198] hover:text-white"
              } rounded-lg`}
              onClick={() => handleNavigation(item.href)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="px-8 py-6 border-t border-gray-700">
        <div
          className="flex items-center cursor-pointer hover:bg-[#2b4198] rounded-lg p-2 transition-colors"
          onClick={() => handleNavigation("/settings")}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
              alt={user ? `${user.firstName} ${user.lastName}` : "User"}
            />
            <AvatarFallback>{user ? getInitials(user.firstName, user.lastName) : "U"}</AvatarFallback>
          </Avatar>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold">{user ? `${user.firstName} ${user.lastName}` : "User"}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user?.role || "user")}`}>
                {user?.role || "user"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="px-6 py-3 border-t border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400 uppercase tracking-wide">Language</span>
        </div>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full bg-[#2b4198] border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">🇺🇸 English</SelectItem>
            <SelectItem value="es">🇪🇸 Español</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Company Logo */}
      <div className="px-8 py-4 border-t border-gray-700 text-center">
        <Image
          src="/Stellantis_logo_blue_background.jpg"
          alt="Company Logo"
          width={100}
          height={100}
          className="h-24 w-auto mx-auto opacity-70 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  )
}
