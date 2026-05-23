import { getGlobalProfile } from "@/src/lib/api"
import { DownloadCloud, FolderGit2, Terminal, BookOpen } from "lucide-react"
import Link from "next/link"
import ExperienceTimeline from "@/src/components/ExperienceTimeline"

// This page is a Server Component and will be rendered on the server/edge.
// Revalidation can be configured in the fetch utility or here.
export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const profile = await getGlobalProfile()

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-pulse flex flex-col items-center">
          <span className="text-red-500 font-mono text-4xl font-bold tracking-widest">SYSTEM_OFFLINE</span>
          <span className="text-neutral-500 font-mono text-sm mt-2">AWAITING_DATA_INITIALIZATION</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start justify-center min-h-[70vh] max-w-4xl space-y-12">
      
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 w-full">
        {/* Geometric Avatar */}
        {profile.avatarUrl ? (
          <div className="shrink-0 p-2 border-2 border-neutral-200 dark:border-neutral-800 relative group">
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[var(--color-terminal-green)] transition-all group-hover:-top-2 group-hover:-left-2"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[var(--color-terminal-green)] transition-all group-hover:-top-2 group-hover:-right-2"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[var(--color-terminal-green)] transition-all group-hover:-bottom-2 group-hover:-left-2"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[var(--color-terminal-green)] transition-all group-hover:-bottom-2 group-hover:-right-2"></div>
            
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              className="w-48 h-48 md:w-64 md:h-64 object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
        ) : (
          <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 border-2 border-neutral-200 dark:border-neutral-800 border-dashed flex items-center justify-center bg-white dark:bg-[#111315]">
            <span className="font-mono text-neutral-600 text-xs text-center p-4">AVATAR_MISSING</span>
          </div>
        )}

        {/* Hero Copy */}
        <div className="flex flex-col space-y-6 flex-1 pt-2">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-900 dark:text-neutral-100 uppercase">
              {profile.name}
            </h1>
            <h2 className="text-lg md:text-xl font-mono text-[var(--color-terminal-green)] mt-4">
              &gt; {profile.headline}
            </h2>
          </div>

          <div className="text-neutral-600 dark:text-neutral-400 font-sans text-base leading-relaxed whitespace-pre-line max-w-2xl">
            {profile.bio}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a 
              href="#experience"
              className="flex items-center gap-2 bg-[var(--color-terminal-green)] text-black font-mono font-bold py-3 px-6 rounded transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Terminal className="w-5 h-5" />
              <span>READ_EXECUTION_LOG</span>
            </a>

            <Link 
              href="/projects"
              className="flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-[var(--color-terminal-green)]/10 hover:border-[var(--color-terminal-green)] hover:text-[var(--color-terminal-green)] transition-all"
            >
              <FolderGit2 className="w-5 h-5" />
              <span>INITIALIZE_PROJECTS</span>
            </Link>

            <Link 
              href="/blogs"
              className="flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-[var(--color-terminal-green)]/10 hover:border-[var(--color-terminal-green)] hover:text-[var(--color-terminal-green)] transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>ACCESS_DATABANKS</span>
            </Link>

            {profile.resumeUrl && (
              <a 
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-neutral-200 dark:bg-neutral-800 hover:text-neutral-900 dark:text-white transition-colors"
              >
                <DownloadCloud className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <span>DOWNLOAD_SYS_ARCH</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div id="experience" className="w-full pt-16 mt-16 border-t border-neutral-200 dark:border-neutral-800 scroll-mt-8">
        <ExperienceTimeline 
          experiences={profile.experiences || []} 
          educations={profile.educations || []} 
        />
      </div>

    </div>
  )
}
