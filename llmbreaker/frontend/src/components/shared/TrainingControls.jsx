import { motion } from 'framer-motion'
import { useState, useEffect, useMemo, useRef } from 'react'
import { FiPlay, FiPause, FiSquare, FiSkipForward, FiSettings } from 'react-icons/fi'
import { SESSION_STATUS } from '../../types/index.js'

function IconButton({ onClick, disabled, title, children, variant = 'default' }) {
  const variants = {
    default: 'icon-btn',
    primary: 'icon-btn primary',
    danger: 'icon-btn danger',
  }
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`${variants[variant]} disabled:opacity-40 disabled:cursor-not-allowed`}
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
  className = '',
}) {
  const isIdle = !status || status === SESSION_STATUS.IDLE
  const isRunning = status === SESSION_STATUS.RUNNING
  const isPaused = status === SESSION_STATUS.PAUSED
  const isCompleted = status === SESSION_STATUS.COMPLETED
  const isStopped = status === SESSION_STATUS.STOPPED
  const isActive = isRunning || isPaused

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
    <div className={`control-card flex flex-col gap-4 ${className}`}>
      <div className="section-header">
        <span>Controls</span>
      </div>

      {/* Main control row */}
      <div className="control-row">
        {/* Play / Pause toggle */}
        {isRunning ? (
          <IconButton
            variant="primary"
            onClick={onPause}
            title="Pause training"
            disabled={disabled}
          >
            <FiPause className="w-4 h-4" />
          </IconButton>
        ) : (
          <IconButton
            variant="primary"
            onClick={onPlay}
            disabled={disabled || (!isIdle && !isPaused && !isCompleted && !isStopped)}
            title={isCompleted || isStopped ? 'Restart training' : 'Start training'}
          >
            <FiPlay className="w-4 h-4" />
          </IconButton>
        )}

        {/* Stop */}
        <IconButton
          onClick={onStop}
          disabled={disabled || !isActive}
          title="Stop training"
          variant="danger"
        >
          <FiSquare className="w-4 h-4" />
        </IconButton>

        {/* Step (only when paused) */}
        <IconButton
          onClick={onStep}
          disabled={disabled || !isPaused}
          title="Execute one training step"
        >
          <FiSkipForward className="w-4 h-4" />
        </IconButton>

        {/* Config (only when handler is provided) */}
        {onOpenConfig && (
          <IconButton
            onClick={onOpenConfig}
            disabled={isTraining}
            title="Training configuration"
          >
            <FiSettings className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      {/* Progress bar / scrub bar */}
      {(isActive || isCompleted) && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-white/50">
            <span>
              {displayStep != null
                ? <>Reviewing step <span className="text-gold-light font-mono">{displayStep.toLocaleString()}</span> / {maxIters.toLocaleString()}</>
                : <>Step {currentIter.toLocaleString()} / {maxIters.toLocaleString()}</>
              }
            </span>
            <span className="flex items-center gap-2">
              {displayStep == null && <>{progress}%</>}
              {eta && isRunning && displayStep == null && (
                <span className="text-gold-light font-medium">ETA: {eta}</span>
              )}
              {displayStep != null && onScrub && (
                <button
                  onClick={() => onScrub(null)}
                  className="flex items-center gap-1 text-gold-base hover:text-gold-light transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </button>
              )}
            </span>
          </div>
          <div
            ref={barRef}
            onMouseDown={handleBarMouseDown}
            className={`relative h-2.5 rounded-full bg-white/10 select-none ${onScrub ? 'cursor-pointer' : ''}`}
          >
            {/* Training progress fill */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-base to-gold-light"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
            {/* Scrub position indicator */}
            {displayStep != null && (
              <div
                className="absolute top-1/2 w-3 h-3 rounded-full bg-white border-2 border-neural-bg shadow-lg shadow-white/30 pointer-events-none"
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
            ${isRunning ? 'bg-green-400 animate-pulse' : ''}
            ${isPaused ? 'bg-yellow-400' : ''}
            ${isCompleted ? 'bg-gold-base' : ''}
            ${isStopped ? 'bg-white/30' : ''}
            ${status === SESSION_STATUS.ERROR ? 'bg-red-400' : ''}
          `} />
          <span className="text-xs text-white/50 capitalize">{status}</span>
          {isCompleted && <span className="text-xs text-gold-light ml-1">— drag progress bar to review</span>}
        </div>
      )}
    </div>
  )
}
