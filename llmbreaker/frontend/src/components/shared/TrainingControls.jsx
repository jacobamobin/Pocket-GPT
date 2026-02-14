import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { SPEED_OPTIONS, SESSION_STATUS } from '../../types/index.js'
import TrainingConfigPanel from './TrainingConfigPanel.jsx'

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
  speed = 1,
  onPlay,
  onPause,
  onStop,
  onStep,
  onSpeedChange,
  onMaxItersChange,
  onEvalIntervalChange,
  onModelSizeChange,
  disabled,
  isTraining,
  maxItersConfig,
  evalIntervalConfig,
  modelSizeConfig,
}) {
  const isIdle      = !status || status === SESSION_STATUS.IDLE
  const isRunning   = status === SESSION_STATUS.RUNNING
  const isPaused    = status === SESSION_STATUS.PAUSED
  const isCompleted = status === SESSION_STATUS.COMPLETED
  const isStopped   = status === SESSION_STATUS.STOPPED
  const isActive    = isRunning || isPaused

  const progress = maxIters > 0 ? Math.round((currentIter / maxIters) * 100) : 0

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

  return (
    <div className="card flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Controls</h3>

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
            title={isCompleted || isStopped ? 'Restart training' : 'Start training. Start training from scratch'}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Speed selector */}
        <div className="flex items-center gap-2" title="Adjust training speed (faster = less smooth)">
          <span className="text-xs text-slate-500">Speed</span>
          <select
            value={speed}
            onChange={e => onSpeedChange(Number(e.target.value))}
            disabled={disabled || isIdle}
            className="bg-neural-surface border border-neural-border rounded-md px-2 py-1.5
                       text-sm text-white focus:outline-none focus:border-blue-500
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {SPEED_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress bar + step counter */}
      {(isActive || isCompleted) && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Step {currentIter.toLocaleString()} / {maxIters.toLocaleString()}</span>
            <span className="flex items-center gap-2">
              {progress}%
              {eta && isRunning && (
                <span className="text-cyan-400 font-medium">ETA: {eta}</span>
              )}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-neural-border overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Training Configuration Panel */}
      {onMaxItersChange && onEvalIntervalChange && (
        <TrainingConfigPanel
          maxIters={maxItersConfig}
          evalInterval={evalIntervalConfig}
          modelSize={modelSizeConfig}
          onMaxItersChange={onMaxItersChange}
          onEvalIntervalChange={onEvalIntervalChange}
          onModelSizeChange={onModelSizeChange}
          disabled={disabled}
          isTraining={isTraining}
        />
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
          {isCompleted && <span className="text-xs text-blue-400 ml-1">— click ▶ to replay</span>}
        </div>
      )}
    </div>
  )
}
