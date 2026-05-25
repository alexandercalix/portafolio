import { getProjectBySlug } from "@/src/lib/api/project"
import { getProjects } from "@/src/lib/api/project"
import { getGlobalProfile } from "@/src/lib/api/profile"
import { notFound } from "next/navigation"
import { ExternalLink, GitBranch, ArrowLeft } from "lucide-react"
import Link from "next/link"


// Import highlight.js styles for code blocks
import 'highlight.js/styles/atom-one-dark.css'

export const revalidate = 60

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug)
  const profile = await getGlobalProfile()

  if (!project || !project.isPublished) {
    notFound()
  }

  return (
    <article className="space-y-12 pb-24">
      {/* Header */}
      <div className="space-y-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-neutral-500 hover:text-[var(--color-terminal-green)] transition-colors font-mono text-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN_TO_REGISTRY</span>
        </Link>
        
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase leading-tight">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap gap-3">
            {project.technologies?.map((tech, idx) => (
              <span key={idx} className="font-mono text-xs uppercase bg-neutral-100 dark:bg-[#1a1d21] text-[var(--color-terminal-green)] border border-[var(--color-terminal-green)]/30 px-3 py-1">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {project.liveUrl && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[var(--color-terminal-green)] text-black font-mono font-bold py-2 px-6 rounded transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>ACCESS_LIVE_SYSTEM</span>
              </a>
            )}
            
            {project.repositoryUrl && (
              <a 
                href={project.repositoryUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-2 px-6 rounded hover:bg-neutral-200 dark:bg-neutral-800 hover:text-neutral-900 dark:text-white transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                <span>SOURCE_CODE</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Cover Image */}
      {project.thumbnailUrl && (
        <div className="w-full aspect-video border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315]">
          <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-contain" />
        </div>
      )}

      {/* HTML Content */}
      <div 
        className="prose prose-lg dark:prose-invert prose-neutral max-w-none prose-p:leading-relaxed prose-p:mb-6 prose-headings:font-mono prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--color-terminal-green)] hover:prose-a:text-green-400 prose-img:border prose-img:border-neutral-200 dark:prose-img:border-neutral-800 prose-pre:bg-neutral-900 dark:prose-pre:bg-[#0a0a0c] prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-pre:rounded prose-pre:overflow-x-auto prose-code:bg-neutral-100 dark:prose-code:bg-[#1a1d21] prose-code:text-[var(--color-terminal-green)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-ul:list-disc prose-ul:ml-4 prose-ol:list-decimal prose-ol:ml-4 prose-li:my-1"
        dangerouslySetInnerHTML={{ __html: project.description || '' }}
      />

      {/* Author Block */}
      <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-4 bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 p-6">
          {project.author?.avatarUrl || profile?.avatarUrl ? (
            <img 
              src={project.author?.avatarUrl || profile?.avatarUrl} 
              alt={project.author?.name || profile?.name || 'Author'} 
              className="w-16 h-16 rounded-full border border-neutral-200 dark:border-neutral-800 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-mono text-neutral-500 text-xl font-bold">
              {(project.author?.name?.[0] || profile?.name?.[0] || 'S').toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{project.author?.name || profile?.name || 'System Administrator'}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{profile?.authorTitle || profile?.headline || 'Lead Engineer'}</p>
            {profile?.authorBio && (
              <p className="text-xs text-neutral-500 mt-1">{profile.authorBio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {project.images && project.images.filter(url => url !== project.thumbnailUrl).length > 0 && (
        <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800 space-y-8">
          <h3 className="font-mono text-sm text-neutral-500 uppercase">&gt; ADDITIONAL_ASSETS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.images.filter(url => url !== project.thumbnailUrl).map((url, idx) => (
              <div key={idx} className="aspect-video border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315]">
                <img src={url} alt={`Asset ${idx}`} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
      </article>
  )
}
