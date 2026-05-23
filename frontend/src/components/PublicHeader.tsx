'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./ThemeToggle"

export default function PublicHeader() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/projects', label: '/projects' },
    { href: '/blog', label: '/blog' },
    { href: '/contact', label: '/contact' }
  ]

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className={`text-xl font-mono font-bold tracking-tighter transition-colors ${
            pathname === '/' 
              ? 'text-[var(--color-terminal-green)]' 
              : 'text-neutral-900 dark:text-neutral-100 hover:text-[var(--color-terminal-green)]'
          }`}
        >
          otdev<span className="text-[var(--color-terminal-green)]">.io</span>
        </Link>
        <nav className="flex items-center gap-8">
          {navLinks.map(link => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`text-sm font-mono transition-colors ${
                  isActive 
                    ? 'text-[var(--color-terminal-green)] hover:text-green-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
