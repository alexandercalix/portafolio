'use client'

import { DownloadCloud, FolderGit2, Terminal, BookOpen } from "lucide-react"
import Link from "next/link"
import ExperienceTimeline from "./ExperienceTimeline"
import { motion } from "framer-motion"
import { SiteProfile } from "../models/types"

export default function HomeClient({ profile }: { profile: SiteProfile }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  const fastFade = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-start justify-center min-h-[70vh] max-w-4xl space-y-12"
    >
      
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 w-full">
        {/* Geometric Avatar */}
        <motion.div variants={fastFade} className="shrink-0 p-2 border-2 border-neutral-200 dark:border-neutral-800 relative group">
          {/* Corner Accents */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[var(--color-terminal-green)] transition-all group-hover:-top-2 group-hover:-left-2"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[var(--color-terminal-green)] transition-all group-hover:-top-2 group-hover:-right-2"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[var(--color-terminal-green)] transition-all group-hover:-bottom-2 group-hover:-left-2"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[var(--color-terminal-green)] transition-all group-hover:-bottom-2 group-hover:-right-2"></div>
          
          <img 
            src={profile.avatarUrl || '/placeholder.png'} 
            alt={profile.name} 
            className="w-48 h-48 md:w-64 md:h-64 object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
          />
        </motion.div>

        {/* Hero Copy */}
        <div className="flex flex-col space-y-6 flex-1 pt-2">
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl md:text-[5.5rem] font-bold tracking-tighter text-neutral-900 dark:text-neutral-100 uppercase leading-none">
              {profile.name}
            </h1>
            <h2 className="text-lg md:text-xl font-mono text-[var(--color-terminal-green)] mt-4">
              &gt; {profile.headline}
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="text-neutral-700 dark:text-neutral-300 font-sans text-base leading-relaxed whitespace-pre-line max-w-2xl">
              {profile.bio}
            </div>
            {profile.currentFocus && (
              <div className="text-neutral-500 font-mono text-sm">
                &gt; CURRENT_FOCUS: {profile.currentFocus}
              </div>
            )}
          </motion.div>

          <motion.div variants={containerVariants} className="flex flex-wrap items-center gap-4 pt-4">
            <motion.div variants={itemVariants}>
              <Link 
                href="/projects"
                className="flex items-center gap-2 bg-[var(--color-terminal-green)] text-black font-mono font-bold py-3 px-6 rounded transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FolderGit2 className="w-5 h-5" />
                <span>OPEN_PROJECT_MODULES</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link 
                href="/blog"
                className="flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-[var(--color-terminal-green)]/10 hover:border-[var(--color-terminal-green)] hover:text-[var(--color-terminal-green)] transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span>READ_TRANSMISSION_LOGS</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <a 
                href="#experience"
                className="flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-[var(--color-terminal-green)]/10 hover:border-[var(--color-terminal-green)] hover:text-[var(--color-terminal-green)] transition-all"
              >
                <Terminal className="w-5 h-5" />
                <span>ACCESS_CREDENTIALS</span>
              </a>
            </motion.div>

            {profile.resumeUrl && (
              <motion.div variants={itemVariants}>
                <a 
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-neutral-200 dark:bg-neutral-800 hover:text-neutral-900 dark:text-white transition-colors"
                >
                  <DownloadCloud className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span>DOWNLOAD_SYS_ARCH</span>
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Capabilities Strip */}
      {profile.systemCapabilities && profile.systemCapabilities.length > 0 && (
        <motion.div variants={itemVariants} className="w-full pt-8">
          <h2 className="text-xl font-bold font-mono tracking-widest text-neutral-900 dark:text-neutral-100 mb-6 uppercase flex items-center gap-4">
            <span className="text-[var(--color-terminal-green)]">/</span>
            SYSTEM_CAPABILITIES
          </h2>
          <div className="flex flex-wrap gap-4">
            {profile.systemCapabilities.map(cap => (
              <div key={cap} className="font-mono text-xs uppercase bg-[#111315] text-[var(--color-terminal-green)] border border-neutral-800 px-4 py-2 tracking-wider">
                [ {cap} ]
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Experience Timeline */}
      <motion.div variants={itemVariants} id="experience" className="w-full pt-16 mt-16 border-t border-neutral-200 dark:border-neutral-800 scroll-mt-8">
        <ExperienceTimeline 
          experiences={profile.experiences || []} 
          educations={profile.educations || []} 
        />
      </motion.div>

    </motion.div>
  )
}
