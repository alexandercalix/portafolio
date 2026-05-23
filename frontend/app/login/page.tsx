'use client'

import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Terminal } from "lucide-react"

export default function LoginPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.8,
        delayChildren: 0.2
      }
    }
  }

  const lineVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-xl flex flex-col items-center">
        
        {/* Terminal Window */}
        <div className="w-full bg-[#111315] border border-neutral-800 rounded-md p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle scanline effect overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
          
          <div className="flex items-center gap-2 mb-6 border-b border-neutral-800 pb-4">
            <Terminal className="w-5 h-5 text-neutral-500" />
            <h2 className="text-neutral-500 font-mono text-sm tracking-widest uppercase">
              System Access Intercept
            </h2>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="font-mono text-sm leading-relaxed"
          >
            <motion.p variants={lineVariants} className="text-[var(--color-terminal-green)]">
              &gt; INITIALIZING_SECURE_HANDSHAKE...
            </motion.p>
            
            <motion.p variants={lineVariants} className="text-amber-500 mt-2">
              &gt; WARNING: UNRECOGNIZED_USER_AGENT
            </motion.p>
            
            <motion.p variants={lineVariants} className="text-red-500 mt-2 font-bold">
              &gt; SYSTEM_QUERY: Are you trying to hack me?
            </motion.p>
            
            <motion.p variants={lineVariants} className="text-gray-400 mt-6 animate-pulse">
              &gt; AWAITING_ADMIN_CREDENTIALS...
            </motion.p>
          </motion.div>
        </div>

        {/* Action Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.5 }} // Shows up exactly when the last line finishes
          className="mt-12"
        >
          <button
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/admin/dashboard" })}
            className="group relative flex items-center justify-center gap-3 bg-transparent border border-neutral-700 hover:border-[var(--color-terminal-green)] text-neutral-300 hover:text-[var(--color-terminal-green)] py-4 px-8 font-mono tracking-widest uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-terminal-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
          >
            {/* Subtle glow behind button */}
            <div className="absolute inset-0 bg-[var(--color-terminal-green)] opacity-0 group-hover:opacity-10 blur-md transition-opacity duration-300"></div>
            
            {/* Microsoft Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            
            <span>Execute Identity Verification</span>
          </button>
        </motion.div>

      </div>
    </div>
  )
}
