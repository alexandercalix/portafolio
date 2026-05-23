'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'
import { trackEvent } from '@/src/utils/analytics'

interface ContentControlsProps {
  uniqueTags: string[];
}

export default function ContentControls({ uniqueTags }: ContentControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentView = searchParams.get('view') || 'grid'
  const currentTag = searchParams.get('tag')

  const setView = (view: 'grid' | 'list') => {
    trackEvent({ action: 'view_toggled', category: 'Preferences', label: view })
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleTag = (tag: string) => {
    trackEvent({ action: 'filter_applied', category: 'Engagement', label: tag })
    const params = new URLSearchParams(searchParams.toString())
    if (currentTag === tag) {
      params.delete('tag')
    } else {
      params.set('tag', tag)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
      
      {/* Scrollable Tags */}
      <div className="flex-1 overflow-x-auto w-full no-scrollbar">
        <div className="flex gap-2 min-w-max pb-2 md:pb-0">
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.delete('tag')
              router.push(`${pathname}?${params.toString()}`)
            }}
            className={`font-mono text-[10px] uppercase px-3 py-1.5 border transition-colors ${
              !currentTag 
                ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black border-neutral-800 dark:border-neutral-200' 
                : 'bg-white dark:bg-[#111315] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-[var(--color-terminal-green)]'
            }`}
          >
            ALL
          </button>
          
          {uniqueTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`font-mono text-[10px] uppercase px-3 py-1.5 border transition-colors flex items-center gap-1 ${
                currentTag === tag
                  ? 'bg-[var(--color-terminal-green)]/10 text-[var(--color-terminal-green)] border-[var(--color-terminal-green)]'
                  : 'bg-white dark:bg-[#111315] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-[var(--color-terminal-green)]/50'
              }`}
            >
              <span className="opacity-50">#</span>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 shrink-0 bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 p-1">
        <button
          onClick={() => setView('grid')}
          className={`p-1.5 transition-colors ${
            currentView === 'grid' 
              ? 'bg-neutral-100 dark:bg-[#1a1d21] text-neutral-900 dark:text-neutral-100' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
          aria-label="Grid View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setView('list')}
          className={`p-1.5 transition-colors ${
            currentView === 'list' 
              ? 'bg-neutral-100 dark:bg-[#1a1d21] text-neutral-900 dark:text-neutral-100' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
          aria-label="List View"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}
