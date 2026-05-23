'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Save, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import { getSiteSettings, putSiteSettings, uploadMedia, SiteSettings } from '@/src/lib/api'
import Image from 'next/image'

export default function BrandSettings() {
  const { data: session } = useSession()
  
  const [siteName, setSiteName] = useState('')
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [logMessages, setLogMessages] = useState<{type: 'info' | 'success' | 'error', text: string}[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addLog = (type: 'info' | 'success' | 'error', text: string) => {
    setLogMessages(prev => [...prev, { type, text }])
  }

  useEffect(() => {
    async function fetchSettings() {
      // @ts-expect-error Custom accessToken
      const token = session?.accessToken as string
      if (!token) return

      try {
        const settings = await getSiteSettings()
        if (settings) {
          setSiteName(settings.siteName)
          setFaviconUrl(settings.faviconUrl ?? null)
          addLog('info', 'Global settings loaded from database.')
        } else {
          addLog('info', 'No existing settings found. Initializing defaults.')
        }
      } catch (err) {
        addLog('error', 'Failed to load settings.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchSettings()
    }
  }, [session])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    
    // Validate file
    const validTypes = ['image/png', 'image/x-icon', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      addLog('error', 'Invalid file type. Must be .png, .ico, or .svg.')
      return
    }

    if (file.size > 200 * 1024) {
      addLog('error', 'File too large. Favicons must be under 200KB.')
      return
    }

    // @ts-expect-error Custom accessToken
    const token = session?.accessToken as string
    if (!token) return

    setIsUploading(true)
    addLog('info', `Uploading ${file.name} to Cloudflare R2...`)

    try {
      const response = await uploadMedia(file, token)
      setFaviconUrl(response.url)
      addLog('success', 'Image uploaded successfully (Orphan State). Save to link.')
    } catch (err) {
      console.error(err)
      addLog('error', 'Upload failed. See console for details.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    // @ts-expect-error Custom accessToken
    const token = session?.accessToken as string
    if (!token) {
      addLog('error', 'Authorization token missing. Cannot save.')
      return
    }

    setIsSaving(true)
    addLog('info', 'Syncing settings and media asset lifecycle...')

    try {
      await putSiteSettings({ siteName, faviconUrl }, token)
      addLog('success', 'Settings and asset linkages updated successfully.')
    } catch (err) {
      console.error(err)
      addLog('error', 'Update failed. Check network or server logs.')
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
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Brand Identity</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
            MODULE_STATE: <span className="text-[var(--color-terminal-green)]">EDIT_MODE</span> | TARGET: GlobalConfig
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isUploading}
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
              <span>SAVE CONFIG</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Editor */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4">
              &gt; SITE_METADATA
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-neutral-500 mb-1">siteName</label>
                <input 
                  type="text" 
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 font-mono focus:outline-none focus:border-[var(--color-terminal-green)] transition-colors"
                  placeholder="My Portfolio"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4">
              &gt; FAVICON_ASSET
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div 
                className="w-32 h-32 shrink-0 rounded border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-neutral-50 dark:bg-[#0a0a0c] relative overflow-hidden"
              >
                {faviconUrl ? (
                  <Image src={faviconUrl} alt="Favicon" fill className="object-contain p-2" unoptimized />
                ) : (
                  <ImageIcon className="w-8 h-8 text-neutral-400" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 text-[var(--color-terminal-green)] animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-mono text-sm text-neutral-800 dark:text-neutral-200">Browser Tab Icon</h3>
                  <p className="text-sm text-neutral-500 mt-1">Upload a small, square image. Must be .png, .ico, or .svg and under 200KB.</p>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden" 
                  accept=".png,.ico,.svg"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-mono text-sm rounded transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'UPLOADING...' : 'SELECT IMAGE'}
                </button>
                
                {faviconUrl && (
                  <p className="text-xs font-mono text-neutral-400 break-all bg-neutral-100 dark:bg-[#1a1d21] p-2 rounded">
                    URL: {faviconUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="xl:col-span-1 space-y-6">
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
