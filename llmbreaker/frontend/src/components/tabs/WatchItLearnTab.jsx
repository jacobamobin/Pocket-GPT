import { useState, useContext, useCallback } from 'react'
import { TrainingContext } from '../../contexts/TrainingContext'
import { MetricsContext }  from '../../contexts/MetricsContext'
import { UIContext }       from '../../contexts/UIContext'
import { useWebSocket }    from '../../hooks/useWebSocket'
import { useTrainingSession } from '../../hooks/useTrainingSession'
import { createSession }   from '../../utils/apiClient'
import { SESSION_STATUS }  from '../../types/index.js'
import DatasetSelector     from '../shared/DatasetSelector'
import TrainingControls    from '../shared/TrainingControls'
import LossCurveChart      from '../shared/LossCurveChart'
import TextProgressionDisplay from './TextProgressionDisplay'

export default function WatchItLearnTab() {
  const { state: training, dispatch: trainingDispatch } = useContext(TrainingContext)
  const { state: metrics,  dispatch: metricsDispatch  } = useContext(MetricsContext)
  const { dispatch: uiDispatch }                         = useContext(UIContext)
  const { socket }                                       = useWebSocket()

  const [datasetId,   setDatasetId]   = useState('shakespeare')
  const [sessionId,   setSessionId]   = useState(null)
  const [speed,       setSpeedLocal]  = useState(1)
  const [hoverStep,   setHoverStep]   = useState(null)
  const [starting,    setStarting]    = useState(false)

  // Bind WebSocket listeners for this session
  const controls = useTrainingSession(socket, sessionId)

  const session     = sessionId ? training.sessions[sessionId] : null
  const sessionMetrics = sessionId ? metrics[sessionId] : null
  const status      = session?.status ?? null
  const currentIter = session?.currentIter ?? 0
  const maxIters    = session?.maxIters ?? 500

  // ── Start / restart training ───────────────────────────────────────────
  async function handlePlay() {
    // If session exists and is paused, just resume
    if (status === SESSION_STATUS.PAUSED) {
      controls.resume()
      return
    }

    // For completed/stopped/idle: create a fresh session
    setStarting(true)
    try {
      const data = await createSession({
        feature_type: 'watch_learn',
        dataset_id:   datasetId,
        hyperparameters: { max_iters: 500, eval_interval: 50 },
      })

      const sid = data.session_id
      setSessionId(sid)

      trainingDispatch({
        type: 'CREATE_SESSION',
        payload: {
          sessionId:      sid,
          featureType:    'watch_learn',
          status:         'idle',
          modelConfig:    data.model_config,
          trainingConfig: data.training_config,
        },
      })
      metricsDispatch({ type: 'INIT_SESSION', payload: { sessionId: sid } })

      // Emit start after a tick so the hook has re-bound to the new sessionId
      setTimeout(() => {
        socket?.emit('join_session', { session_id: sid })
        socket?.emit('start_training', { session_id: sid })
        trainingDispatch({ type: 'SESSION_STARTED', payload: { session_id: sid } })
      }, 50)
    } catch (err) {
      uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
    } finally {
      setStarting(false)
    }
  }

  const handlePause     = () => controls.pause()
  const handleStop      = () => controls.stop()
  const handleStep      = () => controls.step()
  const handleSpeedChange = useCallback((v) => {
    setSpeedLocal(v)
    controls.setSpeed(v)
  }, [controls])

  const handleDatasetError = (msg) => uiDispatch({ type: 'SHOW_ERROR', payload: msg })

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">

      {/* Top row: dataset + controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatasetSelector
          value={datasetId}
          onChange={setDatasetId}
          onError={handleDatasetError}
          disabled={status === SESSION_STATUS.RUNNING || starting}
        />
        <TrainingControls
          status={status}
          currentIter={currentIter}
          maxIters={maxIters}
          speed={speed}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onStep={handleStep}
          onSpeedChange={handleSpeedChange}
          disabled={starting || !datasetId}
        />
      </div>

      {/* Loss curve */}
      <LossCurveChart
        lossHistory={sessionMetrics?.lossHistory ?? []}
        maxIters={maxIters}
        onHoverStep={setHoverStep}
      />

      {/* Text progression */}
      <TextProgressionDisplay
        samples={sessionMetrics?.samples ?? []}
        highlightStep={hoverStep}
      />

      {/* Completion banner */}
      {status === SESSION_STATUS.COMPLETED && sessionMetrics?.finalStats && (
        <div className="card border-blue-500/40 bg-blue-950/30 text-center py-4">
          <p className="text-blue-300 font-medium">Training complete!</p>
          <p className="text-slate-400 text-sm mt-1">
            Final loss: <span className="text-blue-300 font-mono">
              {sessionMetrics.finalStats.finalTrainLoss?.toFixed(4)}
            </span>
            &nbsp;·&nbsp;
            Time: <span className="text-blue-300 font-mono">
              {sessionMetrics.finalStats.totalTime?.toFixed(1)}s
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
