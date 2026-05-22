import Link from "next/link"
import { ThemeToggle } from "@/src/components/ThemeToggle"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Public Navbar */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-mono font-bold tracking-tighter text-neutral-900 dark:text-neutral-100 hover:text-[var(--color-terminal-green)] transition-colors">
            otdev<span className="text-[var(--color-terminal-green)]">.io</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/projects" className="text-sm font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 transition-colors">
              /projects
            </Link>
            <Link href="/blog" className="text-sm font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 transition-colors">
              /blog
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0a0c] py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-neutral-500 font-mono text-xs">
            © {currentYear} otdev.io // SYSTEM_ONLINE
          </div>
          <div className="flex items-center gap-6">
            <Link href="https://github.com" target="_blank" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 transition-colors font-mono text-xs">
              [GITHUB]
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 transition-colors font-mono text-xs">
              [LINKEDIN]
            </Link>
            <Link href="/admin/dashboard" className="text-neutral-600 hover:text-[var(--color-warning-amber)] transition-colors font-mono text-[10px] ml-4">
              [sys_admin]
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
