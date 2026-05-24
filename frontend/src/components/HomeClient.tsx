'use client'

import { DownloadCloud, FolderGit2, Terminal, BookOpen } from "lucide-react"
import Link from "next/link"
import ExperienceTimeline from "./ExperienceTimeline"
import { motion, Variants } from "framer-motion"
import { SiteProfile } from "../models/types"
import { useState, useEffect } from "react"
import BootSplash from "./BootSplash"

export default function HomeClient({ profile }: { profile: SiteProfile }) {
  const [splashMode, setSplashMode] = useState<'LOADING' | 'FULL' | 'MICRO' | 'NONE'>('LOADING')

  useEffect(() => {
    // Accessibility: Reduce motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setSplashMode('NONE')
      return
    }

    try {
      const lastShown = localStorage.getItem('portfolio_boot_last_shown')
      const now = Date.now()
      const BOOT_EXPIRATION_DAYS = 14
      const BOOT_EXPIRATION_MS = BOOT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000

      if (!lastShown || (now - parseInt(lastShown, 10)) > BOOT_EXPIRATION_MS) {
        localStorage.setItem('portfolio_boot_last_shown', now.toString())
        setSplashMode('FULL')
      } else {
        setSplashMode('MICRO')
      }
    } catch (e) {
      // LocalStorage failed (private mode, etc)
      setSplashMode('NONE')
    }
  }, [])

  // Hero Animation Variants
  const imgVariant: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.45, ease: "easeOut" } }
  }
  const bracketsVariant: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.25, duration: 0.4, ease: "easeOut" } }
  }
  const nameVariant: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.45, ease: "easeOut" } }
  }
  const sysLoadedVariant: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.45, duration: 0.35, ease: "easeOut" } }
  }
  const bioVariant: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.45, ease: "easeOut" } }
  }
  const focusVariant: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.75, duration: 0.45, ease: "easeOut" } }
  }
  const btnContainerVariant: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.9, staggerChildren: 0.1 } }
  }
  const btnVariant: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  // Capabilities Reveal Variants
  const capHeaderVariant: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
  }
  const capContainerVariant: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  }
  const capItemVariant: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  }

  if (splashMode === 'LOADING') {
    return <div className="min-h-[70vh] bg-[var(--background)]"></div>
  }

  return (
    <>
      {(splashMode === 'FULL' || splashMode === 'MICRO') && (
        <BootSplash mode={splashMode} onComplete={() => setSplashMode('NONE')} />
      )}

      {splashMode === 'NONE' && (
        <div className="flex flex-col items-start justify-center min-h-[70vh] max-w-4xl space-y-12">
          
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 w-full">
        {/* Geometric Avatar */}
        <motion.div 
          initial="hidden" animate="visible" variants={imgVariant} 
          className="shrink-0 p-2 border-2 border-neutral-200 dark:border-neutral-800 relative group"
        >
          {/* Corner Accents (Animated) */}
          <motion.div variants={bracketsVariant} className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-[6px] -left-[6px] w-2 h-2 border-t-2 border-l-2 border-[var(--color-terminal-green)] transition-all"></div>
            <div className="absolute -top-[6px] -right-[6px] w-2 h-2 border-t-2 border-r-2 border-[var(--color-terminal-green)] transition-all"></div>
            <div className="absolute -bottom-[6px] -left-[6px] w-2 h-2 border-b-2 border-l-2 border-[var(--color-terminal-green)] transition-all"></div>
            <div className="absolute -bottom-[6px] -right-[6px] w-2 h-2 border-b-2 border-r-2 border-[var(--color-terminal-green)] transition-all"></div>
          </motion.div>
          
          <img 
            src={profile.avatarUrl || '/placeholder.png'} 
            alt={profile.name} 
            className="w-48 h-48 md:w-64 md:h-64 object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
          />
        </motion.div>

        {/* Hero Copy */}
        <div className="flex flex-col space-y-6 flex-1 pt-2">
          <div>
            <motion.h1 initial="hidden" animate="visible" variants={nameVariant} className="text-6xl md:text-[5.5rem] font-bold tracking-tighter text-neutral-900 dark:text-neutral-100 uppercase leading-none">
              {profile.name}
            </motion.h1>
            <motion.h2 initial="hidden" animate="visible" variants={sysLoadedVariant} className="text-lg md:text-xl font-mono text-[var(--color-terminal-green)] mt-4 flex items-center">
              &gt; SYSTEM_PROFILE_LOADED<span className="animate-cursor-blink ml-1">|</span>
            </motion.h2>
          </div>

          <div className="space-y-4">
            <motion.div initial="hidden" animate="visible" variants={bioVariant} className="text-neutral-700 dark:text-neutral-300 font-sans text-base leading-relaxed whitespace-pre-line max-w-2xl">
              {profile.bio}
            </motion.div>
            {profile.currentFocus && (
              <motion.div initial="hidden" animate="visible" variants={focusVariant} className="text-neutral-500 font-mono text-sm">
                &gt; CURRENT_FOCUS: {profile.currentFocus}
              </motion.div>
            )}
          </div>

          <motion.div initial="hidden" animate="visible" variants={btnContainerVariant} className="flex flex-wrap items-center gap-4 pt-4">
            <motion.div variants={btnVariant}>
              <Link 
                href="/projects"
                className="flex items-center gap-2 bg-[var(--color-terminal-green)] text-black font-mono font-bold py-3 px-6 rounded transition-all hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] active:scale-[0.98]"
              >
                <FolderGit2 className="w-5 h-5" />
                <span>OPEN_PROJECT_MODULES</span>
              </Link>
            </motion.div>

            <motion.div variants={btnVariant}>
              <Link 
                href="/blog"
                className="group flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-[var(--color-terminal-green)]/10 hover:border-[var(--color-terminal-green)] hover:text-[var(--color-terminal-green)] transition-all"
              >
                <BookOpen className="w-5 h-5 transition-transform group-hover:translate-x-[2px]" />
                <span>READ_TRANSMISSION_LOGS</span>
              </Link>
            </motion.div>

            <motion.div variants={btnVariant}>
              <a 
                href="#experience"
                className="group flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-[var(--color-terminal-green)]/10 hover:border-[var(--color-terminal-green)] hover:text-[var(--color-terminal-green)] transition-all"
              >
                <Terminal className="w-5 h-5 transition-transform group-hover:translate-x-[2px]" />
                <span>ACCESS_CREDENTIALS</span>
              </a>
            </motion.div>

            {profile.resumeUrl && (
              <motion.div variants={btnVariant}>
                <a 
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 bg-white dark:bg-[#111315] border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono font-bold py-3 px-6 rounded hover:bg-neutral-200 dark:bg-neutral-800 hover:border-neutral-500 hover:text-neutral-900 dark:text-white transition-all"
                >
                  <DownloadCloud className="w-5 h-5 text-neutral-600 dark:text-neutral-400 transition-transform group-hover:translate-x-[2px]" />
                  <span>DOWNLOAD_SYS_ARCH</span>
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Capabilities Strip */}
      {profile.systemCapabilities && profile.systemCapabilities.length > 0 && (
        <div className="w-full pt-8">
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={capHeaderVariant}
            className="text-xl font-bold font-mono tracking-widest text-neutral-900 dark:text-neutral-100 mb-6 uppercase flex items-center gap-4"
          >
            <span className="text-[var(--color-terminal-green)]">/</span>
            SYSTEM_CAPABILITIES
          </motion.h2>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={capContainerVariant}
            className="flex flex-wrap gap-4"
          >
            {profile.systemCapabilities.map(cap => (
              <motion.div 
                variants={capItemVariant}
                key={cap} 
                className="font-mono text-xs uppercase bg-[#111315] text-[var(--color-terminal-green)] border border-neutral-800 px-4 py-2 tracking-wider transition-all hover:-translate-y-[1px] hover:border-[var(--color-terminal-green)] hover:text-white hover:bg-[var(--color-terminal-green)]/10 cursor-default"
              >
                [ {cap} ]
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Experience Timeline */}
      <div id="experience" className="w-full pt-16 mt-16 border-t border-neutral-200 dark:border-neutral-800 scroll-mt-8">
        <ExperienceTimeline 
          experiences={profile.experiences || []} 
          educations={profile.educations || []} 
        />
      </div>

        </div>
      )}
    </>
  )
}
