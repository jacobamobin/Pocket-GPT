import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * ScrubBar — time-travel slider for training history.
 *
 * Props:
 *   steps       — sorted array of step numbers that have data (e.g. [100, 200, 300])
 *   displayStep — currently pinned step (null = live / follow latest)
 *   onDisplayStep(step | null) — called when user scrubs; null means "go live"
 *   maxIters    — total planned training steps (unused currently, reserved)
 */
export default function ScrubBar({ steps = [], displayStep, onDisplayStep }) {
  const isLive = displayStep === null

  const currentIdx = useMemo(() => {
    if (!steps.length) return 0
    if (isLive) return steps.length - 1
    const idx = steps.indexOf(displayStep)
    return idx >= 0 ? idx : steps.length - 1
  }, [displayStep, steps, isLive])

  // Guard AFTER hooks
  if (steps.length < 2) return null

  function handleChange(e) {
    const idx  = Number(e.target.value)
    const step = steps[idx]
    // Snap back to live when dragged to the latest step
    onDisplayStep(idx === steps.length - 1 ? null : step)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="card py-3 px-4"
    >
      <div className="flex items-center gap-3">
        {/* Current step label */}
        <span className="text-xs shrink-0 w-24">
          {isLive ? (
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
              Live
            </span>
          ) : (
            <span className="text-slate-300 font-mono">
              step {displayStep?.toLocaleString()}
            </span>
          )}
        </span>

        {/* Range slider */}
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          step={1}
          value={currentIdx}
          onChange={handleChange}
          className="flex-1 h-2 bg-neural-border rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
                     [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:hover:bg-blue-400"
        />

        {/* Right side: last step + Live button */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-600 font-mono">
            {steps[steps.length - 1]?.toLocaleString()}
          </span>
          {!isLive && (
            <button
              onClick={() => onDisplayStep(null)}
              className="px-2 py-1 text-[10px] rounded border border-cyan-500/40
                         bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              Live
            </button>
          )}
        </div>
      </div>

      <p className="text-[10px] text-slate-700 mt-1.5 text-center">
        ← drag to rewind through training history · drag right to return to live
      </p>
    </motion.div>
  )
}
