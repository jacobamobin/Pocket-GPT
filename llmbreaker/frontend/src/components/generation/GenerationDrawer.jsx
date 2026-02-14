import { useContext, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGeneration } from '../../contexts/GenerationContext'
import { TrainingContext } from '../../contexts/TrainingContext'
import { useWebSocket } from '../../hooks/useWebSocket'
import GenerationControls from './GenerationControls'
import ProbabilityBars from './ProbabilityBars'

const CONTEXT_WINDOW = 64
const MAX_TOKENS = 500

function escapeDisplay(token) {
  if (token === '\n') return '↵\n'
  return token
}

export default function GenerationDrawer() {
  const {
    isOpen, userInput, generatedTokens, isPlaying, speed,
    currentProbabilities, highlightedIndex, error, actions,
  } = useGeneration()

  const { state: training, dispatch: trainingDispatch } = useContext(TrainingContext)
  const sessionId = training?.activeSessionId ?? null
  const { socket } = useWebSocket()

  const [isGenerating, setIsGenerating] = useState(false)
  const outputRef = useRef(null)

  // ── Pause training when drawer opens, resume when closed ─────────────────────
  const wasTrainingRef = useRef(false)

  useEffect(() => {
    if (!sessionId || !socket) return
    const session = training.sessions[sessionId]
    if (!session) return

    if (isOpen) {
      if (session.status === 'running') {
        wasTrainingRef.current = true
        socket.emit('pause_training', { session_id: sessionId })
        trainingDispatch({ type: 'UPDATE_STATUS', payload: { sessionId, status: 'paused' } })
      }
    } else {
      if (wasTrainingRef.current) {
        wasTrainingRef.current = false
        socket.emit('resume_training', { session_id: sessionId })
        trainingDispatch({ type: 'UPDATE_STATUS', payload: { sessionId, status: 'running' } })
      }
    }
  }, [isOpen])

  // Scroll output to bottom when new tokens arrive
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [generatedTokens])

  // ── API call ────────────────────────────────────────────────────────────────
  const generateNextToken = async (tokenOverride) => {
    if (!sessionId) {
      actions.setError('No active training session — train a model first.')
      actions.setIsPlaying(false)
      return null
    }

    setIsGenerating(true)
    const context = userInput + generatedTokens.join('')

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const res = await fetch('/api/generate-next-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ session_id: sessionId, context, temperature: 1.0 }),
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 404) throw new Error('Session not found — try starting a new training run.')
        if (res.status === 400 && data.error?.includes('not initialized')) throw new Error('Model not ready yet — wait for the first training step to complete.')
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      return await res.json()
    } catch (err) {
      if (err.name === 'AbortError') {
        actions.setError('Request timed out — try again.')
      } else {
        actions.setError(err.message)
      }
      actions.setIsPlaying(false)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Step (manual) ────────────────────────────────────────────────────────────
  const handleStep = async () => {
    const result = await generateNextToken()
    if (!result) return

    // Accept highlighted token if user chose one, otherwise use model's choice
    const chosen = result.probabilities[highlightedIndex]?.token ?? result.next_token
    actions.addToken(chosen)
    actions.setCurrentProbabilities(result.probabilities)
    actions.setHighlightedIndex(0)
  }

  // ── Autoplay loop ────────────────────────────────────────────────────────────
  const generatedRef = useRef(generatedTokens)
  generatedRef.current = generatedTokens

  useEffect(() => {
    if (!isPlaying) return
    if (generatedRef.current.length >= MAX_TOKENS) {
      actions.setIsPlaying(false)
      return
    }

    const timer = setTimeout(async () => {
      const result = await generateNextToken()
      if (!result) return
      actions.addToken(result.next_token)
      actions.setCurrentProbabilities(result.probabilities)
      actions.setHighlightedIndex(0)
    }, speed)

    return () => clearTimeout(timer)
  }, [isPlaying, generatedTokens, speed, sessionId, userInput])

  // ── Keyboard navigation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    const onKey = (e) => {
      if (e.key === 'Escape') {
        actions.close()
        return
      }
      if (e.key === ' ' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        actions.setIsPlaying(!isPlaying)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        actions.setHighlightedIndex(i => Math.min(i + 1, currentProbabilities.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        actions.setHighlightedIndex(i => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' && !isPlaying && currentProbabilities.length > 0 && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        handleStep()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, isPlaying, currentProbabilities, highlightedIndex])

  // ── Context window split ───────────────────────────────────────────────────────
  const fullText = userInput + generatedTokens.join('')
  const outOfContext = fullText.length > CONTEXT_WINDOW ? fullText.slice(0, -CONTEXT_WINDOW) : ''
  const inContext    = fullText.length > CONTEXT_WINDOW ? fullText.slice(-CONTEXT_WINDOW) : fullText

  const inputOnly     = userInput
  const generated     = generatedTokens.join('')
  const hasGenerated  = generatedTokens.length > 0
  const atMaxLength   = generatedTokens.length >= MAX_TOKENS
  const controlsDisabled = !userInput.trim() || !sessionId

  const activeSession = sessionId ? training.sessions[sessionId] : null
  const trainingPaused = wasTrainingRef.current
  const modelNotReady = activeSession && !activeSession.currentIter

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={actions.close}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 660 }}
            animate={{ x: 0 }}
            exit={{ x: 660 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-[640px] max-w-full bg-neural-card border-l border-neural-border flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neural-border shrink-0">
              <div>
                <h2 className="text-base font-semibold text-slate-200">Token Playground</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sessionId
                    ? `Session: ${sessionId.slice(0, 8)}…`
                    : 'No active model'}
                </p>
              </div>
              <button
                onClick={actions.close}
                className="text-slate-500 hover:text-white transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* No model warning */}
              {!sessionId && (
                <div className="px-4 py-3 bg-yellow-950/30 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
                  ⚠️ No model trained. Go to any tab and start training first.
                </div>
              )}

              {/* Training paused banner */}
              {trainingPaused && (
                <div className="px-4 py-3 bg-blue-950/30 border border-blue-500/30 rounded-lg text-sm text-blue-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  Training paused — will resume when you close this panel.
                </div>
              )}

              {/* Model not ready yet */}
              {sessionId && modelNotReady && (
                <div className="px-4 py-3 bg-yellow-950/30 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
                  ⏳ Model initializing — wait for the first training step to complete.
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-red-950/30 border border-red-500/30 rounded-lg text-sm text-red-200 flex items-start gap-2">
                  <span className="shrink-0">⚠️</span>
                  <span className="flex-1">{error}</span>
                  <button onClick={() => actions.setError(null)} className="text-red-400 hover:text-red-200 shrink-0">×</button>
                </div>
              )}

              {/* Max length banner */}
              {atMaxLength && (
                <div className="px-4 py-3 bg-green-950/30 border border-green-500/30 rounded-lg text-sm text-green-200">
                  ✓ Reached max length ({MAX_TOKENS} tokens). Modify input to continue.
                </div>
              )}

              {/* Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Input Text
                  </label>
                  {userInput && (
                    <button
                      onClick={() => { actions.setUserInput(''); actions.reset() }}
                      className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  value={userInput}
                  onChange={e => { actions.setUserInput(e.target.value); actions.reset() }}
                  placeholder="Type something to get started…"
                  rows={3}
                  className="w-full px-3 py-2 bg-neural-surface border border-neural-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none text-sm font-mono"
                />
                <p className="text-xs text-slate-500">
                  {fullText.length} chars · {Math.min(fullText.length, CONTEXT_WINDOW)} in context window
                  {fullText.length > CONTEXT_WINDOW && (
                    <span className="ml-1 text-amber-500">({fullText.length - CONTEXT_WINDOW} faded = out of context)</span>
                  )}
                </p>
              </div>

              {/* Controls */}
              <GenerationControls disabled={controlsDisabled} onStep={handleStep} />

              {/* Output */}
              {hasGenerated && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Generated Output
                  </p>
                  <div
                    ref={outputRef}
                    className="px-3 py-2 bg-neural-surface border border-neural-border rounded-lg font-mono text-sm whitespace-pre-wrap break-all max-h-48 overflow-y-auto"
                  >
                    {/* Text outside context window — dimmed */}
                    <span className="opacity-30">{outOfContext}</span>
                    {/* User input within context window */}
                    <span className="text-slate-300">
                      {inContext.slice(0, Math.max(0, inContext.length - generated.length))}
                    </span>
                    {/* Generated tokens — cyan */}
                    <span className="text-cyan-300">
                      {inContext.slice(Math.max(0, inContext.length - generated.length))}
                    </span>
                    {isPlaying && <span className="animate-pulse text-cyan-400">█</span>}
                    {isGenerating && !isPlaying && <span className="animate-pulse text-slate-500">▌</span>}
                  </div>
                </div>
              )}

              {/* Probability bars */}
              <ProbabilityBars />

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
