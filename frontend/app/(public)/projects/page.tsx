import { getProjects } from "@/src/lib/api"
import { FolderGit2 } from "lucide-react"
import ContentControls from "@/src/components/ContentControls"
import ContentDisplay from "@/src/components/ContentDisplay"
import { normalizeProjects } from "@/src/types/content"

export const revalidate = 60

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function PublicProjectsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams

  // Fetch only published projects
  const response = await getProjects(1, 50, undefined, false)
  const projects = response.data || []

  const normalizedItems = normalizeProjects(projects)

  // Compute unique tags from the projects
  const uniqueTags = Array.from(new Set(normalizedItems.flatMap(item => item.tags))).sort()

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
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

      <div className="space-y-6">
        <ContentControls uniqueTags={uniqueTags} />
        <ContentDisplay items={normalizedItems} searchParams={searchParams} />
      </div>
    </div>
  )
}
