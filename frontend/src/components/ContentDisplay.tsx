'use client'

import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { NormalizedContent } from '../types/content'
import { generateCleanExcerpt } from '../utils/markdownUtils'
import { Calendar, Tag } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

interface ContentDisplayProps {
  items: NormalizedContent[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ContentDisplay({ items, searchParams }: ContentDisplayProps) {
  const currentView = searchParams.view === 'list' ? 'list' : 'grid'
  
  const selectedTags = searchParams.tag 
    ? (Array.isArray(searchParams.tag) ? searchParams.tag : [searchParams.tag])
    : []

  // 1. Filter by tag (OR logic - item has any of the selected tags)
  let filteredItems = items
  if (selectedTags.length > 0) {
    filteredItems = filteredItems.filter(item => 
      selectedTags.some(selectedTag => 
        item.tags.some(itemTag => itemTag.toLowerCase() === selectedTag.toLowerCase())
      )
    )
  }

  // 2. Sort chronologically descending
  filteredItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  // Framer Motion Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  if (filteredItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800"
      >
        <span className="font-mono text-neutral-600 dark:text-neutral-400">NO_RECORDS_MATCH_CRITERIA</span>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {currentView === 'list' ? (
        <motion.div 
          key={`list-${selectedTags.join('-') || 'all'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col gap-2"
        >
          {filteredItems.map(item => {
            const href = item.type === 'blog' ? `/blog/${item.slug}` : `/projects/${item.slug}`
            return (
              <motion.div variants={itemVariants} key={item.id}>
                <Link 
                  href={href}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 transition-all hover:-translate-y-[2px] hover:border-[var(--color-terminal-green)] hover:bg-neutral-50 dark:hover:bg-[#15181a] hover:shadow-[0_4px_20px_rgba(0,255,65,0.03)]"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--color-terminal-green)] transition-colors truncate">
                      {item.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 font-mono text-[10px] text-neutral-600 dark:text-neutral-400">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.publishedAt), "yyyy.MM.dd")}
                      </span>
                      {item.tags.length > 0 && (
                        <span className="flex items-center gap-2 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 truncate uppercase">
                          <Tag className="w-3 h-3" />
                          {item.tags.slice(0, 3).map(t => t.replace(/^#+/, '')).join(' • ')}
                          {item.tags.length > 3 ? ' • ...' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-neutral-400 group-hover:text-[var(--color-terminal-green)] shrink-0 hidden sm:block transition-all group-hover:translate-x-1">
                    {item.type === 'blog' ? 'READ_LOG ->' : 'OPEN_MODULE ->'}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <motion.div 
          key={`grid-${selectedTags.join('-') || 'all'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {filteredItems.map(item => {
            const href = item.type === 'blog' ? `/blog/${item.slug}` : `/projects/${item.slug}`
            return (
              <motion.div variants={itemVariants} key={item.id} className="h-full">
                <Link 
                  href={href}
                  className="group flex flex-col h-full bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--color-terminal-green)] hover:shadow-[0_4px_20px_rgba(0,255,65,0.05)]"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-[#1a1d21] relative border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                    {item.thumbnailUrl ? (
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain filter grayscale group-hover:grayscale-[0.2] group-hover:brightness-110 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center font-mono text-[10px] text-neutral-600 dark:text-neutral-400 bg-neutral-200 dark:bg-[#0a0a0c] border border-neutral-300 dark:border-neutral-800/50 text-center p-4">
                        <span className="text-[var(--color-terminal-green)]/70 mb-2">[{item.type === 'project' ? 'PROJECT' : 'TRANSMISSION'}]</span>
                        {item.type === 'project' ? 'MODULE_PREVIEW_PENDING' : 'TRANSMISSION_PREVIEW_PENDING'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[10px] text-[var(--color-terminal-green)]">
                        {format(new Date(item.publishedAt), "yyyy.MM.dd")}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-600 dark:text-neutral-400 uppercase">
                        {item.type === 'blog' ? 'LOG' : 'MODULE'}
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
                        <span key={idx} className="font-mono text-[10px] uppercase bg-neutral-100 dark:bg-[#1a1d21] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 px-2 py-1 transition-colors group-hover:border-[var(--color-terminal-green)]/30 group-hover:text-[var(--color-terminal-green)]">
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
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
