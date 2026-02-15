import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Colour-codes each character based on its position in the training timeline.
 * Early samples are dim; later samples shift through a gold spectrum.
 */
function colorForProgress(sampleIndex, totalSamples) {
  if (totalSamples <= 1) return '#8b7d6b'   // muted bronze (single sample)
  const t = sampleIndex / (totalSamples - 1)
  if (t < 0.3) return '#6b5f50'             // dark bronze (early gibberish)
  if (t < 0.6) return '#a78b71'             // gold-base
  if (t < 0.85) return '#c9b8a0'            // gold-light
  return '#e8d5b7'                           // warm cream (well-learned)
}

export default function TextProgressionDisplay({ samples = [], highlightStep = null }) {
  const bottomRef = useRef(null)

  // Auto-scroll to latest sample
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [samples.length])

  if (samples.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Generated Text Progression
          </h3>
        </div>
        <div className="flex items-center justify-center h-28 text-white/20 text-sm">
          Text samples will appear here every {50} steps
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
        Generated Text Progression
      </h3>

      <div
        className="flex flex-col gap-1.5 overflow-y-auto pr-1"
        style={{ maxHeight: 320 }}
      >
        <AnimatePresence initial={false}>
          {samples.map((s, idx) => {
            const isHighlighted = highlightStep !== null &&
              Math.abs(s.step - highlightStep) ===
              Math.min(...samples.map(ss => Math.abs(ss.step - highlightStep)))

            const charColor = colorForProgress(idx, samples.length)

            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={`
                  flex gap-3 items-baseline px-3 py-2 rounded-lg text-sm transition-colors duration-200
                  ${isHighlighted
                    ? 'bg-gold-base/15 border border-gold-base/30'
                    : 'hover:bg-neural-surface'}
                `}
              >
                {/* Step label */}
                <span className="text-xs text-white/30 font-mono shrink-0 w-16 text-right">
                  step {s.step}
                </span>

                {/* Text — colour per character based on step progress */}
                <span
                  className="font-mono text-xs leading-relaxed break-all"
                  style={{ color: charColor }}
                >
                  {s.text.slice(0, 120)}
                </span>

                {/* Highlight indicator */}
                {isHighlighted && (
                  <span className="shrink-0 text-gold-light text-xs ml-auto">◄</span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
