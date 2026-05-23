'use client'

import React, { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous status
    setSuccessMessage('')
    setErrorMessage('')
    setIsSubmitting(true)

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
      setSuccessMessage('[SYS.MSG] Transmission received. A system administrator will establish contact shortly.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')

    } catch (err) {
      console.error('Contact form transmission failed:', err)
      setErrorMessage('[ERR.CRITICAL] Transmission failed. Destination unreachable.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12 pb-24">
      
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
          Contact Protocol
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 font-mono text-sm">
          Initialize a direct connection. Secure transmission link established.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 font-mono text-sm p-4 uppercase">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-[var(--color-terminal-green)]/10 border border-[var(--color-terminal-green)]/50 text-[var(--color-terminal-green)] font-mono text-sm p-4 uppercase">
            {successMessage}
          </div>
        )}

        <div className="space-y-2">
          <label className="block font-mono text-xs text-neutral-500 uppercase">
            &gt; IDENTIFICATION [NAME]
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-neutral-100 dark:bg-gray-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-mono disabled:opacity-50"
            placeholder="GUEST_USER"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-xs text-neutral-500 uppercase">
            &gt; RETURN_ROUTING [EMAIL]
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-neutral-100 dark:bg-gray-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-mono disabled:opacity-50"
            placeholder="system@domain.tld"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-xs text-neutral-500 uppercase">
            &gt; TRANSMISSION_VECTOR [SUBJECT]
          </label>
          <input
            required
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-neutral-100 dark:bg-gray-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-mono disabled:opacity-50"
            placeholder="INQUIRY / OPPORTUNITY"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-xs text-neutral-500 uppercase">
            &gt; PAYLOAD [MESSAGE]
          </label>
          <textarea
            required
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-neutral-100 dark:bg-gray-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-mono resize-y disabled:opacity-50"
            placeholder="Awaiting input..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center font-mono font-bold py-4 px-6 rounded-none transition-all uppercase ${
              isSubmitting 
                ? 'bg-neutral-800 text-[var(--color-terminal-green)]/50 cursor-not-allowed border border-neutral-700' 
                : 'bg-[var(--color-terminal-green)] text-black hover:bg-green-400 active:bg-green-600'
            }`}
          >
            {isSubmitting ? '[ ENCRYPTING & TRANSMITTING... ]' : 'TRANSMIT'}
          </button>
        </div>

      </form>

    </div>
  )
}
