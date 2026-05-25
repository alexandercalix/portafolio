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
    authorTitle: '',
    authorBio: '',
    currentFocus: '',
    systemCapabilities: [],
    githubUrl: '',
    linkedInUrl: '',
    experiences: [],
    educations: [],
  })
  const [capabilitiesInput, setCapabilitiesInput] = useState('')
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
          if (data.systemCapabilities) {
            setCapabilitiesInput(data.systemCapabilities.join(', '))
          }
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

  const handleExperienceChange = (index: number, field: string, value: any) => {
    setProfile(prev => {
      const newExp = [...(prev.experiences || [])]
      newExp[index] = { ...newExp[index], [field]: value }
      return { ...prev, experiences: newExp }
    })
  }

  const handleEducationChange = (index: number, field: string, value: any) => {
    setProfile(prev => {
      const newEdu = [...(prev.educations || [])]
      newEdu[index] = { ...newEdu[index], [field]: value }
      return { ...prev, educations: newEdu }
    })
  }

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experiences: [...(prev.experiences || []), { id: crypto.randomUUID(), sortOrder: 0, jobTitle: '', company: '', startDate: new Date().toISOString().split('T')[0], isCurrent: false, description: '', technologies: [] }]
    }))
  }

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      educations: [...(prev.educations || []), { id: crypto.randomUUID(), sortOrder: 0, degreeOrCertificate: '', institution: '', dateObtained: new Date().toISOString().split('T')[0], description: '', focusLine: '' }]
    }))
  }

  const removeExperience = (index: number) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences?.filter((_, i) => i !== index)
    }))
  }

  const removeEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      educations: prev.educations?.filter((_, i) => i !== index)
    }))
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
      // Sanitizing the comma-separated string before sending to the API
      const capabilitiesArray = capabilitiesInput
        .split(',')
        .map(cap => cap.trim())
        .filter(Boolean); // removes empty strings if there's a trailing comma

      formData.append('data', JSON.stringify({
        name: profile.name,
        headline: profile.headline,
        bio: profile.bio,
        authorTitle: profile.authorTitle,
        authorBio: profile.authorBio,
        currentFocus: profile.currentFocus,
        systemCapabilities: capabilitiesArray,
        githubUrl: profile.githubUrl,
        linkedInUrl: profile.linkedInUrl,
        experiences: profile.experiences || [],
        educations: profile.educations || [],
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Author_Title</label>
              <input
                name="authorTitle"
                value={profile.authorTitle || ''}
                onChange={handleInputChange}
                placeholder="e.g. Lead Engineer (Shown on blog posts)"
                className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans"
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Author_Bio_Short</label>
              <input
                name="authorBio"
                value={profile.authorBio || ''}
                onChange={handleInputChange}
                placeholder="Brief description for author cards"
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

          <div className="space-y-2">
            <label className="font-mono text-xs text-neutral-500 uppercase">Current_Focus</label>
            <textarea
              name="currentFocus"
              value={profile.currentFocus || ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g., Industrial automation tools, SCADA data workflows..."
              className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-neutral-500 uppercase">System_Capabilities (Comma Separated)</label>
            <textarea
              name="systemCapabilities"
              value={capabilitiesInput}
              onChange={(e) => setCapabilitiesInput(e.target.value)}
              rows={3}
              placeholder="PLC_CONTROL, SCADA_HMI, C#_TOOLS..."
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

      {/* Experience Section */}
      <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 mt-8 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400">
            &gt; EXPERIENCE_ARRAY
          </h2>
          <button
            type="button"
            onClick={addExperience}
            className="text-xs font-mono px-3 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors border border-neutral-300 dark:border-neutral-700"
          >
            [+] ADD NEW EXPERIENCE
          </button>
        </div>

        {profile.experiences?.map((exp, index) => (
          <div key={exp.id} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded bg-neutral-50 dark:bg-[#0a0a0c] space-y-4 relative">
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="absolute top-4 right-4 text-xs font-mono px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20"
            >
              [X] REMOVE
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="font-mono text-xs text-[var(--color-terminal-green)]">DISPLAY_ORDER</label>
                <input
                  type="number"
                  value={exp.sortOrder || 0}
                  onChange={(e) => handleExperienceChange(index, 'sortOrder', parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-[var(--color-terminal-green)]/30 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs text-neutral-500">JOB_TITLE</label>
                <input
                  value={exp.jobTitle}
                  onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs text-neutral-500">COMPANY</label>
                <input
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs text-neutral-500">START_DATE</label>
                <input
                  type="date"
                  value={exp.startDate.split('T')[0]}
                  onChange={(e) => handleExperienceChange(index, 'startDate', new Date(e.target.value).toISOString())}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs text-neutral-500">END_DATE</label>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    disabled={exp.isCurrent}
                    value={exp.endDate ? exp.endDate.split('T')[0] : ''}
                    onChange={(e) => handleExperienceChange(index, 'endDate', new Date(e.target.value).toISOString())}
                    className="flex-1 bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 font-mono text-xs text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) => {
                        handleExperienceChange(index, 'isCurrent', e.target.checked);
                        if (e.target.checked) handleExperienceChange(index, 'endDate', undefined);
                      }}
                      className="accent-[var(--color-terminal-green)]"
                    />
                    CURRENT
                  </label>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="font-mono text-xs text-neutral-500">DESCRIPTION (Paragraph)</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="font-mono text-xs text-neutral-500">TECHNOLOGIES (Comma separated)</label>
                <input
                  value={exp.technologies?.join(', ') || ''}
                  onChange={(e) => handleExperienceChange(index, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                  placeholder="React, Node, Azure..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 mt-8 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400">
            &gt; EDUCATION_ARRAY
          </h2>
          <button
            type="button"
            onClick={addEducation}
            className="text-xs font-mono px-3 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors border border-neutral-300 dark:border-neutral-700"
          >
            [+] ADD NEW EDUCATION
          </button>
        </div>

        {profile.educations?.map((edu, index) => (
          <div key={edu.id} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded bg-neutral-50 dark:bg-[#0a0a0c] space-y-4 relative">
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="absolute top-4 right-4 text-xs font-mono px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20"
            >
              [X] REMOVE
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="font-mono text-xs text-[var(--color-terminal-green)]">DISPLAY_ORDER</label>
                <input
                  type="number"
                  value={edu.sortOrder || 0}
                  onChange={(e) => handleEducationChange(index, 'sortOrder', parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-[var(--color-terminal-green)]/30 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="font-mono text-xs text-neutral-500">DEGREE_OR_CERTIFICATE</label>
                <input
                  value={edu.degreeOrCertificate}
                  onChange={(e) => handleEducationChange(index, 'degreeOrCertificate', e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs text-neutral-500">INSTITUTION</label>
                <input
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs text-neutral-500">DATE_OBTAINED</label>
                <input
                  type="date"
                  value={edu.dateObtained.split('T')[0]}
                  onChange={(e) => handleEducationChange(index, 'dateObtained', new Date(e.target.value).toISOString())}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="font-mono text-xs text-neutral-500">FOCUS_LINE (Optional)</label>
                <input
                  value={edu.focusLine || ''}
                  onChange={(e) => handleEducationChange(index, 'focusLine', e.target.value)}
                  placeholder="Focus: automation, electronics, and control systems."
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="font-mono text-xs text-neutral-500">DESCRIPTION (Optional)</label>
                <textarea
                  value={edu.description}
                  onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-sm focus:border-[var(--color-terminal-green)] outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
