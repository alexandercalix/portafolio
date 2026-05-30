import { getProjects } from "@/src/lib/api"
import { FolderGit2 } from "lucide-react"
import ContentControls from "@/src/components/ContentControls"
import ContentDisplay from "@/src/components/ContentDisplay"
import AnimatedPageHeader from "@/src/components/AnimatedPageHeader"
import { normalizeProjects } from "@/src/types/content"
import AnalyticsTracker from "@/src/components/AnalyticsTracker"

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
      <AnalyticsTracker action="projects_index_viewed" category="Engagement" label="Projects List" />
      <AnimatedPageHeader 
        title={<><FolderGit2 className="w-10 h-10 text-[var(--color-terminal-green)]" /> Projects</>}
        subtitle="A registry of completed systems, architectural blueprints, and full-stack deployments."
        statusLine={`STATUS: ${projects.length} MODULES ONLINE`}
      />

      <div className="space-y-6">
        <ContentControls uniqueTags={uniqueTags} />
        <ContentDisplay items={normalizedItems} searchParams={searchParams} />
      </div>
    </div>
  )
}
