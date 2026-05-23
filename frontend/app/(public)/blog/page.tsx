import { getBlogPosts } from "@/src/lib/api"
import ContentControls from "@/src/components/ContentControls"
import ContentDisplay from "@/src/components/ContentDisplay"
import { normalizeBlogPosts } from "@/src/types/content"

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
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
          Transmission Logs
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 font-mono text-sm max-w-2xl">
          Technical dispatches covering system architecture, C# .NET performance, and full-stack engineering.
        </p>
      </div>

      <div className="space-y-6">
        <ContentControls uniqueTags={uniqueTags} />
        <ContentDisplay items={normalizedItems} searchParams={searchParams} />
      </div>
    </div>
  )
}
