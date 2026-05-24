'use client'

import React, { useState } from 'react'
import { trackEvent } from '@/src/utils/analytics'
import AnimatedPageHeader from '@/src/components/AnimatedPageHeader'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous status
    setErrorMessage('')
    setStatus('sending')

    const payload = {
      Name: name,
      Email: email,
      Subject: subject,
      Message: message
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api'
      
      const response = await fetch(`${apiUrl}/SubmitContactForm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      // Success
      setStatus('success')
      trackEvent({ action: 'contact_form_submitted', category: 'Conversion' })
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')

    } catch (err) {
      console.error('Contact form transmission failed:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12 pb-24">
      
      <AnimatedPageHeader 
        title="Contact Protocol"
        subtitle="Initialize a direct connection. Secure transmission link established."
      />

      <motion.form 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
        onSubmit={handleSubmit} 
        className="space-y-6"
      >
        
        {/* Error / Success Banners */}
        {status === 'sending' && (
          <div className="bg-[var(--color-warning-amber)]/10 border border-[var(--color-warning-amber)]/50 text-[var(--color-warning-amber)] font-mono text-sm p-4 uppercase">
            <div>&gt; TRANSMISSION_STATUS: SENDING...</div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-[var(--color-terminal-green)]/10 border border-[var(--color-terminal-green)]/50 text-[var(--color-terminal-green)] font-mono text-sm p-4 uppercase">
            <div>&gt; TRANSMISSION_STATUS: SUCCESS</div>
            <div>&gt; MESSAGE_RECEIVED</div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 font-mono text-sm p-4 uppercase">
            <div>&gt; ERROR: TRANSMISSION_FAILED</div>
            <div>&gt; RETRY_PROTOCOL_AVAILABLE</div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name-input" className="block font-mono text-xs text-neutral-500 uppercase">
            &gt; IDENTIFICATION [NAME]
          </label>
          <input
            id="name-input"
            required
            autoComplete="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === 'sending'}
            className="w-full bg-neutral-100 dark:bg-gray-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none transition-all font-mono disabled:opacity-50"
            placeholder="GUEST_USER"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email-input" className="block font-mono text-xs text-neutral-500 uppercase">
            &gt; RETURN_ROUTING [EMAIL]
          </label>
          <input
            id="email-input"
            required
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'sending'}
            className="w-full bg-neutral-100 dark:bg-gray-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none transition-all font-mono disabled:opacity-50"
            placeholder="system@domain.tld"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="subject-input" className="block font-mono text-xs text-neutral-500 uppercase">
            &gt; TRANSMISSION_VECTOR [SUBJECT]
          </label>
          <input
            id="subject-input"
            required
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={status === 'sending'}
            className="w-full bg-neutral-100 dark:bg-gray-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none transition-all font-mono disabled:opacity-50"
            placeholder="INQUIRY / OPPORTUNITY"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message-input" className="block font-mono text-xs text-neutral-500 uppercase">
            &gt; PAYLOAD [MESSAGE]
          </label>
          <textarea
            id="message-input"
            required
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === 'sending'}
            className="w-full bg-neutral-100 dark:bg-gray-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none transition-all font-mono resize-y disabled:opacity-50"
            placeholder="Awaiting input..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={status === 'sending'}
            className={`w-full flex items-center justify-center font-mono font-bold py-4 px-6 rounded-none transition-all uppercase ${
              status === 'sending' 
                ? 'bg-neutral-800 text-[var(--color-terminal-green)]/50 cursor-not-allowed border border-neutral-700' 
                : 'bg-[var(--color-terminal-green)] text-black hover:bg-green-400 active:bg-green-600'
            }`}
          >
            {status === 'sending' ? '[ ENCRYPTING & TRANSMITTING... ]' : 'TRANSMIT'}
          </button>
        </div>

      </motion.form>

    </div>
  )
}
