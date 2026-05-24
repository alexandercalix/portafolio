'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import SidebarNav from './SidebarNav'

export default function AdminSidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[var(--background)] flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-[#111315] border-b border-neutral-200 dark:border-neutral-800 p-4 sticky top-0 z-40">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-neutral-900 dark:text-neutral-100 uppercase">
            Control<span className="text-[var(--color-terminal-green)]">_Center</span>
          </h2>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-600 dark:text-neutral-400 hover:text-[var(--color-terminal-green)] p-1"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111315] border-r border-neutral-200 dark:border-neutral-800 flex flex-col px-4 py-6 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="px-4 hidden md:block">
          <h2 className="text-xl font-bold tracking-wider text-neutral-900 dark:text-neutral-100 uppercase">
            Control<span className="text-[var(--color-terminal-green)]">_Center</span>
          </h2>
          <p className="text-xs text-neutral-500 font-mono mt-1">SYS.ADMIN // ACTIVE</p>
        </div>
        
        {/* Mobile-only header inside drawer */}
        <div className="md:hidden flex items-center justify-between px-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
          <p className="text-xs text-neutral-500 font-mono">SYS.ADMIN // ACTIVE</p>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-neutral-600 dark:text-neutral-400 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div onClick={() => setIsOpen(false)} className="flex-1 overflow-y-auto no-scrollbar">
           <SidebarNav />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
