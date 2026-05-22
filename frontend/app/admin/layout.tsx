import { auth } from "@/auth"
import { redirect } from "next/navigation"
import SidebarNav from "./components/SidebarNav"
import AuthProvider from "@/src/components/AuthProvider"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/?error=unauthorized_admin")
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#111315] border-r border-neutral-200 dark:border-neutral-800 flex flex-col px-4 py-6">
        <div className="px-4">
          <h2 className="text-xl font-bold tracking-wider text-neutral-900 dark:text-neutral-100 uppercase">
            Control<span className="text-[var(--color-terminal-green)]">_Center</span>
          </h2>
          <p className="text-xs text-neutral-500 font-mono mt-1">SYS.ADMIN // ACTIVE</p>
        </div>
        <SidebarNav />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </main>
    </div>
  )
}
