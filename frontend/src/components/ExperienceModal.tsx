'use client'

import { Experience } from '@/src/models/types'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { format } from 'date-fns'

interface ExperienceModalProps {
  experience: Experience | null
  onClose: () => void
}

export default function ExperienceModal({ experience, onClose }: ExperienceModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!experience) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-neutral-100 dark:bg-[#0a0a0c] border-b border-neutral-200 dark:border-neutral-800 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            <span className="ml-2 font-mono text-xs text-neutral-600 dark:text-neutral-400 tracking-wider hidden sm:block">
              SYS_PROC // {experience.id.split('-')[0].toUpperCase()}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-600 dark:text-neutral-400 hover:text-[var(--color-terminal-green)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payload Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{experience.jobTitle}</h2>
            <p className="font-mono text-[var(--color-terminal-green)] text-sm">{experience.company}</p>
            <p className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
              [ {format(new Date(experience.startDate), 'MMM yyyy').toUpperCase()} - {experience.isCurrent ? 'PRESENT' : (experience.endDate ? format(new Date(experience.endDate), 'MMM yyyy').toUpperCase() : 'UNKNOWN')} ]
            </p>
          </div>

          <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-6">
            <h3 className="font-mono text-xs text-neutral-600 dark:text-neutral-400 mb-4">&gt; EXECUTION_LOG</h3>
            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed text-sm">
              {experience.description || 'No description provided.'}
            </p>
          </div>

          {experience.technologies && experience.technologies.length > 0 && (
            <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-6">
              <h3 className="font-mono text-xs text-neutral-600 dark:text-neutral-400 mb-4">&gt; DEPLOYED_TECH_STACK</h3>
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="font-mono text-xs px-2 py-1 bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
