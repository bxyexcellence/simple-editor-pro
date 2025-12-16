import { useMemo, useCallback, useEffect, useState } from 'react'
import { setLanguage, getLanguage, getTranslations, type Translations, type Language } from '@/lib/i18n'

// 创建一个事件系统来通知语言变化
let languageListeners: Set<() => void> = new Set()

export function notifyLanguageChange() {
  languageListeners.forEach(listener => listener())
}

export function useI18n(language?: Language) {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage())

  // 如果传入了语言，设置它
  useEffect(() => {
    if (language) {
      setLanguage(language)
      setCurrentLang(language)
      notifyLanguageChange()
    }
  }, [language])

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = () => {
      const lang = getLanguage()
      if (lang !== currentLang) {
        setCurrentLang(lang)
      }
    }
    
    languageListeners.add(handleLanguageChange)
    return () => {
      languageListeners.delete(handleLanguageChange)
    }
  }, [currentLang])

  const translations = useMemo(() => getTranslations(), [currentLang])
  
  const t = useCallback((key: keyof Translations): string => {
    return translations[key] || key
  }, [translations])
  
  return {
    t,
    translations,
    currentLanguage: currentLang,
  }
}

export type { Translations, Language }

