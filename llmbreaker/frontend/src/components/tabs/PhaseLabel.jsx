import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * PhaseLabel — shows a human-readable training phase based on step count.
 *
 * Phases:
 *  0-500    Phase 1: Learning the Alphabet (Random Noise)
 *  500-1500 Phase 2: Identifying Common Words
 *  1500-3000 Phase 3: Mastering Grammar & Structure
 *  3000+    Phase 4: Mimicking the Author's Style
 */

const PHASES = [
  {
    maxStep: 500,
    phase: 1,
    title: 'Learning the Alphabet',
    subtitle: 'Random noise — the model is discovering individual characters',
    color: 'text-gold-light',
    dotColor: 'bg-gold-light',
  },
  {
    maxStep: 1500,
    phase: 2,
    title: 'Identifying Common Words',
    subtitle: 'Recognising frequent patterns like "the", "and", spaces between words',
    color: 'text-gold-light',
    dotColor: 'bg-gold-light',
  },
  {
    maxStep: 3000,
    phase: 3,
    title: 'Mastering Grammar & Structure',
    subtitle: 'Learning sentence patterns, punctuation, and capitalisation',
    color: 'text-gold-light',
    dotColor: 'bg-gold-light',
  },
  {
    maxStep: Infinity,
    phase: 4,
    title: 'Mimicking the Style',
    subtitle: 'Fine-tuning vocabulary, rhythm, and the author\'s unique voice',
    color: 'text-gold-light',
    dotColor: 'bg-gold-light',
  },
]

function getPhase(step) {
  for (const p of PHASES) {
    if (step <= p.maxStep) return p
  }
  return PHASES[PHASES.length - 1]
}

export default function PhaseLabel({ currentStep = 0, maxIters = 5000, status }) {
  const phase = useMemo(() => getPhase(currentStep), [currentStep])

  if (!status || currentStep === 0) return null

  const progress = PHASES.map(p => ({
    ...p,
    active: currentStep >= (PHASES.indexOf(p) > 0 ? PHASES[PHASES.indexOf(p) - 1].maxStep : 0),
    current: p === phase,
  }))

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase.phase}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.3 }}
        className="px-4 py-3 rounded-lg border bg-gold-subtle border-gold-muted"
      >
        {/* Phase title */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-sm font-semibold ${phase.color}`}>
            Phase {phase.phase}: {phase.title}
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-white/40 mb-3">{phase.subtitle}</p>

        {/* Phase progress dots */}
        <div className="flex items-center gap-1.5">
          {PHASES.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${p.current ? `${p.dotColor} animate-pulse scale-125` :
                    p.active ? p.dotColor : 'bg-white/20'}
                `}
                title={`Phase ${p.phase}: ${p.title}`}
              />
              {i < PHASES.length - 1 && (
                <div className={`w-6 h-0.5 rounded-full transition-colors duration-300 ${progress[i + 1]?.active ? 'bg-white/30' : 'bg-white/10'
                  }`} />
              )}
            </div>
          ))}
          <span className="text-[10px] text-white/20 ml-2 font-mono">
            {currentStep.toLocaleString()} / {maxIters.toLocaleString()}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
