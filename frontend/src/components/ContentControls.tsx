'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { LayoutGrid, List, ChevronDown, Check, Filter, X } from 'lucide-react'
import { trackEvent } from '@/src/utils/analytics'
import { motion, AnimatePresence } from 'framer-motion'

interface ContentControlsProps {
  uniqueTags: string[];
}

export default function ContentControls({ uniqueTags }: ContentControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentView = searchParams.get('view') || 'grid'
  const currentTags = searchParams.getAll('tag')

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const setView = (view: 'grid' | 'list') => {
    trackEvent({ action: 'view_toggled', category: 'Preferences', label: view })
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleTag = (tag: string) => {
    trackEvent({ action: 'filter_applied', category: 'Engagement', label: tag })
    const params = new URLSearchParams(searchParams.toString())
    
    const existingTags = params.getAll('tag')
    params.delete('tag') // Clear all tags first
    
    if (existingTags.includes(tag)) {
      // Remove it
      existingTags.filter(t => t !== tag).forEach(t => params.append('tag', t))
    } else {
      // Add it
      [...existingTags, tag].forEach(t => params.append('tag', t))
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAllTags = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tag')
    router.push(`${pathname}?${params.toString()}`)
    setIsDropdownOpen(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8"
    >
      
      {/* Filters Dropdown */}
      <div className="relative z-10 w-full sm:w-auto" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 font-mono text-xs px-4 py-2.5 border transition-colors ${
            currentTags.length > 0
              ? 'bg-[var(--color-terminal-green)]/10 text-[var(--color-terminal-green)] border-[var(--color-terminal-green)]'
              : 'bg-white dark:bg-[#111315] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
          }`}
        >
          <div className="flex items-center gap-2 uppercase">
            <Filter className="w-3.5 h-3.5" />
            {currentTags.length > 0 ? `FILTER: ${currentTags.length} TAG${currentTags.length > 1 ? 'S' : ''}` : 'FILTER BY TAGS'}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 shadow-xl max-h-80 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                {uniqueTags.map(tag => {
                  const isSelected = currentTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-[#1a1d21] transition-colors group text-left"
                    >
                      <div className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-[var(--color-terminal-green)] border-[var(--color-terminal-green)]' 
                          : 'border-neutral-300 dark:border-neutral-700 group-hover:border-[var(--color-terminal-green)]/50'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                      </div>
                      <span className={`font-mono text-[10px] uppercase truncate ${isSelected ? 'text-[var(--color-terminal-green)] font-bold' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {tag}
                      </span>
                    </button>
                  )
                })}
              </div>
              
              {currentTags.length > 0 && (
                <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                  <button
                    onClick={clearAllTags}
                    className="w-full flex items-center justify-center gap-2 py-2 font-mono text-[10px] uppercase text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    CLEAR SELECTIONS
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 shrink-0 bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 p-1 w-full sm:w-auto justify-center">
        <button
          onClick={() => setView('grid')}
          className={`p-1.5 transition-colors flex-1 sm:flex-none flex justify-center ${
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
          className={`p-1.5 transition-colors flex-1 sm:flex-none flex justify-center ${
            currentView === 'list' 
              ? 'bg-neutral-100 dark:bg-[#1a1d21] text-neutral-900 dark:text-neutral-100' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
          aria-label="List View"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

    </motion.div>
  )
}
