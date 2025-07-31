"use client"

import { useState, useEffect, useRef } from "react"
import { useInventory } from "@/context/inventory-context"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, Package, History, User } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export function GlobalSearch() {
  const { items, movements } = useInventory()
  const { user, getInvitations } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        const lowerCaseQuery = query.toLowerCase()

        const filteredItems = items
          .filter(
            (item) =>
              item.name.toLowerCase().includes(lowerCaseQuery) ||
              item.id.toLowerCase().includes(lowerCaseQuery)
          )
          .map((item) => ({ ...item, type: "item" }))

        const filteredMovements = movements
          .filter(
            (movement) =>
              movement.itemName.toLowerCase().includes(lowerCaseQuery) ||
              movement.handledBy.toLowerCase().includes(lowerCaseQuery)
          )
          .map((movement) => ({ ...movement, type: "movement" }))
          
        let filteredUsers: any[] = []
        if (user?.role === 'admin') {
          const invitations = await getInvitations()
          if (Array.isArray(invitations)) {
            filteredUsers = invitations
              .filter((invitation) => invitation.email.toLowerCase().includes(lowerCaseQuery))
              .map((invitation) => ({ ...invitation, type: "user" }))
          }
        }

        setResults([...filteredItems, ...filteredMovements, ...filteredUsers])
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }

    fetchResults()
  }, [query, items, movements, user, getInvitations])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchRef])


  const handleResultClick = (result: any) => {
    setQuery("")
    setIsOpen(false)
    if (result.type === "item") {
      router.push(`/all-stock?highlight=${result.id}`)
    } else if (result.type === "movement") {
      router.push(`/movement-log?highlight=${result.movementId}`)
    } else if (result.type === "user") {
        router.push(`/admin?highlight=${result.id}`)
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "item":
        return <Package className="h-4 w-4 text-gray-500" />
      case "movement":
        return <History className="h-4 w-4 text-gray-500" />
      case "user":
        return <User className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2b4198]"
        placeholder={t("search")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length > 1 && setIsOpen(true)}
      />
      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          <ul>
            {results.map((result, index) => (
              <li
                key={index}
                onClick={() => handleResultClick(result)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                {getResultIcon(result.type)}
                <div>
                    <p className="font-medium">
                        {result.type === 'item' && result.name}
                        {result.type === 'movement' && `${result.itemName} (${result.type})`}
                        {result.type === 'user' && result.email}
                    </p>
                    <p className="text-sm text-gray-500">
                        {result.type === 'item' && `ID: ${result.id}`}
                        {result.type === 'movement' && `by ${result.handledBy}`}
                        {result.type === 'user' && `Role: ${result.role}`}
                    </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
