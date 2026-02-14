import { motion } from 'framer-motion'
import { useState, useEffect, useMemo, useRef } from 'react'
import { SESSION_STATUS } from '../../types/index.js'
import InfoIcon from './InfoIcon'

function IconButton({ onClick, disabled, title, children, variant = 'default' }) {
  const base = `
    flex items-center justify-center w-10 h-10 rounded-lg border text-sm
    transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-blue-500/60
    disabled:opacity-40 disabled:cursor-not-allowed
  `
  const variants = {
    default:  'border-neural-border bg-neural-surface text-slate-300 hover:text-white hover:border-blue-500/60',
    primary:  'border-blue-600 bg-blue-600 text-white hover:bg-blue-500',
    danger:   'border-neural-border bg-neural-surface text-slate-400 hover:text-white hover:border-slate-500',
  }
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </motion.button>
  )
}

export default function TrainingControls({
  status,
  currentIter = 0,
  maxIters = 500,
  onPlay,
  onPause,
  onStop,
  onStep,
  onOpenConfig,
  disabled,
  isTraining,
  displayStep = null,
  onScrub,
}) {
  const isIdle      = !status || status === SESSION_STATUS.IDLE
  const isRunning   = status === SESSION_STATUS.RUNNING
  const isPaused    = status === SESSION_STATUS.PAUSED
  const isCompleted = status === SESSION_STATUS.COMPLETED
  const isStopped   = status === SESSION_STATUS.STOPPED
  const isActive    = isRunning || isPaused

  const progress = maxIters > 0 ? Math.round((currentIter / maxIters) * 100) : 0
  const barRef = useRef(null)

  // ETA calculation
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (isRunning && !startTime) {
      setStartTime(Date.now())
    } else if (!isRunning && startTime) {
      setStartTime(null)
    }
  }, [isRunning, startTime])

  useEffect(() => {
    let interval
    if (isRunning && startTime && currentIter > 0) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime)
      }, 100)
    } else {
      setElapsed(0)
    }
    return () => clearInterval(interval)
  }, [isRunning, startTime, currentIter])

  const eta = useMemo(() => {
    if (!isRunning || currentIter === 0 || elapsed === 0) return null
    const timePerStep = elapsed / currentIter
    const remainingSteps = maxIters - currentIter
    const remainingTimeMs = timePerStep * remainingSteps
    const remainingTimeSec = Math.round(remainingTimeMs / 1000)

    if (remainingTimeSec < 60) {
      return `${remainingTimeSec}s`
    } else if (remainingTimeSec < 3600) {
      const mins = Math.floor(remainingTimeSec / 60)
      const secs = remainingTimeSec % 60
      return `${mins}m ${secs}s`
    } else {
      const hours = Math.floor(remainingTimeSec / 3600)
      const mins = Math.floor((remainingTimeSec % 3600) / 60)
      return `${hours}h ${mins}m`
    }
  }, [isRunning, currentIter, elapsed, maxIters])

  // Scrub bar interaction
  function scrubFromEvent(e) {
    if (!onScrub || !barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const step = Math.round(fraction * maxIters)
    // Snap to live if dragged to the end (within 2%)
    onScrub(fraction > 0.98 ? null : step)
  }

  function handleBarMouseDown(e) {
    if (!onScrub) return
    e.preventDefault()
    scrubFromEvent(e)
    function onMove(ev) { scrubFromEvent(ev) }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const scrubProgress = displayStep != null ? Math.round((displayStep / maxIters) * 100) : null

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Controls</h3>
        <InfoIcon topicId="training-controls" />
      </div>

      {/* Main control row */}
      <div className="flex items-center gap-2">
        {/* Play / Pause toggle */}
        {isRunning ? (
          <IconButton
            variant="primary"
            onClick={onPause}
            title="Pause training"
            disabled={disabled}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </IconButton>
        ) : (
          <IconButton
            variant="primary"
            onClick={onPlay}
            disabled={disabled || (!isIdle && !isPaused && !isCompleted && !isStopped)}
            title={isCompleted || isStopped ? 'Restart training' : 'Start training'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </IconButton>
        )}

        {/* Stop */}
        <IconButton
          onClick={onStop}
          disabled={disabled || !isActive}
          title="Stop training"
          variant="danger"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z"/>
          </svg>
        </IconButton>

        {/* Step (only when paused) */}
        <IconButton
          onClick={onStep}
          disabled={disabled || !isPaused}
          title="Execute one training step"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
          </svg>
        </IconButton>

        {/* Config (only when handler is provided) */}
        {onOpenConfig && (
          <IconButton
            onClick={onOpenConfig}
            disabled={isTraining}
            title="Training configuration"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </IconButton>
        )}
      </div>

      {/* Progress bar / scrub bar */}
      {(isActive || isCompleted) && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              {displayStep != null
                ? <>Reviewing step <span className="text-cyan-400 font-mono">{displayStep.toLocaleString()}</span> / {maxIters.toLocaleString()}</>
                : <>Step {currentIter.toLocaleString()} / {maxIters.toLocaleString()}</>
              }
            </span>
            <span className="flex items-center gap-2">
              {displayStep == null && <>{progress}%</>}
              {eta && isRunning && displayStep == null && (
                <span className="text-cyan-400 font-medium">ETA: {eta}</span>
              )}
              {displayStep != null && onScrub && (
                <button
                  onClick={() => onScrub(null)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Live
                </button>
              )}
            </span>
          </div>
          <div
            ref={barRef}
            onMouseDown={handleBarMouseDown}
            className={`relative h-2.5 rounded-full bg-neural-border select-none ${onScrub ? 'cursor-pointer' : ''}`}
          >
            {/* Training progress fill */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500/50 to-cyan-400/50"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
            {/* Scrub position indicator */}
            {displayStep != null && (
              <div
                className="absolute top-1/2 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-lg shadow-cyan-400/30 pointer-events-none"
                style={{ left: `${scrubProgress}%`, transform: 'translate(-50%, -50%)' }}
              />
            )}
          </div>
        </div>
      )}

      {/* Status badge */}
      {status && (
        <div className="flex items-center gap-1.5">
          <span className={`
            w-1.5 h-1.5 rounded-full
            ${isRunning   ? 'bg-cyan-400 animate-pulse' : ''}
            ${isPaused    ? 'bg-yellow-400' : ''}
            ${isCompleted ? 'bg-blue-400' : ''}
            ${isStopped   ? 'bg-slate-500' : ''}
            ${status === SESSION_STATUS.ERROR ? 'bg-orange-400' : ''}
          `} />
          <span className="text-xs text-slate-500 capitalize">{status}</span>
          {isCompleted && <span className="text-xs text-blue-400 ml-1">— drag progress bar to review</span>}
        </div>
      )}
    </div>
  )
}
