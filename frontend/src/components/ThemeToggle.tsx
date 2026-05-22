"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-12 h-6 rounded bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 opacity-50"></div>
    )
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-12 h-6 rounded bg-neutral-300 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-700 transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-terminal-green)] group"
      aria-label="Toggle theme"
    >
      <div 
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded shadow-sm flex items-center justify-center transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-6 bg-neutral-100 dark:bg-neutral-900 border border-neutral-600" : "translate-x-0 bg-white border border-neutral-300"
        }`}
      >
        {isDark ? (
          <Moon className="w-2.5 h-2.5 text-[var(--color-terminal-green)]" />
        ) : (
          <Sun className="w-2.5 h-2.5 text-amber-500" />
        )}
      </div>
    </button>
  )
}
