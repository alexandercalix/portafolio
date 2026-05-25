'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getProjectById, putProject } from '@/src/lib/api'
import { UploadCloud, Save, Loader2, Image as ImageIcon, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import RichEditor from '@/src/components/RichEditor'

export default function EditProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const unwrappedParams = React.use(params)
  const projectId = unwrappedParams.id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [technologies, setTechnologies] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [existingImages, setExistingImages] = useState<string[]>([])
  
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logMessages, setLogMessages] = useState<{type: 'info' | 'success' | 'error', text: string}[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const addLog = (type: 'info' | 'success' | 'error', text: string) => {
    setLogMessages(prev => [...prev, { type, text }])
  }

  const hasLoadedRef = useRef(false)

  useEffect(() => {
    async function loadProject() {
      // @ts-expect-error Custom accessToken
      const token = session?.accessToken as string
      if (!token || hasLoadedRef.current) return

      hasLoadedRef.current = true
      try {
        const project = await getProjectById(projectId, token)
        if (project) {
          setTitle(project.title || '')
          setDescription(project.description || '')
          setLiveUrl(project.liveUrl || '')
          setGithubUrl(project.repositoryUrl || '')
          setTechnologies(project.technologies ? project.technologies.join(', ') : '')
          setIsPublished(project.isPublished)
          setIsFeatured(project.isFeatured || false)
          setExistingImages(project.images || [])
          addLog('info', 'Project data loaded successfully.')
        } else {
          addLog('error', 'Project not found.')
        }
      } catch (err) {
        addLog('error', 'Failed to load project data.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session) {
      loadProject()
    }
  }, [session, projectId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImageFiles(prev => [...prev, ...filesArray])
    }
  }

  const removeFile = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // @ts-expect-error Custom accessToken
    const token = session?.accessToken as string
    if (!token) {
      addLog('error', 'Authorization token missing. Cannot save.')
      return
    }

    setIsSaving(true)
    addLog('info', 'Initiating project compilation...')

    try {
      const formData = new FormData()

      const techArray = technologies.split(',').map(t => t.trim()).filter(t => t.length > 0)
      addLog('info', `Parsed ${techArray.length} technologies.`)

      formData.append('data', JSON.stringify({
        title,
        description,
        liveUrl: liveUrl || undefined,
        repositoryUrl: githubUrl || undefined,
        technologies: techArray,
        isPublished,
        isFeatured,
        images: existingImages // preserve existing ones
      }))

      if (imageFiles.length > 0) {
        addLog('info', `Queueing ${imageFiles.length} new image payloads for upload...`)
        imageFiles.forEach(file => {
          formData.append('images', file)
        })
      }

      addLog('info', 'UPLOADING DATA TO AZURE/CLOUDFLARE...')

      await putProject(projectId, formData, token)

      addLog('success', 'Project updated successfully. Rerouting...')
      
      setTimeout(() => {
        router.push('/admin/projects')
      }, 1000)

    } catch (err) {
      console.error(err)
      addLog('error', 'Transfer failed. Check network or server logs.')
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
      <div className="flex items-center gap-4">
        <Link href="/admin/projects" className="p-2 bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Edit Project</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
            MODULE_STATE: <span className="text-neutral-500">EDIT_MODE</span> | ID: {projectId}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column - Core Data */}
        <div className="xl:col-span-3 space-y-6 bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 flex justify-between items-center">
            <span>&gt; CORE_PARAMETERS</span>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer gap-3">
                <span className={`font-mono text-xs uppercase ${isPublished ? 'text-[var(--color-terminal-green)]' : 'text-[var(--color-warning-amber)]'}`}>
                  {isPublished ? 'PUBLISHED' : 'DRAFT'}
                </span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isPublished} onChange={() => setIsPublished(!isPublished)} />
                  <div className={`block w-12 h-6 rounded-full transition-colors ${isPublished ? 'bg-[var(--color-terminal-green)]/20 border border-[var(--color-terminal-green)]' : 'bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublished ? 'transform translate-x-6 bg-[var(--color-terminal-green)]' : 'bg-neutral-500'}`}></div>
                </div>
              </label>
              <label className="flex items-center cursor-pointer gap-3 ml-6 border-l border-neutral-200 dark:border-neutral-800 pl-6">
                <span className={`font-mono text-xs uppercase ${isFeatured ? 'text-[var(--color-terminal-green)]' : 'text-neutral-500'}`}>
                  {isFeatured ? 'FEATURED' : 'STANDARD'}
                </span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isFeatured} onChange={() => setIsFeatured(!isFeatured)} />
                  <div className={`block w-12 h-6 rounded-full transition-colors ${isFeatured ? 'bg-[var(--color-terminal-green)]/20 border border-[var(--color-terminal-green)]' : 'bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isFeatured ? 'transform translate-x-6 bg-[var(--color-terminal-green)]' : 'bg-neutral-500'}`}></div>
                </div>
              </label>
            </div>
          </h2>
          
          <div className="space-y-2">
            <label className="font-mono text-xs text-neutral-500 uppercase">Project_Title</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans text-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-neutral-500 uppercase flex justify-between">
              <span>Description_Buffer (Markdown Supported)</span>
            </label>
            <RichEditor
              value={description}
              onChange={setDescription}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Live_Deployment_URI</label>
              <input
                value={liveUrl}
                onChange={e => setLiveUrl(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans"
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Source_Repository_URI</label>
              <input
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-neutral-500 uppercase">Technologies_Array (Comma Separated)</label>
            <input
              required
              value={technologies}
              onChange={e => setTechnologies(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-[var(--color-terminal-green)] focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-mono text-sm"
            />
          </div>
        </div>

        {/* Right Column - Binary Payloads & Logs */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-6">
            <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              &gt; ASSET_STORAGE
            </h2>
            
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <div className="font-mono text-xs text-neutral-500">REMOTE_ASSETS</div>
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-video border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#1a1d21] rounded overflow-hidden">
                      <img src={imgUrl} alt="Remote asset" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Add_New_Screenshots</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  imageFiles.length > 0 ? 'border-neutral-600 bg-neutral-200/30 dark:bg-neutral-800/30' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-600 bg-neutral-100 dark:bg-[#1a1d21]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <UploadCloud className={`w-8 h-8 mb-2 ${imageFiles.length > 0 ? 'text-[var(--color-terminal-green)]' : 'text-neutral-500'}`} />
                <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">SELECT_MULTIPLE_IMAGES</span>
              </div>
              
              {imageFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="font-mono text-xs text-neutral-500 mb-2">QUEUED_ASSETS ({imageFiles.length})</div>
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {imageFiles.map((f, i) => (
                      <li key={i} className="flex items-center justify-between bg-neutral-100 dark:bg-[#1a1d21] p-2 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        <div className="flex items-center gap-2 truncate">
                          <ImageIcon className="w-3 h-3 text-[var(--color-terminal-green)] shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-400 shrink-0 ml-2">
                          [DEL]
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-terminal-green)] text-black font-mono font-bold py-3 px-4 rounded transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>EXECUTE_UPDATE</span>
                </>
              )}
            </button>

            <div className="bg-neutral-50 dark:bg-[#0a0a0c] p-3 rounded border border-neutral-200 dark:border-neutral-800 h-48 overflow-y-auto font-mono text-[10px] space-y-1">
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

      </form>
    </div>
  )
}
