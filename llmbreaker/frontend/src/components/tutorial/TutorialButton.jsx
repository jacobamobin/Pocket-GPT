import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTutorial } from '../../contexts/TutorialContext'
import CHAPTERS from '../../data/tutorialChapters'
import { FEATURE_TYPE } from '../../types/index.js'

const CHAPTER_LIST = ['welcome', 'watch_learn', 'attention_cinema', 'style_transfer']

export default function TutorialButton() {
  const { state, actions } = useTutorial()
  const { active, chapterId, completedChapters } = state
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle chapter selection
  const handleSelectChapter = (chapterId) => {
    setIsOpen(false)
    actions.setChapter(chapterId)
  }

  // Handle start tutorial
  const handleStartTutorial = () => {
    setIsOpen(false)
    actions.startTutorial('welcome')
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Main button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`
          relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
          focus:outline-none focus:ring-1 focus:ring-blue-500/60
          ${active
            ? 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-300'
            : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
          }
        `}
        title={active ? `Tutorial: ${CHAPTERS[chapterId]?.title}` : 'Open tutorial'}
      >
        {/* Graduation cap icon */}
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Active indicator pulse */}
        {active && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        )}

        {/* Dropdown arrow */}
        <svg
          className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-56 bg-neural-card border border-neural-border rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neural-border bg-neural-surface/50">
              <h3 className="text-sm font-semibold text-slate-200">Tutorial Chapters</h3>
              <p className="text-xs text-slate-500 mt-0.5">Learn how LLMBreaker works</p>
            </div>

            {/* Chapter list */}
            <div className="py-1 max-h-[300px] overflow-y-auto">
              {/* Start Tutorial */}
              <button
                onClick={handleStartTutorial}
                className="w-full px-4 py-2.5 text-left text-sm text-cyan-400 hover:bg-cyan-950/30 transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Start Tutorial</span>
              </button>

              <div className="border-t border-neural-border my-1" />

              {/* Individual chapters */}
              {CHAPTER_LIST.filter(ch => ch !== 'welcome').map(chapterKey => {
                const chapter = CHAPTERS[chapterKey]
                const isCompleted = completedChapters.includes(chapterKey)
                const isActive = active && chapterId === chapterKey

                return (
                  <button
                    key={chapterKey}
                    onClick={() => handleSelectChapter(chapterKey)}
                    disabled={isActive}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-3
                      ${isActive
                        ? 'bg-blue-600/20 text-blue-300 cursor-default'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }
                    `}
                  >
                    {/* Status icon */}
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isActive ? (
                        <svg className="w-4 h-4 text-blue-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className={isActive ? 'font-medium' : ''}>{chapter.title}</div>
                      {isCompleted && (
                        <div className="text-xs text-green-400/70">Completed</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer - reset option */}
            <div className="border-t border-neural-border p-2 bg-neural-surface/30">
              <button
                onClick={() => {
                  setIsOpen(false)
                  if (confirm('Reset all tutorial progress?')) {
                    actions.resetProgress()
                  }
                }}
                className="w-full px-3 py-1.5 text-xs text-slate-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
              >
                Reset Progress
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
