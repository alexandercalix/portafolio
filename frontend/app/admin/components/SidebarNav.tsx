'use client'

import { LayoutDashboard, UserCircle, Briefcase, FileText, LogOut, MessageSquare, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function SidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Global Profile', href: '/admin/profile', icon: UserCircle },
    { name: 'Projects', href: '/admin/projects', icon: Briefcase },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Brand Identity', href: '/admin/settings/brand', icon: Settings },
    { name: 'Email Settings', href: '/admin/settings/email', icon: Settings },
  ]

  return (
    <nav className="flex-1 space-y-2 mt-8">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
              isActive
                ? 'bg-neutral-200 dark:bg-neutral-800 text-[var(--color-terminal-green)]'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-mono text-sm tracking-wide">{item.name}</span>
          </Link>
        )
      })}

      <div className="pt-8 mt-8 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-md transition-colors text-neutral-600 dark:text-neutral-400 hover:text-[var(--color-warning-amber)] hover:bg-neutral-200 dark:bg-neutral-800/50"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-mono text-sm tracking-wide">Sign Out</span>
        </button>
      </div>
    </nav>
  )
}
