import Link from "next/link"
import { getProjects } from "@/src/lib/api/project"
import { getBlogPosts } from "@/src/lib/api/blog"

export default async function FeaturedSidebar() {
  const [projectsRes, blogsRes] = await Promise.all([
    getProjects(1, 100).catch(() => ({ data: [] })),
    getBlogPosts(1, 100).catch(() => ({ data: [] }))
  ])

  let featuredProjects = projectsRes.data.filter(p => p.isFeatured)
  let featuredBlogs = blogsRes.data.filter(b => b.isFeatured)

  const isProjectsFallback = featuredProjects.length === 0
  const isBlogsFallback = featuredBlogs.length === 0

  if (isProjectsFallback) featuredProjects = projectsRes.data.slice(0, 4)
  if (isBlogsFallback) featuredBlogs = blogsRes.data.slice(0, 4)

  if (featuredProjects.length === 0 && featuredBlogs.length === 0) return null

  return (
    <aside className="w-full xl:w-[350px] shrink-0 border-t xl:border-t-0 xl:border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-[#0a0a0c]/30">
      <div className="sticky top-16 h-max xl:h-[calc(100vh-4rem)] p-6 xl:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-12">
        
        {/* Projects Section */}
        {featuredProjects.length > 0 && (
          <div className="flex flex-col gap-6">
            <h3 className="font-mono text-xs text-[var(--color-terminal-green)] uppercase tracking-widest flex items-center gap-2 shrink-0">
              <span>/</span> {isProjectsFallback ? 'LATEST_MODULES' : 'FEATURED_MODULES'}
            </h3>
            <div className="flex xl:flex-col gap-6 overflow-x-auto xl:overflow-x-visible pb-4 xl:pb-0 snap-x snap-mandatory hide-scrollbar">
              {featuredProjects.map(p => (
                <Link 
                  key={p.id} 
                  href={`/projects/${p.slug}`}
                  className="group flex flex-col w-72 xl:w-full shrink-0 snap-start bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 transition-all hover:-translate-y-[2px] hover:border-[var(--color-terminal-green)] hover:shadow-[0_4px_20px_rgba(0,255,65,0.05)]"
                >
                  <div className="aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-[#1a1d21] relative border-b border-neutral-200 dark:border-neutral-800">
                    {p.thumbnailUrl ? (
                      <img 
                        src={p.thumbnailUrl} 
                        alt={p.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain filter grayscale group-hover:grayscale-[0.2] group-hover:brightness-110 transition-all duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-neutral-600 dark:text-neutral-400">NO_PREVIEW</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--color-terminal-green)] transition-colors line-clamp-2">{p.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blogs Section */}
        {featuredBlogs.length > 0 && (
          <div className="flex flex-col gap-6">
            <h3 className="font-mono text-xs text-[var(--color-terminal-green)] uppercase tracking-widest flex items-center gap-2 shrink-0">
              <span>/</span> {isBlogsFallback ? 'LATEST_LOGS' : 'FEATURED_LOGS'}
            </h3>
            <div className="flex xl:flex-col gap-6 overflow-x-auto xl:overflow-x-visible pb-4 xl:pb-0 snap-x snap-mandatory hide-scrollbar">
              {featuredBlogs.map(b => (
                <Link 
                  key={b.id} 
                  href={`/blog/${b.slug}`}
                  className="group flex flex-col w-72 xl:w-full shrink-0 snap-start bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 transition-all hover:-translate-y-[2px] hover:border-[var(--color-terminal-green)] hover:shadow-[0_4px_20px_rgba(0,255,65,0.05)]"
                >
                  <div className="aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-[#1a1d21] relative border-b border-neutral-200 dark:border-neutral-800">
                    {b.thumbnailUrl ? (
                      <img 
                        src={b.thumbnailUrl} 
                        alt={b.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain filter grayscale group-hover:grayscale-[0.2] group-hover:brightness-110 transition-all duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-neutral-600 dark:text-neutral-400">NO_PREVIEW</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--color-terminal-green)] transition-colors line-clamp-2">{b.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  )
}
