import { useState, useContext, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TrainingContext } from '../../contexts/TrainingContext'
import { MetricsContext }  from '../../contexts/MetricsContext'
import { UIContext }       from '../../contexts/UIContext'
import { useWebSocket }    from '../../hooks/useWebSocket'
import { useTrainingSession } from '../../hooks/useTrainingSession'
import { useTabPersistence } from '../../hooks/useTabPersistence'
import { createSession }   from '../../utils/apiClient'
import { SESSION_STATUS }  from '../../types/index.js'
import TrainingControls    from '../shared/TrainingControls'
import ViewModeToggle      from './ViewModeToggle'
import LayerHeadSelector   from './LayerHeadSelector'
import AttentionHeatmapGrid from './AttentionHeatmapGrid'
import AttentionEvolutionDisplay from './AttentionEvolutionDisplay'
import Heatmap2D           from './Heatmap2D'
import Heatmap3D           from './Heatmap3D'
import PlaybackTimeline    from './PlaybackTimeline'
import InfoIcon            from '../shared/InfoIcon'

export default function AttentionCinemaTab() {
  const { state: training, dispatch: trainingDispatch } = useContext(TrainingContext)
  const { state: metrics, dispatch: metricsDispatch  } = useContext(MetricsContext)
  const { dispatch: uiDispatch }                         = useContext(UIContext)
  const { socket }                                       = useWebSocket()

  // Local state
  const [sessionId,         setSessionId]     = useState(null)
  const [starting,          setStarting]      = useState(false)
  const [viewMode,          setViewMode]      = useState('evolution') // 'evolution' | 'grid' | 'detail'
  const [renderMode,        setRenderMode]    = useState('2d')          // '2d' | '3d'
  const [selectedLayer,     setSelectedLayer] = useState(0)
  const [selectedHead,      setSelectedHead]  = useState(0)
  const [playbackStep,      setPlaybackStep]  = useState(null)          // null = follow latest
  const [isPlaying,         setIsPlaying]     = useState(false)
  const [maxItersConfig,    setMaxItersConfig] = useState(5000)
  const [evalIntervalConfig, setEvalIntervalConfig] = useState(100)
  const [modelSizeConfig,   setModelSizeConfig] = useState('medium')

  // Persist state when navigating away
  const { savedState, clear } = useTabPersistence('attention_cinema', {
    maxItersConfig,
    evalIntervalConfig,
    modelSizeConfig,
    viewMode,
    renderMode,
    selectedLayer,
    selectedHead,
  })

  // Restore saved state on mount
  useEffect(() => {
    if (savedState && !sessionId) {
      if (savedState.maxItersConfig !== undefined) setMaxItersConfig(savedState.maxItersConfig)
      if (savedState.evalIntervalConfig !== undefined) setEvalIntervalConfig(savedState.evalIntervalConfig)
      if (savedState.modelSizeConfig !== undefined) setModelSizeConfig(savedState.modelSizeConfig)
      if (savedState.viewMode !== undefined) setViewMode(savedState.viewMode)
      if (savedState.renderMode !== undefined) setRenderMode(savedState.renderMode)
      if (savedState.selectedLayer !== undefined) setSelectedLayer(savedState.selectedLayer)
      if (savedState.selectedHead !== undefined) setSelectedHead(savedState.selectedHead)
    }
  }, [savedState, sessionId])

  // Bind WebSocket listeners for this session
  const controls = useTrainingSession(socket, sessionId)

  // Derived data
  const session    = sessionId ? training.sessions[sessionId] : null
  const snapshots  = sessionId ? (metrics[sessionId]?.attentionSnapshots ?? []) : []
  const status     = session?.status ?? null
  const currentIter = session?.currentIter ?? 0
  const maxIters    = session?.maxIters ?? 5000
  const modelConfig = session?.modelConfig ?? { n_layer: 4, n_head: 4 }

  // Sorted unique steps with snapshot data
  const steps = [...new Set(snapshots.map(s => s.step))].sort((a, b) => a - b)

  // The step actually displayed (null → latest)
  const displayStep = playbackStep ?? (steps.length ? steps[steps.length - 1] : null)

  // Find snapshot for a given (step, layer, head) — nearest step match
  function findSnap(layer, head, step) {
    const pool = snapshots.filter(s => s.layer === layer && s.head === head)
    if (!pool.length) return null
    if (step == null) return pool[pool.length - 1]
    return pool.reduce((a, b) =>
      Math.abs(b.step - step) < Math.abs(a.step - step) ? b : a
    )
  }

  const detailSnap = findSnap(selectedLayer, selectedHead, displayStep)

  // Clear saved state when training completes
  useEffect(() => {
    if (status === SESSION_STATUS.COMPLETED || status === SESSION_STATUS.STOPPED) {
      clear()
    }
  }, [status, clear])

  // Session start
  async function handlePlay() {
    if (status === SESSION_STATUS.PAUSED) {
      controls.resume()
      return
    }

    setStarting(true)
    try {
      const data = await createSession({
        feature_type: 'attention_cinema',
        dataset_id:   'shakespeare',
        hyperparameters: {
          max_iters: maxItersConfig,
          eval_interval: evalIntervalConfig,
          model_size: modelSizeConfig,
        },
      })

      const sid = data.session_id
      setSessionId(sid)

      trainingDispatch({
        type: 'CREATE_SESSION',
        payload: {
          sessionId:      sid,
          featureType:    'attention_cinema',
          status:         'idle',
          modelConfig:    data.model_config,
          trainingConfig: data.training_config,
        },
      })
      metricsDispatch({ type: 'INIT_SESSION', payload: { sessionId: sid } })

      setTimeout(() => {
        socket?.emit('join_session',    { session_id: sid })
        socket?.emit('start_training',  { session_id: sid })
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
  const [speed, setSpeedLocal] = useState(1)
  const handleSpeed     = useCallback((v) => { setSpeedLocal(v); controls.setSpeed(v) }, [controls])

  function handleSelectCell(layer, head) {
    setSelectedLayer(layer)
    setSelectedHead(head)
    setViewMode('detail')
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto">

      {/* Tab heading */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-200">Attention Cinema</h2>
        <InfoIcon topicId="attention-cinema" />
      </div>

      {/* Top row: controls + view toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrainingControls
          status={status}
          currentIter={currentIter}
          maxIters={maxIters}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onStep={handleStep}
          speed={speed}
          onSpeedChange={handleSpeed}
          disabled={starting}
          isTraining={status === SESSION_STATUS.RUNNING || status === SESSION_STATUS.PAUSED}
        />
        <ViewModeToggle
          viewMode={viewMode}
          onViewMode={setViewMode}
          renderMode={renderMode}
          onRenderMode={setRenderMode}
        />
      </div>

      {/* Layer/Head selector (Detail mode only) */}
      <AnimatePresence initial={false}>
        {viewMode === 'detail' && (
          <motion.div
            key="lh-selector"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <LayerHeadSelector
              layer={selectedLayer}
              head={selectedHead}
              onLayer={setSelectedLayer}
              onHead={setSelectedHead}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualization */}
      <AnimatePresence mode="wait">
        {snapshots.length === 0 ? (
          <div key="empty" className="card min-h-[260px]">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Attention Visualization
            </h3>
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-600 text-sm">
              {!session ? (
                <>
                  <p>Start training to watch attention patterns form.</p>
                  <button
                    onClick={handlePlay}
                    disabled={starting}
                    className="px-4 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white text-sm
                               hover:bg-blue-500 transition-colors disabled:opacity-40"
                  >
                    {starting ? 'Starting…' : '▶ Start Training (Shakespeare)'}
                  </button>
                </>
              ) : (
                <p>Training started — attention snapshots will appear every {evalIntervalConfig} steps…</p>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'evolution' ? (
              <AttentionEvolutionDisplay
                snapshots={snapshots}
                layer={selectedLayer}
                head={selectedHead}
              />
            ) : viewMode === 'grid' ? (
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  All Attention Patterns
                  {displayStep !== null && (
                    <span className="ml-3 text-xs text-slate-500 font-normal normal-case">
                      — step {displayStep}
                    </span>
                  )}
                </h3>
                <AttentionHeatmapGrid
                  snapshots={snapshots}
                  currentStep={displayStep}
                  onSelectCell={handleSelectCell}
                  modelConfig={modelConfig}
                />
              </div>
            ) : (
              /* Detail mode */
              <div className="card min-h-[260px]">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  Attention Detail — Layer {selectedLayer}, Head {selectedHead}
                  {displayStep !== null && (
                    <span className="ml-3 text-xs text-slate-500 font-normal normal-case">
                      — step {displayStep}
                    </span>
                  )}
                </h3>
                {detailSnap ? (
                  renderMode === '3d' ? (
                    <Heatmap3D matrix={detailSnap.matrix} tokens={detailSnap.tokens} />
                  ) : (
                    <div className="flex justify-center">
                      <Heatmap2D
                        matrix={detailSnap.matrix}
                        tokens={detailSnap.tokens}
                        size="large"
                      />
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-sm">
                    <p>No snapshot available for this layer/head</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Wait for next checkpoint or select a different layer/head
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playback timeline */}
      {steps.length > 0 && (
        <PlaybackTimeline
          steps={steps}
          currentStep={playbackStep}
          onStepChange={(s) => { setPlaybackStep(s); setIsPlaying(false) }}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying(v => !v)}
          maxIters={maxIters}
        />
      )}

    </div>
  )
}
