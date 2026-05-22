import { getProjects } from "@/src/lib/api"
import Link from "next/link"
import { FolderGit2 } from "lucide-react"

export const revalidate = 60

export default async function PublicProjectsPage() {
  // Fetch only published projects
  const response = await getProjects(1, 50, undefined, false)
  const projects = response.data || []

  return (
    <div className="space-y-12">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-4">
          <FolderGit2 className="w-10 h-10 text-[var(--color-terminal-green)]" />
          Projects
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 font-mono text-sm max-w-2xl">
          A registry of completed systems, architectural blueprints, and full-stack deployments. 
          <span className="text-[var(--color-terminal-green)] block mt-2">&gt; STATUS: {projects.length} MODULES ONLINE</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link href={`/projects/${project.slug}`} key={project.id} className="group flex flex-col h-full bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 hover:border-[var(--color-terminal-green)] transition-all duration-300">
            {/* Thumbnail */}
            <div className="aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-[#1a1d21] relative border-b border-neutral-200 dark:border-neutral-800">
              {project.thumbnailUrl ? (
                <img 
                  src={project.thumbnailUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-neutral-600">
                  NO_THUMBNAIL_DATA
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--color-terminal-green)] transition-colors line-clamp-2">
                {project.title}
              </h2>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies?.slice(0, 4).map((tech, idx) => (
                  <span key={idx} className="font-mono text-[10px] uppercase bg-neutral-100 dark:bg-[#1a1d21] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 px-2 py-1">
                    {tech}
                  </span>
                ))}
                {project.technologies && project.technologies.length > 4 && (
                  <span className="font-mono text-[10px] uppercase bg-neutral-100 dark:bg-[#1a1d21] text-[var(--color-terminal-green)] border border-[var(--color-terminal-green)]/30 px-2 py-1">
                    +{project.technologies.length - 4}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800">
          <span className="font-mono text-neutral-500">NO_PUBLIC_MODULES_FOUND</span>
        </div>
      )}
    </div>
  )
}
