import { useState, useContext, useCallback, useEffect, useMemo } from 'react'
import { TrainingContext } from '../../contexts/TrainingContext'
import { MetricsContext }  from '../../contexts/MetricsContext'
import { UIContext }       from '../../contexts/UIContext'
import { useWebSocket }    from '../../hooks/useWebSocket'
import { useTrainingSession } from '../../hooks/useTrainingSession'
import { useTabPersistence } from '../../hooks/useTabPersistence'
import { createSession }   from '../../utils/apiClient'
import { SESSION_STATUS }  from '../../types/index.js'
import DatasetSelector     from '../shared/DatasetSelector'
import TrainingControls    from '../shared/TrainingControls'
import LossCurveChart      from '../shared/LossCurveChart'
import TextProgressionDisplay from './TextProgressionDisplay'
import TokenStreamDisplay  from './TokenStreamDisplay'
import EmbeddingStarMap    from './EmbeddingStarMap'
import ProbabilityTower    from './ProbabilityTower'
import PhaseLabel          from './PhaseLabel'
import InfoIcon            from '../shared/InfoIcon'
import TrainingConfigPanel from '../shared/TrainingConfigPanel'
import ScrubBar            from '../shared/ScrubBar'

export default function WatchItLearnTab() {
  const { state: training, dispatch: trainingDispatch } = useContext(TrainingContext)
  const { state: metrics,  dispatch: metricsDispatch  } = useContext(MetricsContext)
  const { dispatch: uiDispatch }                         = useContext(UIContext)
  const { socket }                                       = useWebSocket()

  const [datasetId,     setDatasetId]     = useState('shakespeare')
  const [sessionId,     setSessionId]     = useState(null)
  const [speed,         setSpeedLocal]    = useState(1)
  const [hoverStep,     setHoverStep]     = useState(null)
  const [displayStep,   setDisplayStep]   = useState(null)
  const [starting,      setStarting]      = useState(false)
  const [configOpen,    setConfigOpen]    = useState(false)
  const [maxItersConfig, setMaxItersConfig] = useState(5000)
  const [evalIntervalConfig, setEvalIntervalConfig] = useState(100)
  const [modelSizeConfig, setModelSizeConfig] = useState('medium')
  const [learningRateConfig, setLearningRateConfig] = useState('balanced')
  const [batchSizeConfig,    setBatchSizeConfig]    = useState('medium')
  const [blockSizeConfig,    setBlockSizeConfig]    = useState(128)
  const [dropoutConfig,      setDropoutConfig]      = useState(0.0)
  const [warmupConfig,       setWarmupConfig]       = useState(true)
  const [temperatureConfig,  setTemperatureConfig]  = useState(0.8)

  // Persist state when navigating away
  const { savedState, clear } = useTabPersistence('watch_learn', {
    datasetId,
    maxItersConfig,
    evalIntervalConfig,
    modelSizeConfig,
  })

  // Restore saved state on mount
  useEffect(() => {
    if (savedState && !sessionId) {
      if (savedState.datasetId !== undefined) setDatasetId(savedState.datasetId)
      if (savedState.maxItersConfig !== undefined) setMaxItersConfig(savedState.maxItersConfig)
      if (savedState.evalIntervalConfig !== undefined) setEvalIntervalConfig(savedState.evalIntervalConfig)
      if (savedState.modelSizeConfig !== undefined) setModelSizeConfig(savedState.modelSizeConfig)
    }
  }, [savedState, sessionId])

  // Bind WebSocket listeners for this session
  const controls = useTrainingSession(socket, sessionId)

  const steps = useMemo(
    () => (sessionMetrics?.lossHistory ?? []).map(r => r.step),
    [sessionMetrics?.lossHistory]
  )

  const session     = sessionId ? training.sessions[sessionId] : null
  const sessionMetrics = sessionId ? metrics[sessionId] : null
  const status      = session?.status ?? null
  const currentIter = session?.currentIter ?? 0
  const maxIters    = session?.maxIters ?? 5000

  // Clear saved state when training completes
  useEffect(() => {
    if (status === SESSION_STATUS.COMPLETED || status === SESSION_STATUS.STOPPED) {
      clear()
    }
  }, [status, clear])

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
      const LR_MAP    = { slow: 1e-4, balanced: 1e-3, fast: 3e-3 }
      const BATCH_MAP = { small: 16, medium: 32, large: 64 }

      const data = await createSession({
        feature_type: 'watch_learn',
        dataset_id:   datasetId,
        hyperparameters: {
          max_iters:     maxItersConfig,
          eval_interval: evalIntervalConfig,
          model_size:    modelSizeConfig,
          block_size:    blockSizeConfig,
          dropout:       dropoutConfig,
          learning_rate: LR_MAP[learningRateConfig] ?? 1e-3,
          batch_size:    BATCH_MAP[batchSizeConfig] ?? 32,
          warmup_steps:  warmupConfig ? 100 : 0,
          temperature:   temperatureConfig,
        },
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

      {/* Tab heading */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-200">Watch It Learn</h2>
        <InfoIcon topicId="watch-it-learn" />
      </div>

      {/* Phase label */}
      <PhaseLabel
        currentStep={currentIter}
        maxIters={maxIters}
        status={status}
      />

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
          onOpenConfig={() => setConfigOpen(true)}
          disabled={starting || !datasetId}
          isTraining={status === SESSION_STATUS.RUNNING || status === SESSION_STATUS.PAUSED}
        />
      </div>

      {/* Token stream */}
      <TokenStreamDisplay
        vocabInfo={sessionMetrics?.vocabInfo ?? null}
        currentStep={currentIter}
      />

      {/* Loss curve */}
      <LossCurveChart
        lossHistory={sessionMetrics?.lossHistory ?? []}
        maxIters={maxIters}
        onHoverStep={setHoverStep}
        displayStep={displayStep}
      />

      {/* Text progression + Probability tower side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TextProgressionDisplay
            samples={sessionMetrics?.samples ?? []}
            highlightStep={displayStep ?? hoverStep}
          />
        </div>
        <ProbabilityTower
          tokenProbabilities={
            displayStep != null
              ? (sessionMetrics?.tokenProbabilities ?? []).filter(p => p.step <= displayStep)
              : (sessionMetrics?.tokenProbabilities ?? [])
          }
          samples={sessionMetrics?.samples ?? []}
        />
      </div>

      {/* Embedding star map */}
      <EmbeddingStarMap
        embeddingSnapshots={sessionMetrics?.embeddingSnapshots ?? []}
        vocabInfo={sessionMetrics?.vocabInfo ?? null}
        displayStep={displayStep}
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

      {/* Time-travel scrub bar */}
      <ScrubBar
        steps={steps}
        displayStep={displayStep}
        onDisplayStep={setDisplayStep}
        maxIters={maxIters}
      />

      {/* ── Config Drawer ── */}
      {configOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setConfigOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-[380px] z-50 bg-neural-bg border-l border-neural-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neural-border">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-slate-200">Training Configuration</h3>
              </div>
              <button
                onClick={() => setConfigOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <TrainingConfigPanel
                maxIters={maxItersConfig}
                evalInterval={evalIntervalConfig}
                modelSize={modelSizeConfig}
                onMaxItersChange={setMaxItersConfig}
                onEvalIntervalChange={setEvalIntervalConfig}
                onModelSizeChange={setModelSizeConfig}
                learningRate={learningRateConfig}
                batchSize={batchSizeConfig}
                blockSize={blockSizeConfig}
                dropout={dropoutConfig}
                warmup={warmupConfig}
                temperature={temperatureConfig}
                onLearningRateChange={setLearningRateConfig}
                onBatchSizeChange={setBatchSizeConfig}
                onBlockSizeChange={setBlockSizeConfig}
                onDropoutChange={setDropoutConfig}
                onWarmupChange={setWarmupConfig}
                onTemperatureChange={setTemperatureConfig}
                disabled={false}
                isTraining={status === SESSION_STATUS.RUNNING || status === SESSION_STATUS.PAUSED}
                drawerMode
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
