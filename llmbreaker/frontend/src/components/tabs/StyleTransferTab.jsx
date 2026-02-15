import { useState, useContext, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TrainingContext } from '../../contexts/TrainingContext'
import { MetricsContext } from '../../contexts/MetricsContext'
import { UIContext } from '../../contexts/UIContext'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useTrainingSession } from '../../hooks/useTrainingSession'
import { useTabPersistence } from '../../hooks/useTabPersistence'
import { createSession, datasetFromText, uploadDataset } from '../../utils/apiClient'
import { SESSION_STATUS } from '../../types/index.js'
import TrainingControls from '../shared/TrainingControls'
import LossCurveChart from '../shared/LossCurveChart'
import TextInputPanel from './TextInputPanel'
import StyleEvolutionDisplay from './StyleEvolutionDisplay'
import InfoIcon from '../shared/InfoIcon'

export default function StyleTransferTab() {
  const { state: training, dispatch: trainingDispatch } = useContext(TrainingContext)
  const { state: metrics, dispatch: metricsDispatch } = useContext(MetricsContext)
  const { dispatch: uiDispatch } = useContext(UIContext)
  const { socket } = useWebSocket()

  // Local state
  const [sessionId, setSessionId] = useState(null)
  const [text, setText] = useState('')
  const [uploadedId, setUploadedId] = useState(null)
  const [starting, setStarting] = useState(false)
  const [maxItersConfig, setMaxItersConfig] = useState(5000)
  const [evalIntervalConfig, setEvalIntervalConfig] = useState(100)
  const [modelSizeConfig, setModelSizeConfig] = useState('medium')
  const [viewMode, setViewMode] = useState('overview')

  // Bind WebSocket listeners for this session
  const controls = useTrainingSession(socket, sessionId)

  // Persist state when navigating away
  const { savedState, clear } = useTabPersistence('style_transfer', {
    sessionId,
    text,
    uploadedId,
    maxItersConfig,
    evalIntervalConfig,
    modelSizeConfig,
    viewMode,
  })

  // Restore saved state on mount
  useEffect(() => {
    if (savedState && !sessionId) {
      if (savedState.sessionId !== undefined) setSessionId(savedState.sessionId)
      if (savedState.text !== undefined) setText(savedState.text)
      if (savedState.uploadedId !== undefined) setUploadedId(savedState.uploadedId)
      if (savedState.maxItersConfig !== undefined) setMaxItersConfig(savedState.maxItersConfig)
      if (savedState.evalIntervalConfig !== undefined) setEvalIntervalConfig(savedState.evalIntervalConfig)
      if (savedState.modelSizeConfig !== undefined) setModelSizeConfig(savedState.modelSizeConfig)
      if (savedState.viewMode !== undefined) setViewMode(savedState.viewMode)
    }
  }, [savedState, sessionId])

  // Derived data
  const session = sessionId ? training.sessions[sessionId] : null
  const sessionMet = sessionId ? metrics[sessionId] : null
  const status = session?.status ?? null
  const isActive = status === SESSION_STATUS.RUNNING || status === SESSION_STATUS.PAUSED
  const currentIter = session?.currentIter ?? 0
  const maxIters = session?.maxIters ?? 5000

  // Clear saved state when training completes or user starts fresh
  useEffect(() => {
    if (status === SESSION_STATUS.COMPLETED || status === SESSION_STATUS.STOPPED) {
      clear()
    }
  }, [status, clear])

  // File upload handler
  async function handleUploadFile(file) {
    const isTxt = file.name.toLowerCase().endsWith('.txt')
    const isDocx = file.name.toLowerCase().endsWith('.docx')

    if (isTxt) {
      // Read .txt client-side → populate textarea
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(e.target.result || '')
        setUploadedId(null)
      }
      reader.onerror = () => uiDispatch({ type: 'SHOW_ERROR', payload: 'Failed to read file' })
      reader.readAsText(file, 'utf-8')
    } else if (isDocx) {
      // Upload .docx to backend → get dataset_id
      try {
        const data = await uploadDataset(file)
        setUploadedId(data.dataset_id)
        setText('')   // clear textarea since we're using an upload
        uiDispatch({
          type: 'SHOW_SUCCESS',
          payload: `${file.name} uploaded (${data.word_count?.toLocaleString() ?? '?'} words, vocab ${data.vocab_size})`
        })
      } catch (err) {
        uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
      }
    } else {
      uiDispatch({ type: 'SHOW_ERROR', payload: 'Only .txt and .docx files are supported' })
    }
  }

  // Session start
  async function handlePlay() {
    // If session exists and is paused, just resume
    if (status === SESSION_STATUS.PAUSED) {
      controls.resume()
      return
    }

    // For completed/stopped/idle: create a fresh session
    setStarting(true)
    try {
      // Get dataset_id
      let datasetId = uploadedId
      if (!datasetId) {
        const dsData = await datasetFromText(text)
        datasetId = dsData.dataset_id
      }

      // Create session
      const data = await createSession({
        feature_type: 'style_transfer',
        dataset_id: datasetId,
        hyperparameters: { max_iters: maxItersConfig, eval_interval: evalIntervalConfig },
      })

      const sid = data.session_id
      setSessionId(sid)

      trainingDispatch({
        type: 'CREATE_SESSION',
        payload: {
          sessionId: sid,
          featureType: 'style_transfer',
          status: 'idle',
          modelConfig: data.model_config,
          trainingConfig: data.training_config,
        },
      })
      metricsDispatch({ type: 'INIT_SESSION', payload: { sessionId: sid } })

      // Emit start after a tick so hook has re-bound to new sessionId
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

  const handlePause = () => controls.pause()
  const handleStop = () => controls.stop()
  const handleStep = () => controls.step()

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto">

      {/* Tab heading */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-white">Style Transfer</h2>
        <InfoIcon topicId="style-transfer" />
      </div>

      {/* Top row: text input + controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div data-tutorial="style-input">
          <TextInputPanel
            text={text}
            onChange={(v) => { setText(v); setUploadedId(null) }}
            onUploadFile={handleUploadFile}
            disabled={isActive || starting}
            placeholder="Paste your writing sample here (at least 10 words)..."
          />
        </div>
        <div data-tutorial="style-controls">
          <TrainingControls
            className="h-full"
            status={status}
            currentIter={currentIter}
            maxIters={maxIters}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onStep={handleStep}
            disabled={starting || !text}
            isTraining={isActive}
          />
        </div>
      </div>

      {/* Learning Progress Banner */}
      {isActive && sessionMet?.samples && sessionMet.samples.length > 0 && (
        <div className="card bg-gold-subtle border-gold-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gold-base animate-pulse" />
              <h3 className="text-sm font-semibold text-gold-light uppercase tracking-wider">
                Learning Your Style
              </h3>
            </div>
            <span className="text-xs text-gold-light font-mono">
              {sessionMet.samples.length} sample{sessionMet.samples.length !== 1 ? 's' : ''} generated
            </span>
          </div>
          <p className="text-xs text-white/40 mt-2">
            The model is analyzing your writing patterns and learning to replicate them.
            Watch samples evolve to match your style!
          </p>
        </div>
      )}

      {/* Loss Curve */}
      {isActive && (
        <div data-tutorial="loss-curve">
          <LossCurveChart
            lossHistory={sessionMet?.lossHistory ?? []}
            maxIters={maxIters}
          />
        </div>
      )}

      {/* Visualization */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' ? (
          <div data-tutorial="style-evolution">
            <StyleEvolutionDisplay
              text={text}
              samples={sessionMet?.samples ?? []}
              finalStats={sessionMet?.finalStats ?? null}
              showEvolution={false}
            />
          </div>
        ) : (
          <div data-tutorial="style-evolution">
            <StyleEvolutionDisplay
              text={text}
              samples={sessionMet?.samples ?? []}
              finalStats={sessionMet?.finalStats ?? null}
              showEvolution={true}
            />
          </div>
        )}
      </AnimatePresence>

      {/* View Mode Toggle */}
      <div className="flex justify-center" data-tutorial="view-toggle">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-2">
          <span className="text-xs text-white/40 uppercase tracking-wide">View:</span>
          {['overview', 'evolution'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`toggle-btn ${viewMode === mode ? 'active' : 'inactive'}`}
              title={mode === 'evolution' ? 'Evolution: Watch style develop over time' : 'Overview: Side-by-side comparison'}
            >
              {mode === 'evolution' ? 'Evolution' : 'Overview'}
            </button>
          ))}
        </div>
      </div>

      {/* Completion banner */}
      {status === SESSION_STATUS.COMPLETED && sessionMet?.finalStats && (
        <div className="card border-gold-muted bg-gold-subtle text-center py-4">
          <p className="text-gold-light font-medium">Style transfer complete!</p>
          <p className="text-white/40 text-sm mt-1">
            Final loss: <span className="text-gold-light font-mono">
              {sessionMet.finalStats.finalTrainLoss?.toFixed(4)}
            </span>
            &nbsp;·&nbsp;
            Time: <span className="text-gold-light font-mono">
              {sessionMet.finalStats.totalTime?.toFixed(1)}s
            </span>
          </p>
        </div>
      )}

      {/* "Not enough text" hint when idle and nothing is typed */}
      {!session && !starting && !uploadedId && text.length === 0 && (
        <p className="text-center text-white/20 text-sm -mt-2">
          Type or paste your writing sample above to get started.
          The model needs at least 10 words to learn your style.
        </p>
      )}
    </div>
  )
}
