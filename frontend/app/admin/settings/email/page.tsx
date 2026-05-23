'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import RichEditor from '@/src/components/RichEditor'
import { getEmailTemplate, putEmailTemplate } from '@/src/lib/api'

export default function EmailTemplateEditor() {
  const { data: session } = useSession()
  
  const [markdown, setMarkdown] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logMessages, setLogMessages] = useState<{type: 'info' | 'success' | 'error', text: string}[]>([])

  const TEMPLATE_ID = 'ClientAutoReply'

  const addLog = (type: 'info' | 'success' | 'error', text: string) => {
    setLogMessages(prev => [...prev, { type, text }])
  }

  useEffect(() => {
    async function fetchTemplate() {
      // @ts-expect-error Custom accessToken
      const token = session?.accessToken as string
      if (!token) return

      try {
        const template = await getEmailTemplate(TEMPLATE_ID, token)
        if (template && template.markdownBody) {
          setMarkdown(template.markdownBody)
          addLog('info', 'Template loaded from database.')
        } else {
          setMarkdown('Hello {{Name}}, your transmission was received!')
          addLog('info', 'No existing template found. Loaded default placeholder.')
        }
      } catch (err) {
        setMarkdown('Hello {{Name}}, your transmission was received!')
        addLog('error', 'Failed to load template. Falling back to default.')
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchTemplate()
    }
  }, [session])

  const handleSave = async () => {
    // @ts-expect-error Custom accessToken
    const token = session?.accessToken as string
    if (!token) {
      addLog('error', 'Authorization token missing. Cannot save.')
      return
    }

    setIsSaving(true)
    addLog('info', 'Initiating template compilation and syncing asset lifecycle...')

    try {
      await putEmailTemplate(TEMPLATE_ID, markdown, token)
      addLog('success', 'Template and asset linkages updated successfully.')
    } catch (err) {
      console.error(err)
      addLog('error', 'Transmission failed. Check network or server logs.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-terminal-green)]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Email Auto-Reply Template</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
            MODULE_STATE: <span className="text-[var(--color-terminal-green)]">EDIT_MODE</span> | ID: {TEMPLATE_ID}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-[var(--color-terminal-green)] text-black font-mono font-bold py-2 px-6 rounded transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>SYNCING...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>SAVE CHANGES</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Editor */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4">
              &gt; TEMPLATE_BUFFER
            </h2>
            <div className="min-h-[500px] flex flex-col">
              <RichEditor 
                value={markdown} 
                onChange={setMarkdown} 
              />
            </div>
          </div>
        </div>

        {/* Sidebar / Logs */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4">
              &gt; VARIABLES
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-2 bg-neutral-100 dark:bg-[#1a1d21] rounded border border-neutral-200 dark:border-neutral-800">
                <span className="text-[var(--color-terminal-green)]">{`{{Name}}`}</span>
                <p className="text-neutral-500 mt-1">Sender's full name</p>
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-[#1a1d21] rounded border border-neutral-200 dark:border-neutral-800">
                <span className="text-[var(--color-terminal-green)]">{`{{Subject}}`}</span>
                <p className="text-neutral-500 mt-1">Sender's chosen subject</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4">
              &gt; SYSTEM_LOGS
            </h2>
            <div className="bg-neutral-50 dark:bg-[#0a0a0c] p-3 rounded border border-neutral-200 dark:border-neutral-800 h-64 overflow-y-auto font-mono text-[10px] space-y-1">
              {logMessages.length === 0 ? (
                <span className="text-neutral-600">SYSTEM READY. WAITING FOR EXECUTION.</span>
              ) : (
                logMessages.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    {log.type === 'info' && <span className="text-blue-400 shrink-0">[INFO]</span>}
                    {log.type === 'success' && <span className="text-[var(--color-terminal-green)] shrink-0 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> [OK]</span>}
                    {log.type === 'error' && <span className="text-red-500 shrink-0 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> [ERR]</span>}
                    <span className="text-neutral-600 dark:text-neutral-400 break-words">{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
