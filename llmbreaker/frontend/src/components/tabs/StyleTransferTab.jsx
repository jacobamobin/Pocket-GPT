import { useState, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrainingContext } from '../../contexts/TrainingContext'
import { MetricsContext }  from '../../contexts/MetricsContext'
import { UIContext }       from '../../contexts/UIContext'
import { useWebSocket }    from '../../hooks/useWebSocket'
import { useTrainingSession } from '../../hooks/useTrainingSession'
import { createSession, datasetFromText, uploadDataset } from '../../utils/apiClient'
import { SESSION_STATUS } from '../../types/index.js'
import TrainingControls    from '../shared/TrainingControls'
import LossCurveChart      from '../shared/LossCurveChart'
import TextInputPanel      from './TextInputPanel'
import SideBySideComparison from './SideBySideComparison'

export default function StyleTransferTab() {
  const { state: training, dispatch: trainingDispatch } = useContext(TrainingContext)
  const { state: metrics,  dispatch: metricsDispatch  } = useContext(MetricsContext)
  const { dispatch: uiDispatch }                         = useContext(UIContext)
  const { socket }                                       = useWebSocket()

  // ── Local state ────────────────────────────────────────────────────────────
  const [text,       setText]       = useState('')
  const [uploadedId, setUploadedId] = useState(null)   // dataset_id from .docx upload
  const [sessionId,  setSessionId]  = useState(null)
  const [speed,      setSpeedLocal] = useState(2)       // default 2× for style transfer
  const [starting,   setStarting]   = useState(false)

  const controls = useTrainingSession(socket, sessionId)

  // ── Derived ────────────────────────────────────────────────────────────────
  const session      = sessionId ? training.sessions[sessionId] : null
  const sessionMet   = sessionId ? metrics[sessionId] : null
  const status       = session?.status ?? null
  const currentIter  = session?.currentIter ?? 0
  const maxIters     = session?.maxIters ?? 500

  const wordCount    = (text.match(/\S+/g) || []).length
  const canTrain     = (text.length > 0 && wordCount >= 50) || uploadedId !== null
  const isActive     = status === SESSION_STATUS.RUNNING || status === SESSION_STATUS.PAUSED

  // ── File upload handler ────────────────────────────────────────────────────
  async function handleUploadFile(file) {
    const isTxt  = file.name.toLowerCase().endsWith('.txt')
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
        setText('')   // clear textarea since we're using the upload
        uiDispatch({ type: 'SHOW_ERROR', payload: `✓ ${file.name} uploaded (${data.word_count?.toLocaleString() ?? '?'} words, vocab ${data.vocab_size})` })
      } catch (err) {
        uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
      }
    } else {
      uiDispatch({ type: 'SHOW_ERROR', payload: 'Only .txt and .docx files are supported' })
    }
  }

  // ── Training start ─────────────────────────────────────────────────────────
  async function handlePlay() {
    if (status === SESSION_STATUS.PAUSED) {
      controls.resume()
      return
    }

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
        feature_type:    'style_transfer',
        dataset_id:      datasetId,
        hyperparameters: { max_iters: 500, eval_interval: 50 },
      })

      const sid = data.session_id
      setSessionId(sid)

      trainingDispatch({
        type: 'CREATE_SESSION',
        payload: {
          sessionId:      sid,
          featureType:    'style_transfer',
          status:         'idle',
          modelConfig:    data.model_config,
          trainingConfig: data.training_config,
        },
      })
      metricsDispatch({ type: 'INIT_SESSION', payload: { sessionId: sid } })

      setTimeout(() => {
        socket?.emit('join_session',   { session_id: sid })
        socket?.emit('start_training', { session_id: sid })
        socket?.emit('set_speed',      { session_id: sid, speed_multiplier: speed })
        trainingDispatch({ type: 'SESSION_STARTED', payload: { session_id: sid } })
      }, 50)
    } catch (err) {
      uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
    } finally {
      setStarting(false)
    }
  }

  const handlePause = () => controls.pause()
  const handleStop  = () => controls.stop()
  const handleStep  = () => controls.step()
  const handleSpeedChange = useCallback((v) => {
    setSpeedLocal(v)
    controls.setSpeed(v)
  }, [controls])

  const isDisabled = starting || !canTrain

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">

      {/* Text input */}
      <TextInputPanel
        text={text}
        onChange={(v) => { setText(v); setUploadedId(null) }}
        onUploadFile={handleUploadFile}
        disabled={isActive || starting}
      />

      {/* Training controls */}
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
        disabled={isDisabled}
      />

      {/* Loss curve */}
      <LossCurveChart
        lossHistory={sessionMet?.lossHistory ?? []}
        maxIters={maxIters}
      />

      {/* Side-by-side comparison — visible as soon as there are samples */}
      <AnimatePresence>
        {(sessionMet?.samples?.length > 0 || status === SESSION_STATUS.COMPLETED) && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SideBySideComparison
              originalText={text}
              samples={sessionMet?.samples ?? []}
              finalStats={sessionMet?.finalStats ?? null}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion banner */}
      {status === SESSION_STATUS.COMPLETED && sessionMet?.finalStats && (
        <div className="card border-blue-500/40 bg-blue-950/30 text-center py-4">
          <p className="text-blue-300 font-medium">Style transfer complete!</p>
          <p className="text-slate-400 text-sm mt-1">
            Final loss:&nbsp;
            <span className="text-blue-300 font-mono">
              {sessionMet.finalStats.finalTrainLoss?.toFixed(4)}
            </span>
            &nbsp;·&nbsp;Time:&nbsp;
            <span className="text-blue-300 font-mono">
              {sessionMet.finalStats.totalTime?.toFixed(1)}s
            </span>
          </p>
        </div>
      )}

      {/* "Not enough text" hint when idle and nothing is typed */}
      {!session && !starting && !uploadedId && text.length === 0 && (
        <p className="text-center text-slate-600 text-sm -mt-2">
          Paste your writing above to get started — the model will learn to imitate it.
        </p>
      )}

    </div>
  )
}
