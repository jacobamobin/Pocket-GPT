import { motion } from 'framer-motion'
import { FiEye, FiFilm, FiFeather, FiZap } from 'react-icons/fi'
import { useTutorial } from '../../contexts/TutorialContext'

export default function TutorialWelcome() {
  const { state, actions } = useTutorial()
  const { dismissedWelcome, completedChapters } = state

  // Don't show if already dismissed
  if (dismissedWelcome) return null

  const handleStart = () => {
    actions.dismissWelcome()
    // Start with the first incomplete chapter
    const chapters = ['welcome', 'watch_learn', 'attention_cinema', 'style_transfer']
    const nextChapter = chapters.find(ch => !completedChapters.includes(ch)) || 'welcome'
    actions.startTutorial(nextChapter)
  }

  const handleSkip = () => {
    actions.dismissWelcome()
  }

  const hasProgress = completedChapters.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-lg w-full bg-neural-surface border border-gold-muted rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        {/* Header with gradient background */}
        <div className="relative px-8 pt-10 pb-16 bg-gradient-to-br from-gold-subtle/30 to-white/[0.02]">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-base blur-xl opacity-20 rounded-full" />
              <div className="relative w-20 h-20 rounded-2xl bg-gold-subtle border border-gold-muted flex items-center justify-center shadow-lg">
                <FiZap className="w-8 h-8 text-gold-base" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-serif italic font-bold text-center mb-2 text-white">
            Welcome to LLMBreaker
          </h1>

          {/* Subtitle */}
          <p className="text-center text-white/60 text-sm font-sans">
            Let's learn how LLMs work, step by step
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-4">
          {/* Feature highlights */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-subtle border border-gold-muted flex items-center justify-center shrink-0">
                <FiEye className="w-4 h-4 text-gold-base" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Watch It Learn</h3>
                <p className="text-xs text-white/50 mt-0.5">See a model go from gibberish to coherent text in real-time</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-subtle border border-gold-muted flex items-center justify-center shrink-0">
                <FiFilm className="w-4 h-4 text-gold-base" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Attention Cinema</h3>
                <p className="text-xs text-white/50 mt-0.5">Visualize how transformers "pay attention" to text</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-subtle border border-gold-muted flex items-center justify-center shrink-0">
                <FiFeather className="w-4 h-4 text-gold-base" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Style Transfer</h3>
                <p className="text-xs text-white/50 mt-0.5">Train a model to mimic your unique writing style</p>
              </div>
            </div>
          </div>

          {/* Info text */}
          <div className="pt-2 text-center">
            <p className="text-xs text-white/40">
              This guided tutorial takes 5-10 minutes. You can exit anytime and pick up where you left off.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-black bg-white hover:bg-gold-hover rounded-full transition-all shadow-lg"
          >
            {hasProgress ? 'Resume Tutorial' : 'Start Tutorial'}
          </button>
        </div>

        {/* Reset progress link */}
        {hasProgress && (
          <div className="px-8 pb-6">
            <button
              onClick={() => actions.resetProgress()}
              className="w-full px-4 py-2 text-xs text-white/40 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
            >
              Reset Tutorial Progress
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
