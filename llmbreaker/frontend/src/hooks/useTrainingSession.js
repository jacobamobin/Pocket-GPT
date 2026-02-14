import { useEffect, useCallback, useContext } from 'react'
import { TrainingContext } from '../contexts/TrainingContext'
import { MetricsContext } from '../contexts/MetricsContext'

/**
 * Binds WebSocket events for a specific session and exposes control functions.
 *
 * @param {import('socket.io-client').Socket|null} socket
 * @param {string|null} sessionId
 */
export function useTrainingSession(socket, sessionId) {
  const { dispatch: trainingDispatch } = useContext(TrainingContext)
  const { dispatch: metricsDispatch }  = useContext(MetricsContext)

  // ── Subscribe to session room & listen for events ──────────────────────
  useEffect(() => {
    if (!socket || !sessionId) return

    socket.emit('join_session', { session_id: sessionId })

    const onStarted = (data) => {
      trainingDispatch({ type: 'SESSION_STARTED', payload: data })
    }
    const onMetrics = (data) => {
      if (data.session_id !== sessionId) return
      trainingDispatch({ type: 'UPDATE_STATUS', payload: { sessionId, status: 'running' } })
      trainingDispatch({ type: 'UPDATE_ITER',   payload: { sessionId, currentIter: data.step } })
      metricsDispatch({ type: 'ADD_METRICS', payload: data })
    }
    const onStepProgress = (data) => {
      if (data.session_id !== sessionId) return
      trainingDispatch({ type: 'UPDATE_ITER', payload: { sessionId, currentIter: data.step } })
    }
    const onSample = (data) => {
      if (data.session_id !== sessionId) return
      metricsDispatch({ type: 'ADD_SAMPLE', payload: data })
    }
    const onAttention = (data) => {
      if (data.session_id !== sessionId) return
      metricsDispatch({ type: 'ADD_ATTENTION', payload: data })
    }
    const onPaused = (data) => {
      if (data.session_id !== sessionId) return
      trainingDispatch({ type: 'UPDATE_STATUS', payload: { sessionId, status: 'paused' } })
    }
    const onResumed = (data) => {
      if (data.session_id !== sessionId) return
      trainingDispatch({ type: 'UPDATE_STATUS', payload: { sessionId, status: 'running' } })
    }
    const onStopped = (data) => {
      if (data.session_id !== sessionId) return
      trainingDispatch({ type: 'UPDATE_STATUS', payload: { sessionId, status: 'stopped' } })
    }
    const onCompleted = (data) => {
      if (data.session_id !== sessionId) return
      trainingDispatch({ type: 'SESSION_COMPLETED', payload: data })
      metricsDispatch({ type: 'SET_COMPLETED', payload: { sessionId, ...data } })
    }
    const onError = (data) => {
      if (data.session_id !== sessionId) return
      trainingDispatch({ type: 'UPDATE_STATUS', payload: { sessionId, status: 'error', error: data.message } })
    }

    socket.on('training_started',   onStarted)
    socket.on('training_metrics',   onMetrics)
    socket.on('step_progress',      onStepProgress)
    socket.on('generated_sample',   onSample)
    socket.on('attention_snapshot', onAttention)
    socket.on('training_paused',    onPaused)
    socket.on('training_resumed',   onResumed)
    socket.on('training_stopped',   onStopped)
    socket.on('training_completed', onCompleted)
    socket.on('error',              onError)

    return () => {
      socket.off('training_started',   onStarted)
      socket.off('training_metrics',   onMetrics)
      socket.off('step_progress',      onStepProgress)
      socket.off('generated_sample',   onSample)
      socket.off('attention_snapshot', onAttention)
      socket.off('training_paused',    onPaused)
      socket.off('training_resumed',   onResumed)
      socket.off('training_stopped',   onStopped)
      socket.off('training_completed', onCompleted)
      socket.off('error',              onError)
    }
  }, [socket, sessionId, trainingDispatch, metricsDispatch])

  // ── Control functions ────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (!socket || !sessionId) return
    socket.emit('start_training', { session_id: sessionId })
  }, [socket, sessionId])

  const pause = useCallback(() => {
    if (!socket || !sessionId) return
    socket.emit('pause_training', { session_id: sessionId })
  }, [socket, sessionId])

  const resume = useCallback(() => {
    if (!socket || !sessionId) return
    socket.emit('resume_training', { session_id: sessionId })
  }, [socket, sessionId])

  const stop = useCallback(() => {
    if (!socket || !sessionId) return
    socket.emit('stop_training', { session_id: sessionId })
  }, [socket, sessionId])

  const step = useCallback(() => {
    if (!socket || !sessionId) return
    socket.emit('step_training', { session_id: sessionId })
  }, [socket, sessionId])

  const setSpeed = useCallback((multiplier) => {
    if (!socket || !sessionId) return
    socket.emit('set_speed', { session_id: sessionId, speed_multiplier: multiplier })
  }, [socket, sessionId])

  return { start, pause, resume, stop, step, setSpeed }
}
