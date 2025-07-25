import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import enTranslations from './locales/en.json'

type Language = 'en' | 'es' | 'fr' | 'de'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('selectedLanguage')
      return (storedLanguage as Language) || 'en'
    }
    return 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', lang)
    }
  }
  const [translations, setTranslations] = useState<Record<string, string>>(enTranslations)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTranslations = async (lang: Language) => {
      if (lang === 'en') {
        setTranslations(enTranslations)
        return
      }

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
        setTranslations(enTranslations) // Fallback to English
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations(language)
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
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
