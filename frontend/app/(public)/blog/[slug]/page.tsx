import { getBlogPostBySlug } from "@/src/lib/api"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import ScrollReveal from "@/src/components/ScrollReveal"

// Import highlight.js styles for code blocks
import 'highlight.js/styles/atom-one-dark.css'

export const revalidate = 60

export default async function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug)

  if (!post || !post.isPublished) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <ScrollReveal className="space-y-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-neutral-500 hover:text-[var(--color-terminal-green)] transition-colors font-mono text-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN_TO_LOGS</span>
        </Link>
        
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-6">
          <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
            <div className="flex items-center gap-2 text-[var(--color-terminal-green)]">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.publishedAt || post.createdAt), "yyyy.MM.dd")}</span>
            </div>
            <span>//</span>
            <div className="flex gap-2">
              {post.tags?.map((tag, idx) => (
                <span key={idx} className="uppercase">#{tag}</span>
              ))}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
            {post.title}
          </h1>
        </div>
      </ScrollReveal>

      {/* Main Cover Image */}
      {post.thumbnailUrl && (
        <ScrollReveal delay={0.2} className="w-full aspect-video border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111315]">
          <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
        </ScrollReveal>
      )}

      {/* Markdown Content */}
      <ScrollReveal delay={0.3} className="prose dark:prose-invert prose-neutral max-w-none prose-headings:font-mono prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--color-terminal-green)] hover:prose-a:text-green-400 prose-img:border prose-img:border-neutral-200 dark:prose-img:border-neutral-800 prose-pre:bg-neutral-900 dark:prose-pre:bg-[#0a0a0c] prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-pre:rounded prose-pre:overflow-x-auto prose-code:bg-neutral-100 dark:prose-code:bg-[#1a1d21] prose-code:text-[var(--color-terminal-green)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-ul:list-disc prose-ul:ml-4 prose-ol:list-decimal prose-ol:ml-4 prose-li:my-1">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </ScrollReveal>

      {/* Footer Signature */}
      <ScrollReveal className="pt-12 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <span className="font-mono text-xs text-neutral-500">END_OF_TRANSMISSION</span>
        <span className="w-2 h-2 rounded-full bg-[var(--color-terminal-green)] animate-pulse"></span>
      </ScrollReveal>
    </article>
  )
}
