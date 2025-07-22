"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "es" | "fr" | "de"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/locales/${language}.json`)
        if (!response.ok) {
          console.error(`Failed to fetch translations for ${language}`)
          if (language !== 'en') {
            const fallbackResponse = await fetch(`/locales/en.json`);
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
          return
        }
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error("Error loading translations:", error)
        if (language !== 'en') {
            const fallbackResponse = await fetch(`/locales/en.json`);
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations()
  }, [language])

  const t = (key: string): string => {
    return translations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
