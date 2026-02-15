/** Timeline scrubber + prev/play/next for stepping through attention checkpoints */
export default function PlaybackTimeline({
  steps      = [],      // sorted list of step numbers with data
  currentStep,          // currently displayed step (null = latest)
  onStepChange,         // (step) => void
  isPlaying,
  onPlayToggle,
  maxIters   = 500,
}) {
  const sliderVal = currentStep ?? (steps.length ? steps[steps.length - 1] : 0)

  function handleSlider(e) {
    const val = Number(e.target.value)
    if (!steps.length) return
    const nearest = steps.reduce((a, b) =>
      Math.abs(b - val) < Math.abs(a - val) ? b : a
    )
    onStepChange(nearest)
  }

  function handlePrev() {
    if (!steps.length) return
    const idx = steps.indexOf(sliderVal)
    const prev = idx > 0 ? steps[idx - 1] : steps[0]
    onStepChange(prev)
  }

  function handleNext() {
    if (!steps.length) return
    const idx = steps.indexOf(sliderVal)
    const next = idx < steps.length - 1 ? steps[idx + 1] : steps[steps.length - 1]
    onStepChange(next)
  }

  const btnBase = `
    flex items-center justify-center w-8 h-8 rounded-md border text-xs
    transition-all duration-150 focus:outline-none
    border-neural-border bg-neural-surface text-white/60
    hover:text-white hover:border-gold-base/60
    disabled:opacity-40 disabled:cursor-not-allowed
  `

  return (
    <div className="card flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
        Playback Timeline
      </h3>

      {steps.length === 0 ? (
        <p className="text-white/20 text-sm text-center py-2">
          Attention snapshots will appear here every 50 steps
        </p>
      ) : (
        <>
          {/* Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/20 font-mono w-4">0</span>
            <input
              type="range"
              min={0}
              max={maxIters}
              value={sliderVal}
              onChange={handleSlider}
              className="flex-1 accent-gold-base cursor-pointer"
            />
            <span className="text-xs text-white/20 font-mono w-8 text-right">{maxIters}</span>
          </div>

          {/* Step counter + checkpoint dots */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 font-mono">
              Step {sliderVal.toLocaleString()} / {maxIters.toLocaleString()}
            </span>
            <span className="text-xs text-white/20">
              {steps.length} checkpoint{steps.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} className={btnBase} title="Previous checkpoint (−50 steps)">
              {/* ◀◀ */}
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
              </svg>
            </button>

            <button
              onClick={onPlayToggle}
              className={`${btnBase} ${isPlaying ? 'border-gold-base bg-gold-base/20 text-gold-light' : ''}`}
              title={isPlaying ? 'Pause auto-advance' : 'Auto-advance through checkpoints'}
            >
              {isPlaying
                ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              }
            </button>

            <button onClick={handleNext} className={btnBase} title="Next checkpoint (+50 steps)">
              {/* ▶▶ */}
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
              </svg>
            </button>

            <div className="flex-1" />

            {currentStep !== null && (
              <button
                onClick={() => onStepChange(null)}
                className="text-xs text-gold-light hover:text-gold-light transition-colors"
                title="Jump to latest snapshot"
              >
                Follow Live
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
