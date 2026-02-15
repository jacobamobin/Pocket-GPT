import { motion } from 'framer-motion'
import CHAPTERS from '../../data/tutorialChapters'

export default function TutorialSwitchPrompt({ currentChapter, onStay, onSwitch }) {
  const currentInfo = CHAPTERS[currentChapter]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onStay}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-neural-card border border-neural-border rounded-xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-subtle border border-gold-muted flex items-center justify-center">
            <svg className="w-6 h-6 text-gold-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Leave Tutorial?
          </h3>
          <p className="text-sm text-white/40">
            You're in the middle of <span className="text-gold-light">{currentInfo?.title}</span>.
            Would you like to continue or switch to the new tab's tutorial?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onStay}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white/40 hover:text-white border border-white/10 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            Stay Here
          </button>
          <button
            onClick={onSwitch}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-black bg-white hover:bg-gold-hover rounded-lg transition-colors"
          >
            Switch Tutorial
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
