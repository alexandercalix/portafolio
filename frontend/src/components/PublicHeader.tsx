'use client'

import { useState } from 'react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./ThemeToggle"
import { Menu, X } from "lucide-react"

export default function PublicHeader() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-xl font-mono font-bold tracking-tighter transition-colors text-neutral-900 dark:text-neutral-100 hover:text-[var(--color-terminal-green)]"
        >
          otdev<span className="text-[var(--color-terminal-green)]">.io</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
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

        {/* Mobile Nav Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
            className="text-neutral-600 dark:text-neutral-400 hover:text-[var(--color-terminal-green)] transition-colors p-1"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <nav className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315] absolute w-full left-0 flex flex-col items-center py-8 gap-8 shadow-2xl">
          {navLinks.map(link => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-mono transition-colors tracking-widest uppercase ${
                  isActive 
                    ? 'text-[var(--color-terminal-green)]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
