import { getBlogPosts } from "@/src/lib/api"
import ContentControls from "@/src/components/ContentControls"
import ContentDisplay from "@/src/components/ContentDisplay"
import AnimatedPageHeader from "@/src/components/AnimatedPageHeader"
import { normalizeBlogPosts } from "@/src/types/content"
import AnalyticsTracker from "@/src/components/AnalyticsTracker"

export const revalidate = 60

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function PublicBlogPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  
  // Fetch only published blog posts
  const response = await getBlogPosts(1, 50, undefined, false)
  const posts = response.data || []
  
  const normalizedItems = normalizeBlogPosts(posts)

  // Compute unique tags from the blog posts
  const uniqueTags = Array.from(new Set(normalizedItems.flatMap(item => item.tags))).sort()

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <AnalyticsTracker action="blog_index_viewed" category="Engagement" label="Blog List" />
      <AnimatedPageHeader 
        title="Transmission Logs"
        subtitle="Technical dispatches covering system architecture, C# .NET performance, and full-stack engineering."
        statusLine={`STATUS: ${posts.length} LOGS ONLINE`}
      />

      <div className="space-y-6">
        <ContentControls uniqueTags={uniqueTags} />
        <ContentDisplay items={normalizedItems} searchParams={searchParams} />
      </div>
    </div>
  )
}
