import { getBlogPosts } from "@/src/lib/api"
import Link from "next/link"
import { format } from "date-fns"
import { generateCleanExcerpt } from "@/src/utils/markdownUtils"

export const revalidate = 60

export default async function PublicBlogPage() {
  // Fetch only published blog posts
  const response = await getBlogPosts(1, 50, undefined, false)
  const posts = response.data || []

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
          Transmission Logs
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 font-mono text-sm max-w-2xl">
          Technical dispatches covering system architecture, C# .NET performance, and full-stack engineering.
        </p>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="group block bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 hover:border-[var(--color-terminal-green)] transition-all duration-300 p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              
              {/* Optional Thumbnail */}
              {post.thumbnailUrl && (
                <div className="w-full md:w-48 aspect-video md:aspect-square shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <img 
                    src={post.thumbnailUrl} 
                    alt={post.title}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[var(--color-terminal-green)]">
                    {format(new Date(post.publishedAt || post.createdAt), "yyyy.MM.dd")}
                  </span>
                  <div className="flex gap-2">
                    {post.tags?.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="font-mono text-[10px] text-neutral-500 uppercase before:content-['#']">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--color-terminal-green)] transition-colors leading-tight">
                  {post.title}
                </h2>
                
                {/* Cleaned markdown excerpt */}
                <p className="text-neutral-600 dark:text-neutral-400 font-sans text-sm md:text-base line-clamp-3">
                  {generateCleanExcerpt(post.excerpt || post.content, 200)}
                </p>

                <div className="font-mono text-xs text-[var(--color-terminal-green)] flex items-center gap-2 pt-2">
                  <span>READ_TRANSMISSION</span>
                  <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
                </div>
              </div>

            </div>
          </Link>
        ))}
        
        {posts.length === 0 && (
          <div className="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800">
            <span className="font-mono text-neutral-500">NO_TRANSMISSIONS_FOUND</span>
          </div>
        )}
      </div>
    </div>
  )
}
