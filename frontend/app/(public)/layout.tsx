import Link from "next/link"
import PublicHeader from "@/src/components/PublicHeader"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Public Navbar */}
      <PublicHeader />

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
