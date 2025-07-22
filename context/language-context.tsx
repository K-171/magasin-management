'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Language = 'en' | 'es' | 'fr' | 'de'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true) // Start in a loading state

  useEffect(() => {
    const fetchTranslations = async (lang: Language) => {
      setIsLoading(true)
      try {
        const response = await fetch(`/locales/${lang}.json`)
        if (!response.ok) {
          throw new Error(`Failed to fetch translations for ${lang}`)
        }
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error('Error loading translations:', error)
        // Attempt to load English as a fallback
        if (lang !== 'en') {
          try {
            const fallbackResponse = await fetch(`/locales/en.json`)
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          } catch (fallbackError) {
            console.error('Error loading fallback translations:', fallbackError)
            setTranslations({})
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations(language)
  }, [language])

  const t = (key: string): string => {
    return translations[key] || key
  }

  // Render a loading screen for the whole page until translations are ready
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
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
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}