import { motion } from 'framer-motion'
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-lg w-full bg-neural-card border border-neural-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header with gradient background */}
        <div className="relative px-8 pt-10 pb-16 bg-gradient-to-br from-blue-950/50 to-cyan-950/50">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 blur-xl opacity-30 rounded-full" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.03 1.17.09" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Welcome to LLMBreaker
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-slate-400 text-sm">
            Let\'s learn how LLMs work, step by step
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-4">
          {/* Feature highlights */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-950/50 border border-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-lg">📝</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Watch It Learn</h3>
                <p className="text-xs text-slate-500 mt-0.5">See a model go from gibberish to coherent text in real-time</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <span className="text-lg">🎬</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Attention Cinema</h3>
                <p className="text-xs text-slate-500 mt-0.5">Visualize how transformers "pay attention" to text</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-lg">✨</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Style Transfer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Train a model to mimic your unique writing style</p>
              </div>
            </div>
          </div>

          {/* Info text */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500">
              This guided tutorial takes 5-10 minutes. You can exit anytime and pick up where you left off.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-lg transition-all shadow-lg shadow-blue-500/25"
          >
            {hasProgress ? 'Resume Tutorial' : 'Start Tutorial'}
          </button>
        </div>

        {/* Reset progress link */}
        {hasProgress && (
          <div className="px-8 pb-6">
            <button
              onClick={() => actions.resetProgress()}
              className="w-full px-4 py-2 text-xs text-slate-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
            >
              Reset Tutorial Progress
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
