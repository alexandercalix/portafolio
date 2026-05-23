import { auth } from "@/auth"
import { Activity, FolderGit2, BookOpen } from "lucide-react"
import { getGlobalProfile } from "@/src/lib/api"

export default async function DashboardPage() {
  const session = await auth()
  const profile = await getGlobalProfile()
  const userName = profile?.name || session?.user?.name || "Administrator"

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Welcome back, {userName}
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
          SYSTEM_STATUS: <span className="text-[var(--color-terminal-green)]">ONLINE</span>
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1 */}
        <div className="bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg relative overflow-hidden group hover:border-neutral-300 dark:border-neutral-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FolderGit2 className="w-16 h-16" />
          </div>
          <p className="font-mono text-sm text-neutral-500 mb-2">TOTAL_PROJECTS</p>
          <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">12</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex w-2 h-2 rounded-full bg-[var(--color-terminal-green)] animate-pulse"></span>
            <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">8 PUBLISHED</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg relative overflow-hidden group hover:border-neutral-300 dark:border-neutral-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen className="w-16 h-16" />
          </div>
          <p className="font-mono text-sm text-neutral-500 mb-2">BLOG_ENTRIES</p>
          <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">4</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex w-2 h-2 rounded-full bg-[var(--color-terminal-green)] animate-pulse"></span>
            <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">ALL PUBLISHED</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white dark:bg-[#111315] border border-[var(--color-warning-amber)]/30 p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-[var(--color-warning-amber)]">
            <Activity className="w-16 h-16" />
          </div>
          <p className="font-mono text-sm text-[var(--color-warning-amber)] mb-2">PENDING_DRAFTS</p>
          <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">3</p>
          <div className="mt-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
            ACTION REQUIRED
          </div>
        </div>

      </div>

      {/* Terminal-like output section */}
      <div className="mt-12">
        <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          &gt; RECENT_ACTIVITY_LOG
        </h2>
        <div className="bg-neutral-50 dark:bg-[#0a0a0c] p-4 rounded-md border border-neutral-200 dark:border-neutral-800 font-mono text-xs space-y-2 text-neutral-500">
          <p><span className="text-[var(--color-terminal-green)]">[SYS]</span> Analytics module initialized successfully.</p>
          <p><span className="text-[var(--color-terminal-green)]">[SYS]</span> Connected to Azure Backend API.</p>
          <p><span className="text-neutral-600 dark:text-neutral-400">[{new Date().toISOString().split('T')[0]}]</span> Admin session started from {session?.user?.email}.</p>
        </div>
      </div>
    </div>
  )
}
