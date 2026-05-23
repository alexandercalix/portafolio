'use client'

import { useEffect } from 'react'
import { AlertOctagon, Terminal } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Caught in Error Boundary:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-[#111315] border border-red-500/50 rounded-lg p-8 max-w-2xl w-full shadow-[0_0_15px_rgba(239,68,68,0.1)]">
        <div className="flex items-center gap-3 mb-6 border-b border-red-500/30 pb-4">
          <AlertOctagon className="w-8 h-8 text-red-500 animate-pulse" />
          <h2 className="text-xl font-bold font-mono text-red-500 tracking-widest uppercase">
            System Failure
          </h2>
        </div>

        <div className="space-y-4 font-mono text-sm">
          <div className="flex gap-2">
            <span className="text-neutral-500">&gt;</span>
            <span className="text-red-400">CRITICAL_ERROR: DATABANK_CONNECTION_REFUSED</span>
          </div>
          
          <div className="flex gap-2">
            <span className="text-neutral-500">&gt;</span>
            <span className="text-[var(--color-warning-amber)]">STATUS: DOWNSTREAM_API_UNREACHABLE</span>
          </div>

          <div className="flex gap-2 mt-6 p-4 bg-red-500/10 border-l-2 border-red-500 text-neutral-300 font-sans leading-relaxed">
            <span className="font-mono text-neutral-500 mr-2">&gt; SYSTEM_MESSAGE:</span> 
            The primary backend services are currently offline or actively deploying.
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 font-mono font-bold text-xs tracking-widest uppercase px-6 py-3 border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111315]"
          >
            <Terminal className="w-4 h-4" />
            [ INITIATE_RECONNECT_PROTOCOL ]
          </button>
        </div>
      </div>

    </div>
  )
}
