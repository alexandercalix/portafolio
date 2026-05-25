'use client'

import { useCallback, useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { uploadMedia } from '../lib/api/media'
import { useSession } from 'next-auth/react'
import { Loader2, Bold, Italic, Underline as UnderlineIcon, Code, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Heading1, Heading2, Heading3, Quote, SeparatorHorizontal } from 'lucide-react'

const MenuBar = ({ editor, onImageUpload }: { editor: Editor | null, onImageUpload: () => void }) => {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Enter URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const Btn = ({ onClick, isActive, disabled, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${
        isActive 
          ? 'bg-[var(--color-terminal-green)] text-black' 
          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
      }`}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700 mx-1" />

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-neutral-100 dark:bg-[#1a1d21] border-b border-neutral-200 dark:border-neutral-800 font-mono">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}><UnderlineIcon className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}><Code className="w-4 h-4" /></Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}><Heading1 className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}><Heading3 className="w-4 h-4" /></Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}><AlignLeft className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}><AlignCenter className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}><AlignRight className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}><AlignJustify className="w-4 h-4" /></Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}><Quote className="w-4 h-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()}><SeparatorHorizontal className="w-4 h-4" /></Btn>
      <Divider />
      <Btn onClick={addLink} isActive={editor.isActive('link')}><LinkIcon className="w-4 h-4" /></Btn>
      <Btn onClick={onImageUpload}><ImageIcon className="w-4 h-4" /></Btn>
    </div>
  )
}

interface RichEditorProps {
  value: string
  onChange: (val: string) => void
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = useCallback(async (file: File) => {
    // @ts-expect-error - Custom accessToken attached in auth.ts
    const token = session?.accessToken as string
    if (!token) return null

    setIsUploading(true)
    try {
      const result = await uploadMedia(file, token)
      return result.url
    } catch (error) {
      console.error("Failed to upload image:", error)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [session])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-neutral max-w-none prose-p:leading-relaxed prose-headings:font-mono prose-headings:tracking-tight min-h-[400px] p-6 focus:outline-none',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleUpload(file).then(url => {
              if (url) {
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                  const node = schema.nodes.image.create({ src: url })
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }
              }
            })
            return true
          }
        }
        return false
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleUpload(file).then(url => {
              if (url) {
                const { schema } = view.state
                const node = schema.nodes.image.create({ src: url })
                const transaction = view.state.tr.replaceSelectionWith(node)
                view.dispatch(transaction)
              }
            })
            return true
          }
        }
        return false
      }
    }
  })

  return (
    <div className="relative border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden bg-white dark:bg-[#0a0a0c]">
      <MenuBar 
        editor={editor} 
        onImageUpload={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = async () => {
            if (input.files?.length) {
              const url = await handleUpload(input.files[0])
              if (url && editor) {
                editor.chain().focus().setImage({ src: url }).run()
              }
            }
          }
          input.click()
        }}
      />
      
      <div className="overflow-y-auto max-h-[800px]">
        <EditorContent editor={editor} />
      </div>

      {isUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center p-4 bg-[#111315] border border-neutral-800 rounded shadow-xl">
            <Loader2 className="w-8 h-8 text-[var(--color-terminal-green)] animate-spin mb-3" />
            <span className="font-mono text-xs text-[var(--color-terminal-green)] animate-pulse">UPLOADING_ASSET...</span>
          </div>
        </div>
      )}
    </div>
  )
}
