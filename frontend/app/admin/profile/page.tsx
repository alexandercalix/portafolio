'use client'

import { useEffect, useState, useRef } from 'react'
import { getGlobalProfile, putGlobalProfile, SiteProfile } from '@/src/lib/api'
import { useSession } from 'next-auth/react'
import { UploadCloud, File, Image as ImageIcon, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ProfileEditor() {
  const { data: session } = useSession()
  
  const [profile, setProfile] = useState<Partial<SiteProfile>>({
    name: '',
    headline: '',
    bio: '',
    githubUrl: '',
    linkedInUrl: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [logMessages, setLogMessages] = useState<{type: 'info' | 'success' | 'error', text: string}[]>([])

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function init() {
      try {
        const data = await getGlobalProfile()
        if (data) {
          setProfile(data)
          addLog('success', 'Profile data synchronized with server.')
        } else {
          addLog('info', 'No existing profile found. Ready for initialization.')
        }
      } catch (err) {
        addLog('error', 'Failed to fetch global profile.')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const addLog = (type: 'info' | 'success' | 'error', text: string) => {
    setLogMessages(prev => [...prev, { type, text }])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // @ts-expect-error - Custom accessToken attached in auth.ts
    const token = session?.accessToken as string
    if (!token) {
      addLog('error', 'Authorization token missing. Cannot save.')
      return
    }

    setIsSaving(true)
    addLog('info', 'Initiating data transfer...')

    try {
      const formData = new FormData()
      
      formData.append('data', JSON.stringify({
        name: profile.name,
        headline: profile.headline,
        bio: profile.bio,
        githubUrl: profile.githubUrl,
        linkedInUrl: profile.linkedInUrl,
      }))

      if (avatarFile) {
        formData.append('avatar', avatarFile)
        addLog('info', `Queueing avatar payload: ${avatarFile.name}`)
      }
      
      if (resumeFile) {
        formData.append('resume', resumeFile)
        addLog('info', `Queueing resume payload: ${resumeFile.name}`)
      }

      addLog('info', 'UPLOADING DATA...')
      
      await putGlobalProfile(formData, token)
      
      addLog('success', 'Transfer complete. Singleton updated successfully.')
      
      // Reset file inputs visually
      setAvatarFile(null)
      setResumeFile(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
      if (resumeInputRef.current) resumeInputRef.current.value = ''

    } catch (err) {
      console.error(err)
      addLog('error', 'Transfer failed. Check network or server logs.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-[var(--color-terminal-green)] font-mono">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>INITIALIZING_CMS_MODULE...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Global Profile</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
          EDIT_MODE: <span className="text-[var(--color-warning-amber)]">ACTIVE</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Text Data */}
        <div className="xl:col-span-2 space-y-6 bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            &gt; STRING_PARAMETERS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Name_String</label>
              <input
                name="name"
                value={profile.name || ''}
                onChange={handleInputChange}
                required
                className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans"
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Headline_String</label>
              <input
                name="headline"
                value={profile.headline || ''}
                onChange={handleInputChange}
                required
                className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-neutral-500 uppercase">Biography_Buffer</label>
            <textarea
              name="bio"
              value={profile.bio || ''}
              onChange={handleInputChange}
              rows={6}
              className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Github_URI</label>
              <input
                name="githubUrl"
                value={profile.githubUrl || ''}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans"
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">LinkedIn_URI</label>
              <input
                name="linkedInUrl"
                value={profile.linkedInUrl || ''}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans"
              />
            </div>
          </div>
        </div>

        {/* Right Column - File Payloads & Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-6">
            <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              &gt; BINARY_PAYLOADS
            </h2>

            {/* Avatar Drop */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Avatar_Object</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  avatarFile ? 'border-[var(--color-terminal-green)] bg-[var(--color-terminal-green)]/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-600 bg-neutral-100 dark:bg-[#1a1d21]'
                }`}
                onClick={() => avatarInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={avatarInputRef}
                  className="hidden" 
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
                {avatarFile ? (
                  <>
                    <ImageIcon className="w-8 h-8 text-[var(--color-terminal-green)] mb-2" />
                    <span className="font-mono text-xs text-[var(--color-terminal-green)] truncate w-full px-2">{avatarFile.name}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-neutral-500 mb-2" />
                    <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">SELECT_IMAGE</span>
                    {profile.avatarUrl && <span className="text-[10px] text-neutral-600 mt-1 block truncate w-full px-2">CURRENT: {profile.avatarUrl.split('/').pop()}</span>}
                  </>
                )}
              </div>
            </div>

            {/* Resume Drop */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Resume_Object</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  resumeFile ? 'border-[var(--color-terminal-green)] bg-[var(--color-terminal-green)]/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-600 bg-neutral-100 dark:bg-[#1a1d21]'
                }`}
                onClick={() => resumeInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  ref={resumeInputRef}
                  className="hidden" 
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                {resumeFile ? (
                  <>
                    <File className="w-8 h-8 text-[var(--color-terminal-green)] mb-2" />
                    <span className="font-mono text-xs text-[var(--color-terminal-green)] truncate w-full px-2">{resumeFile.name}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-neutral-500 mb-2" />
                    <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">SELECT_PDF</span>
                    {profile.resumeUrl && <span className="text-[10px] text-neutral-600 mt-1 block truncate w-full px-2">CURRENT: {profile.resumeUrl.split('/').pop()}</span>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-terminal-green)] text-black font-mono font-bold py-3 px-4 rounded transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>UPLOADING_DATA...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>COMMIT_CHANGES</span>
                </>
              )}
            </button>

            {/* Terminal Log Output */}
            <div className="bg-neutral-50 dark:bg-[#0a0a0c] p-3 rounded border border-neutral-200 dark:border-neutral-800 h-40 overflow-y-auto font-mono text-[10px] space-y-1">
              {logMessages.length === 0 ? (
                <span className="text-neutral-600">Awaiting input...</span>
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

      </form>
    </div>
  )
}
