'use client'

import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedPageHeaderProps {
  title: ReactNode
  subtitle: string
  statusLine?: string
}

export default function AnimatedPageHeader({ title, subtitle, statusLine }: AnimatedPageHeaderProps) {
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  }

  const itemVariant: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="visible"
      className="border-b border-neutral-200 dark:border-neutral-800 pb-8"
    >
      <motion.h1 variants={itemVariant} className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase flex items-center gap-4">
        {title}
      </motion.h1>
      <motion.p variants={itemVariant} className="mt-4 text-neutral-600 dark:text-neutral-400 font-mono text-sm max-w-2xl">
        {subtitle}
      </motion.p>
      {statusLine && (
        <motion.div variants={itemVariant} className="text-[var(--color-terminal-green)] font-mono text-sm mt-2">
          &gt; {statusLine}
        </motion.div>
      )}
    </motion.div>
  )
}
