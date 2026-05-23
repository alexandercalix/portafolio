'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getBlogPostById, putBlogPost } from '@/src/lib/api'
import { UploadCloud, Save, Loader2, Image as ImageIcon, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import RichEditor from '@/src/components/RichEditor'

export default function EditBlogPostEditor({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const unwrappedParams = React.use(params)
  const postId = unwrappedParams.id

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null)
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logMessages, setLogMessages] = useState<{type: 'info' | 'success' | 'error', text: string}[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const addLog = (type: 'info' | 'success' | 'error', text: string) => {
    setLogMessages(prev => [...prev, { type, text }])
  }

  useEffect(() => {
    async function loadPost() {
      // @ts-expect-error Custom accessToken
      const token = session?.accessToken as string
      if (!token) return

      try {
        const post = await getBlogPostById(postId, token)
        if (post) {
          setTitle(post.title || '')
          setContent(post.content || '')
          setTags(post.tags ? post.tags.join(', ') : '')
          setIsPublished(post.isPublished)
          setExistingThumbnailUrl(post.thumbnailUrl || null)
          addLog('info', 'Blog post data loaded successfully.')
        } else {
          addLog('error', 'Blog post not found.')
        }
      } catch (err) {
        addLog('error', 'Failed to load blog post data.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session) {
      loadPost()
    }
  }, [session, postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // @ts-expect-error Custom accessToken
    const token = session?.accessToken as string
    if (!token) {
      addLog('error', 'Authorization token missing. Cannot save.')
      return
    }

    setIsSaving(true)
    addLog('info', 'Initiating blog post compilation...')

    try {
      const formData = new FormData()

      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      addLog('info', `Parsed ${tagsArray.length} tags.`)

      formData.append('data', JSON.stringify({
        title,
        content,
        tags: tagsArray,
        isPublished,
        thumbnailUrl: existingThumbnailUrl // preserve if not replaced
      }))

      if (thumbnailFile) {
        addLog('info', `Queueing new thumbnail payload: ${thumbnailFile.name}`)
        formData.append('thumbnail', thumbnailFile)
      }

      addLog('info', 'UPLOADING DATA TO AZURE/CLOUDFLARE...')

      await putBlogPost(postId, formData, token)

      addLog('success', 'Blog post updated successfully. Rerouting...')
      
      setTimeout(() => {
        router.push('/admin/blog')
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
        <Link href="/admin/blog" className="p-2 bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Edit Blog Post</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
            MODULE_STATE: <span className="text-neutral-500">EDIT_MODE</span> | ID: {postId}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left/Main Column - Core Data */}
        <div className="xl:col-span-3 space-y-6 bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col min-h-[70vh]">
          <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 flex justify-between items-center">
            <span>&gt; CORE_PARAMETERS</span>
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
          </h2>
          
          <div className="space-y-2">
            <label className="font-mono text-xs text-neutral-500 uppercase">Post_Title</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-sans text-xl"
            />
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <label className="font-mono text-xs text-neutral-500 uppercase flex justify-between">
              <span>Content_Buffer (Markdown Supported)</span>
            </label>
            <RichEditor
              value={content}
              onChange={setContent}
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-neutral-500 uppercase">Tags_Array (Comma Separated)</label>
            <input
              required
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-[#1a1d21] border border-neutral-200 dark:border-neutral-800 rounded px-4 py-2 text-[var(--color-terminal-green)] focus:outline-none focus:border-[var(--color-terminal-green)] focus:ring-1 focus:ring-[var(--color-terminal-green)] transition-all font-mono text-sm"
            />
          </div>
        </div>

        {/* Right Column - Binary Payloads & Logs */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#111315] p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-6">
            <h2 className="text-lg font-mono text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              &gt; ASSET_STORAGE
            </h2>

            {existingThumbnailUrl && !thumbnailFile && (
              <div className="space-y-2">
                <div className="font-mono text-xs text-neutral-500">REMOTE_THUMBNAIL</div>
                <div className="relative aspect-video border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#1a1d21] rounded overflow-hidden">
                  <img src={existingThumbnailUrl} alt="Remote asset" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-mono text-xs text-neutral-500 uppercase">Replace_Thumbnail</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  thumbnailFile ? 'border-[var(--color-terminal-green)] bg-[var(--color-terminal-green)]/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-600 bg-neutral-100 dark:bg-[#1a1d21]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
                {thumbnailFile ? (
                  <>
                    <ImageIcon className="w-8 h-8 text-[var(--color-terminal-green)] mb-2" />
                    <span className="font-mono text-xs text-[var(--color-terminal-green)] truncate w-full px-2">{thumbnailFile.name}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-neutral-500 mb-2" />
                    <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">SELECT_IMAGE</span>
                  </>
                )}
              </div>
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
