'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ContactMessage, getMessages, updateMessageStatus, deleteMessage } from '@/src/lib/api'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Check, Clock, Loader2, Trash2 } from 'lucide-react'

type FilterStatus = 'All' | 'Unread' | 'Pending' | 'Read'

export default function AdminMessagesPage() {
  const { data: session } = useSession()
  const token = (session as any)?.accessToken as string

  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [filter, setFilter] = useState<FilterStatus>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    const loadMessages = async () => {
      setIsLoading(true)
      try {
        const response = await getMessages(currentPage, 10, token, filter)
        setMessages(response.data || [])
        setTotalRecords(response.totalRecords)
        setTotalPages(response.totalPages)
      } catch (err) {
        console.error('Failed to load messages:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [currentPage, filter, token])

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!token) return
    try {
      await updateMessageStatus(id, newStatus, token)
      // Optimistically update the local state
      setMessages(messages.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg))
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update status. Check console.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Unread':
        return 'text-red-500 bg-red-500/10 border-red-500/30'
      case 'Pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
      case 'Read':
        return 'text-[var(--color-terminal-green)] bg-[var(--color-terminal-green)]/10 border-[var(--color-terminal-green)]/30'
      default:
        return 'text-neutral-500 bg-neutral-500/10 border-neutral-500/30'
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    if (!confirm('SYS.WARN: Are you sure you want to permanently delete this transmission?')) return
    
    try {
      await deleteMessage(id, token)
      setMessages(messages.filter(msg => msg.id !== id))
      setTotalRecords(prev => prev - 1)
      setExpandedId(null)
    } catch (err) {
      console.error('Failed to delete message:', err)
      alert('Failed to delete message. Check console.')
    }
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
          Communications Array
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-mono text-sm flex items-center gap-4">
          INCOMING_TRANSMISSIONS: {isLoading ? '...' : totalRecords} 
          <span className="text-[var(--color-terminal-green)] animate-pulse">■</span>
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        {(['All', 'Unread', 'Pending', 'Read'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => { setFilter(status); setCurrentPage(1); setExpandedId(null); }}
            className={`font-mono text-xs uppercase px-4 py-2 border transition-all ${
              filter === status 
                ? 'bg-neutral-800 text-white border-neutral-600 dark:bg-neutral-200 dark:text-black dark:border-neutral-400' 
                : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
            }`}
          >
            [{status}]
          </button>
        ))}
      </div>

      {/* Data Grid */}
      <div className="bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 rounded-none overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-terminal-green)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center font-mono text-neutral-500 text-sm">
            NO_TRANSMISSIONS_MATCH_CRITERIA
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                {/* Row Header */}
                <div 
                  onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1a1d21] transition-colors"
                >
                  <div className="w-full md:w-32 shrink-0">
                    <span className={`inline-block font-mono text-[10px] uppercase px-2 py-1 border ${getStatusColor(msg.status)}`}>
                      {msg.status}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {msg.subject}
                    </div>
                    <div className="font-mono text-xs text-neutral-500 flex gap-2 truncate">
                      <span>{msg.name}</span>
                      <span>&lt;{msg.email}&gt;</span>
                    </div>
                  </div>

                  <div className="w-full md:w-48 shrink-0 font-mono text-xs text-neutral-500 text-left md:text-right flex items-center justify-between md:justify-end gap-4">
                    <span>{format(new Date(msg.submittedAt), 'yyyy.MM.dd HH:mm:ss')}</span>
                    {expandedId === msg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {expandedId === msg.id && (
                  <div className="p-4 md:pl-36 bg-neutral-50 dark:bg-[#0a0a0c] border-t border-dashed border-neutral-200 dark:border-neutral-800 space-y-6">
                    <div className="space-y-2">
                      <div className="font-mono text-[10px] text-neutral-500 uppercase">&gt; PAYLOAD [MESSAGE]</div>
                      <div className="font-sans text-sm text-neutral-800 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed bg-white dark:bg-[#111315] border border-neutral-200 dark:border-neutral-800 p-4">
                        {msg.message}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="font-mono text-[10px] text-neutral-500 uppercase mr-2">&gt; ACTIONS:</div>
                      
                      {msg.status !== 'Read' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(msg.id, 'Read'); }}
                          className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 bg-[var(--color-terminal-green)]/10 text-[var(--color-terminal-green)] border border-[var(--color-terminal-green)]/30 hover:bg-[var(--color-terminal-green)]/20 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          MARK_READ
                        </button>
                      )}
                      
                      {msg.status !== 'Pending' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(msg.id, 'Pending'); }}
                          className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                        >
                          <Clock className="w-3 h-3" />
                          SET_PENDING
                        </button>
                      )}

                      {msg.status !== 'Unread' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(msg.id, 'Unread'); }}
                          className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                        >
                          SET_UNREAD
                        </button>
                      )}

                      <div className="flex-1"></div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                        className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        DELETE
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="font-mono text-xs px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors uppercase text-neutral-600 dark:text-neutral-400"
          >
            [ &lt; PREV ]
          </button>
          
          <span className="font-mono text-xs text-neutral-500">
            PAGE {currentPage} OF {totalPages}
          </span>
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="font-mono text-xs px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors uppercase text-neutral-600 dark:text-neutral-400"
          >
            [ NEXT &gt; ]
          </button>
        </div>
      )}

    </div>
  )
}
