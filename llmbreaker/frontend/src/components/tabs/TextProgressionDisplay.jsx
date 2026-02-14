import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Colour-codes each character based on its position in the training timeline.
 * Early samples are grey; later samples shift blue then cyan.
 */
function colorForProgress(sampleIndex, totalSamples) {
  if (totalSamples <= 1) return '#94a3b8'   // slate-400
  const t = sampleIndex / (totalSamples - 1)
  if (t < 0.3) return '#475569'             // slate-600 (early gibberish)
  if (t < 0.6) return '#3b82f6'             // blue-500
  if (t < 0.85) return '#60a5fa'            // blue-400
  return '#67e8f9'                           // cyan-300 (well-learned)
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
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Generated Text Progression
        </h3>
        <div className="flex items-center justify-center h-28 text-slate-600 text-sm">
          Text samples will appear here every {50} steps
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
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
                    ? 'bg-blue-500/15 border border-blue-500/30'
                    : 'hover:bg-neural-surface'}
                `}
              >
                {/* Step label */}
                <span className="text-xs text-slate-500 font-mono shrink-0 w-16 text-right">
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
                  <span className="shrink-0 text-blue-400 text-xs ml-auto">◄</span>
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
