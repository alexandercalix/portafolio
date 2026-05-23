'use client'

import { Experience, Education } from '@/src/models/types'
import { format } from 'date-fns'
import { useState } from 'react'
import ExperienceModal from './ExperienceModal'

interface ExperienceTimelineProps {
  experiences: Experience[]
  educations: Education[]
}

interface GroupedExperience {
  company: string
  roles: Experience[]
}

export default function ExperienceTimeline({ experiences, educations }: ExperienceTimelineProps) {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)

  // Group experiences by Company
  const groupedExperiences: GroupedExperience[] = []
  
  // Sort experiences ascending by sortOrder before grouping
  const sortedExperiences = [...experiences].sort((a, b) => a.sortOrder - b.sortOrder)

  sortedExperiences.forEach(exp => {
    const existingGroup = groupedExperiences.find(g => g.company === exp.company)
    if (existingGroup) {
      existingGroup.roles.push(exp)
    } else {
      groupedExperiences.push({ company: exp.company, roles: [exp] })
    }
  })

  const sortedEducations = [...educations].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-16">
      
      {/* Experience Track */}
      {groupedExperiences.length > 0 && (
        <section>
          <h2 className="text-xl font-bold font-mono tracking-widest text-neutral-900 dark:text-neutral-100 mb-8 uppercase flex items-center gap-4">
            <span className="text-[var(--color-terminal-green)]">/</span>
            EXPERIENCE_LOG
          </h2>
          <div className="relative border-l border-neutral-300 dark:border-neutral-800 ml-4 md:ml-6 space-y-12 pb-8">
            
            {groupedExperiences.map((group, groupIdx) => (
              <div key={groupIdx} className="relative pl-8 md:pl-12">
                {/* Company Node (Always hollow square) */}
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-white dark:bg-[#0a0a0c] border border-neutral-400 dark:border-neutral-600"></div>
                
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">{group.company}</h3>

                <div className="space-y-8">
                  {group.roles.map((role, roleIdx) => (
                    <div 
                      key={role.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedExperience(role)}
                    >
                      {/* Sub-branch line connecting company to roles if there are multiple */}
                      {group.roles.length > 1 && (
                        <div className="absolute -left-8 md:-left-12 top-4 w-6 md:w-8 h-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
                      )}

                      {/* Role Node */}
                      <div className={`absolute -left-[9px] top-2.5 w-2 h-2 ${
                        role.isCurrent 
                          ? 'bg-[var(--color-terminal-green)] animate-pulse shadow-[0_0_8px_var(--color-terminal-green)]' 
                          : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}></div>

                      <div className="bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 p-5 transition-colors group-hover:border-[var(--color-terminal-green)] group-hover:bg-neutral-50 dark:group-hover:bg-[#15181a]">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                          <h4 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{role.jobTitle}</h4>
                          <span className="font-mono text-xs text-neutral-500 whitespace-nowrap">
                            [ {format(new Date(role.startDate), 'yyyy.MM')} - {role.isCurrent ? 'PRESENT' : (role.endDate ? format(new Date(role.endDate), 'yyyy.MM') : 'UNKNOWN')} ]
                          </span>
                        </div>
                        
                        {/* Snippet (truncating full description) */}
                        {role.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                            {role.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-4">
                          <span className="font-mono text-xs text-[var(--color-terminal-green)] hidden md:inline-block mr-2">VIEW_PAYLOAD</span>
                          {role.technologies?.slice(0, 3).map((tech, idx) => (
                            <span key={idx} className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 text-neutral-500">
                              {tech}
                            </span>
                          ))}
                          {role.technologies && role.technologies.length > 3 && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 text-neutral-500">+{role.technologies.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Track */}
      {sortedEducations.length > 0 && (
        <section>
          <h2 className="text-xl font-bold font-mono tracking-widest text-neutral-900 dark:text-neutral-100 mb-8 uppercase flex items-center gap-4">
            <span className="text-[var(--color-terminal-green)]">/</span>
            CREDENTIALS_LOG
          </h2>
          <div className="relative border-l border-neutral-300 dark:border-neutral-800 ml-4 md:ml-6 space-y-8 pb-8">
            
            {sortedEducations.map((edu, idx) => (
              <div key={edu.id} className="relative pl-8 md:pl-12">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-white dark:bg-[#0a0a0c] border border-neutral-400 dark:border-neutral-600"></div>
                
                <div className="bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <h4 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">{edu.degreeOrCertificate}</h4>
                    <span className="font-mono text-xs text-neutral-500 whitespace-nowrap">
                      [ {format(new Date(edu.dateObtained), 'yyyy.MM')} ]
                    </span>
                  </div>
                  <p className="font-mono text-[var(--color-terminal-green)] text-sm mb-3">{edu.institution}</p>
                  
                  {edu.focusLine && (
                    <p className="font-mono text-xs text-neutral-500 mb-4">
                      {edu.focusLine}
                    </p>
                  )}

                  {edu.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            ))}

          </div>
        </section>
      )}

      {/* Telemetry Modal */}
      <ExperienceModal 
        experience={selectedExperience} 
        onClose={() => setSelectedExperience(null)} 
      />

    </div>
  )
}
