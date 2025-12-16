import { Button } from "@/components/tiptap-ui-primitive/button"
import { useI18n } from "@/hooks/use-i18n"

// --- Icons ---
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon"
import { SunIcon } from "@/components/tiptap-icons/sun-icon"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { t } = useI18n()
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // 从 localStorage 读取保存的主题偏好
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      return saved === 'dark'
    }
    // 如果没有保存的偏好，检查系统偏好
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    // 应用主题
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode((isDark) => !isDark)

  return (
    <Button
      type="button"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
      tooltip={isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
      data-style="ghost"
    >
      {isDarkMode ? (
        <SunIcon className="tiptap-button-icon" />
      ) : (
        <MoonStarIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}
