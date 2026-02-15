import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiCheckCircle, FiLoader, FiCircle, FiPlay } from 'react-icons/fi'
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
          ${active
            ? 'bg-gold-subtle border border-gold-muted text-gold-light'
            : 'bg-neural-surface border border-white/10 text-white/60 hover:text-white/80 hover:border-gold-base/50'
          }
        `}
        title={active ? `Tutorial: ${CHAPTERS[chapterId]?.title}` : 'Open tutorial'}
      >
        {/* Active indicator pulse */}
        {active && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold-base rounded-full animate-pulse" />
        )}

        {/* Dropdown arrow */}
        <FiChevronDown
          className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-56 bg-neural-surface border border-white/10 rounded-2xl shadow-xl z-[60] overflow-hidden backdrop-blur-md"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white">Tutorial Chapters</h3>
              <p className="text-xs text-white/40 mt-0.5">Learn how LLMBreaker works</p>
            </div>

            {/* Chapter list */}
            <div className="py-1 max-h-[300px] overflow-y-auto">
              {/* Start Tutorial */}
              <button
                onClick={handleStartTutorial}
                className="w-full px-4 py-2.5 text-left text-sm text-gold-base hover:bg-gold-subtle/20 transition-colors flex items-center gap-3"
              >
                <FiPlay className="w-4 h-4 shrink-0" />
                <span className="font-medium">Start Tutorial</span>
              </button>

              <div className="border-t border-white/10 my-1" />

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
                        ? 'bg-gold-subtle/20 text-gold-light cursor-default'
                        : 'text-white/60 hover:bg-white/[0.05] hover:text-white/80'
                      }
                    `}
                  >
                    {/* Status icon */}
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                      {isCompleted ? (
                        <FiCheckCircle className="w-4 h-4 text-green-400" />
                      ) : isActive ? (
                        <FiLoader className="w-4 h-4 text-gold-base animate-spin" />
                      ) : (
                        <FiCircle className="w-4 h-4 text-white/30" />
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
            <div className="border-t border-white/10 p-2 bg-white/[0.02]">
              <button
                onClick={() => {
                  setIsOpen(false)
                  if (confirm('Reset all tutorial progress?')) {
                    actions.resetProgress()
                  }
                }}
                className="w-full px-3 py-1.5 text-xs text-white/40 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
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
