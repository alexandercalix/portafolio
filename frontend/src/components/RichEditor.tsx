'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { uploadMedia } from '../lib/api/media'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

// Dynamic import with ssr: false is CRITICAL for @uiw/react-md-editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface RichEditorProps {
  value: string
  onChange: (val: string) => void
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)

  const uploadAndInjectImage = useCallback(async (file: File) => {
    // @ts-expect-error - Custom accessToken attached in auth.ts
    const token = session?.accessToken as string
    if (!token) return

    setIsUploading(true)
    try {
      const result = await uploadMedia(file, token)
      const markdownImage = `\n![${file.name}](${result.url})\n`
      // For now, append to the very end of the content
      onChange(value + markdownImage)
    } catch (error) {
      console.error("Failed to upload inline image:", error)
    } finally {
      setIsUploading(false)
    }
  }, [session, value, onChange])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    if (e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0]
      if (file.type.startsWith('image/')) {
        e.preventDefault()
        uploadAndInjectImage(file)
      }
    }
  }, [uploadAndInjectImage])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        e.preventDefault()
        uploadAndInjectImage(file)
      }
    }
  }, [uploadAndInjectImage])

  return (
    <div 
      className="relative" 
      onPaste={handlePaste} 
      onDrop={handleDrop}
      data-color-mode="dark" // Forces the OT/SCADA aesthetic
    >
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden bg-[#0d1117]">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          height={500}
          preview="live"
        />
      </div>

      {isUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-md">
          <div className="flex flex-col items-center p-4 bg-[#111315] border border-neutral-800 rounded shadow-xl">
            <Loader2 className="w-8 h-8 text-[var(--color-terminal-green)] animate-spin mb-3" />
            <span className="font-mono text-xs text-[var(--color-terminal-green)] animate-pulse">UPLOADING_ASSET...</span>
          </div>
        </div>
      )}
    </div>
  )
}
