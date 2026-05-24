'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootSplashProps {
  mode: 'FULL' | 'MICRO'
  onComplete: () => void
}

export default function BootSplash({ mode, onComplete }: BootSplashProps) {
  const [isReadyToUnmount, setIsReadyToUnmount] = useState(false)

  useEffect(() => {
    // Schedule the exit animation
    const timeout = setTimeout(() => {
      setIsReadyToUnmount(true)
    }, mode === 'FULL' ? 1800 : 500)

    return () => clearTimeout(timeout)
  }, [mode])

  const fullLines = [
    { text: "> SYSTEM_BOOT_SEQUENCE", delay: 0 },
    { text: "[OK] INITIALIZING_INTERFACE", delay: 0.2 },
    { text: "[OK] LOADING_PROFILE_MODULE", delay: 0.4 },
    { text: "[OK] SYNCING_PROJECT_REGISTRY", delay: 0.6 },
    { text: "[OK] CHECKING_CLOUD_SERVICES", delay: 0.8 },
    { text: "[OK] RESPONSE_RECEIVED", delay: 1.0 },
    { text: "> SYSTEM_READY", delay: 1.2 }
  ]

  const microLines = [
    { text: "> SESSION_RESTORED", delay: 0 },
    { text: "> SYSTEM_ONLINE", delay: 0.15 }
  ]

  const lines = mode === 'FULL' ? fullLines : microLines

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!isReadyToUnmount && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-start justify-end pb-24 md:pb-48 bg-[#0a0a0c] dark:bg-[#0a0a0c] px-6 sm:px-12 md:px-24"
        >
          <div className="font-mono text-sm sm:text-base md:text-lg text-[var(--color-terminal-green)] flex flex-col space-y-2">
            {lines.map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: line.delay, duration: 0 }}
              >
                {line.text}
              </motion.div>
            ))}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: lines[lines.length - 1].delay + 0.1, duration: 0 }}
               className="animate-cursor-blink w-fit"
            >
              _
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
