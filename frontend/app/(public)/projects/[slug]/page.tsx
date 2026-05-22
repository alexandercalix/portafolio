import { getProjectBySlug } from "@/src/lib/api"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { ExternalLink, GitBranch, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Import highlight.js styles for code blocks
import 'highlight.js/styles/atom-one-dark.css'

export const revalidate = 60

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug)

  if (!project || !project.isPublished) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto space-y-12 pb-24">
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
          <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Markdown Content */}
      <div className="prose dark:prose-invert prose-neutral max-w-none prose-pre:bg-[#111315] prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-pre:rounded-none prose-a:text-[var(--color-terminal-green)] hover:prose-a:text-green-400 prose-headings:font-bold prose-headings:tracking-tight prose-img:border prose-img:border-neutral-200 dark:prose-img:border-neutral-800">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeHighlight]}
        >
          {project.description}
        </ReactMarkdown>
      </div>

      {/* Image Gallery */}
      {project.images && project.images.filter(url => url !== project.thumbnailUrl).length > 0 && (
        <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800 space-y-8">
          <h3 className="font-mono text-sm text-neutral-500 uppercase">&gt; ADDITIONAL_ASSETS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.images.filter(url => url !== project.thumbnailUrl).map((url, idx) => (
              <div key={idx} className="aspect-video border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315]">
                <img src={url} alt={`Asset ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
