import Link from "next/link"
import PublicHeader from "@/src/components/PublicHeader"
import { getGlobalProfile } from "@/src/lib/api"
import FeaturedSidebar from "@/src/components/FeaturedSidebar"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear()
  const profile = await getGlobalProfile().catch(() => null)
  const githubUrl = profile?.githubUrl || "https://github.com"
  const linkedInUrl = profile?.linkedInUrl || "https://linkedin.com"

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Public Navbar */}
      <PublicHeader />

      {/* Layout Wrapper with Global Sidebar */}
      <div className="flex-1 w-full max-w-[2000px] mx-auto flex flex-col xl:flex-row relative">
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full px-6 py-12 flex justify-center">
          <div className="w-full max-w-5xl">
            {children}
          </div>
        </main>

        {/* Global Right Sidebar */}
        <FeaturedSidebar />
        
      </div>

      {/* Public Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0a0c] py-8 mt-auto">
        <div className="max-w-[2000px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-neutral-500 font-mono text-xs">
            © {currentYear} otdev.io // SYSTEM_ONLINE
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link href={githubUrl} target="_blank" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 transition-colors font-mono text-xs">
              [GITHUB]
            </Link>
            <Link href={linkedInUrl} target="_blank" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 transition-colors font-mono text-xs">
              [LINKEDIN]
            </Link>
            <Link href="/admin/dashboard" className="text-neutral-600 hover:text-[var(--color-warning-amber)] transition-colors font-mono text-[10px] md:ml-4">
              [sys_admin]
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
