import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { NormalizedContent } from '../types/content'
import { generateCleanExcerpt } from '../utils/markdownUtils'
import { Calendar, Tag } from 'lucide-react'

interface ContentDisplayProps {
  items: NormalizedContent[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ContentDisplay({ items, searchParams }: ContentDisplayProps) {
  const currentView = searchParams.view === 'list' ? 'list' : 'grid'
  const currentTag = typeof searchParams.tag === 'string' ? searchParams.tag : null

  // 1. Filter by tag
  let filteredItems = items
  if (currentTag) {
    filteredItems = filteredItems.filter(item => 
      item.tags.some(tag => tag.toLowerCase() === currentTag.toLowerCase())
    )
  }

  // 2. Sort chronologically descending
  filteredItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800">
        <span className="font-mono text-neutral-500">NO_RECORDS_MATCH_CRITERIA</span>
      </div>
    )
  }

  if (currentView === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {filteredItems.map(item => {
          const href = item.type === 'blog' ? `/blog/${item.slug}` : `/projects/${item.slug}`
          return (
            <Link 
              key={item.id} 
              href={href}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 hover:border-[var(--color-terminal-green)] hover:bg-neutral-50 dark:hover:bg-[#15181a] cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--color-terminal-green)] transition-colors truncate">
                  {item.title}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-neutral-500">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(item.publishedAt), "yyyy.MM.dd")}
                  </span>
                  {item.tags.length > 0 && (
                    <span className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 truncate uppercase">
                      <Tag className="w-3 h-3" />
                      {item.tags.slice(0, 3).map(t => t.replace(/^#+/, '')).join(' • ')}
                      {item.tags.length > 3 ? ' • ...' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="font-mono text-[10px] text-neutral-400 group-hover:text-[var(--color-terminal-green)] shrink-0 hidden sm:block">
                OPEN_MODULE -&gt;
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  // Default Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {filteredItems.map(item => {
        const href = item.type === 'blog' ? `/blog/${item.slug}` : `/projects/${item.slug}`
        return (
          <Link 
            key={item.id} 
            href={href}
            className="group flex flex-col h-full bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 hover:border-[var(--color-terminal-green)] transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-[#1a1d21] relative border-b border-neutral-200 dark:border-neutral-800 shrink-0">
              {item.thumbnailUrl ? (
                <img 
                  src={item.thumbnailUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-neutral-500 bg-neutral-200 dark:bg-[#0a0a0c] border border-neutral-300 dark:border-neutral-800/50 text-center p-4">
                  {item.type === 'project' ? 'MODULE_PREVIEW_UNAVAILABLE' : 'TRANSMISSION_PREVIEW_UNAVAILABLE'}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-[var(--color-terminal-green)]">
                  {format(new Date(item.publishedAt), "yyyy.MM.dd")}
                </span>
                <span className="font-mono text-[10px] text-neutral-500 uppercase">
                  {item.type === 'blog' ? 'LOG' : 'PROJECT'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--color-terminal-green)] transition-colors line-clamp-2">
                {item.title}
              </h2>
              
              <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-sans text-sm line-clamp-3">
                {generateCleanExcerpt(item.markdownBody, 150)}
              </p>
              
              <div className="mt-auto pt-4 flex flex-wrap gap-2">
                {item.tags?.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="font-mono text-[10px] uppercase bg-neutral-100 dark:bg-[#1a1d21] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 px-2 py-1">
                    {tag.replace(/^#+/, '')}
                  </span>
                ))}
                {item.tags && item.tags.length > 3 && (
                  <span className="font-mono text-[10px] uppercase bg-neutral-100 dark:bg-[#1a1d21] text-[var(--color-terminal-green)] border border-[var(--color-terminal-green)]/30 px-2 py-1">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
