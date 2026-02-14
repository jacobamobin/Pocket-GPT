import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InfoIcon from '../shared/InfoIcon'

/**
 * Token Stream Live-View
 *
 * Shows the dataset text being "sliced" into characters (tokens) in real-time.
 * Includes a "Tokenize Me" input where users can type text and see the IDs.
 */

const CHAR_COLORS = [
  '#60a5fa', // blue-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#f472b6', // pink-400
  '#a78bfa', // violet-400
  '#22d3ee', // cyan-400
  '#fb923c', // orange-400
  '#4ade80', // green-400
]

function charColor(charIdx) {
  return CHAR_COLORS[charIdx % CHAR_COLORS.length]
}

export default function TokenStreamDisplay({ vocabInfo, currentStep }) {
  const [userInput, setUserInput] = useState('')
  const [showTokenizer, setShowTokenizer] = useState(false)
  const scrollRef = useRef(null)

  const vocab = vocabInfo?.vocab ?? []
  const charToIdx = vocabInfo?.charToIdx ?? {}
  const textPreview = vocabInfo?.textPreview ?? ''

  // Determine how much of the text preview to "reveal" based on training step
  const revealLen = useMemo(() => {
    if (!currentStep || !textPreview) return 0
    // Reveal proportionally, cycling through the preview
    const cycle = currentStep * 3
    return Math.min(cycle, textPreview.length)
  }, [currentStep, textPreview])

  // The visible slice of training text, tokenized
  const visibleTokens = useMemo(() => {
    if (!textPreview || revealLen === 0) return []
    const slice = textPreview.slice(0, revealLen)
    return [...slice].map((ch, i) => ({
      char: ch,
      id: charToIdx[ch] ?? '?',
      idx: i,
    }))
  }, [textPreview, revealLen, charToIdx])

  // Tokenize user input
  const userTokens = useMemo(() => {
    if (!userInput) return []
    return [...userInput].map((ch, i) => ({
      char: ch,
      id: charToIdx[ch] ?? '?',
      known: ch in charToIdx,
      idx: i,
    }))
  }, [userInput, charToIdx])

  // Auto-scroll the stream
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [revealLen])

  if (!vocabInfo) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Token Stream
          </h3>
          <InfoIcon topicId="watch-it-learn" />
        </div>
        <div className="flex items-center justify-center h-28 text-slate-600 text-sm">
          Start training to see the token stream
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Token Stream
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            vocab: {vocab.length} chars
          </span>
        </div>
        <button
          onClick={() => setShowTokenizer(v => !v)}
          className={`
            px-3 py-1 text-xs font-medium rounded-md border transition-all duration-150
            ${showTokenizer
              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
              : 'border-neural-border bg-neural-surface text-slate-400 hover:text-white hover:border-blue-500/60'}
          `}
        >
          Tokenize Me
        </button>
      </div>

      {/* Scrolling token stream — shows training text being sliced */}
      <div className="mb-3">
        <p className="text-xs text-slate-500 mb-1.5">
          The model reads text as individual characters, each mapped to an ID number:
        </p>
        <div
          ref={scrollRef}
          className="flex gap-px overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700"
          style={{ maxHeight: 80 }}
        >
          {visibleTokens.length === 0 ? (
            <span className="text-slate-600 text-xs">Waiting for training data...</span>
          ) : (
            visibleTokens.slice(-120).map((tok, i) => (
              <motion.div
                key={`${tok.idx}-${tok.char}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center shrink-0"
                title={`"${tok.char === ' ' ? '␣' : tok.char === '\n' ? '↵' : tok.char}" → ID ${tok.id}`}
              >
                <span
                  className="text-xs font-mono px-1 py-0.5 rounded"
                  style={{
                    color: charColor(tok.id),
                    backgroundColor: `${charColor(tok.id)}15`,
                  }}
                >
                  {tok.char === ' ' ? '␣' : tok.char === '\n' ? '↵' : tok.char}
                </span>
                <span className="text-[9px] text-slate-600 font-mono">{tok.id}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Tokenize Me input */}
      <AnimatePresence>
        {showTokenizer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neural-border pt-3 space-y-2">
              <label className="text-xs text-slate-400 block">
                Type anything to see how the model breaks it into token IDs:
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder='Try typing your name...'
                className="w-full bg-neural-surface border border-neural-border rounded-lg
                           px-3 py-2 text-sm text-white placeholder-slate-600
                           focus:outline-none focus:border-blue-500 transition-colors"
              />

              {userTokens.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {userTokens.map((tok, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.03 }}
                      className="flex flex-col items-center"
                    >
                      <span
                        className="text-sm font-mono px-1.5 py-1 rounded border"
                        style={{
                          color: tok.known ? charColor(tok.id) : '#ef4444',
                          borderColor: tok.known ? `${charColor(tok.id)}40` : '#ef444440',
                          backgroundColor: tok.known ? `${charColor(tok.id)}10` : '#ef444410',
                        }}
                      >
                        {tok.char === ' ' ? '␣' : tok.char}
                      </span>
                      <span className={`text-[10px] font-mono mt-0.5 ${tok.known ? 'text-slate-400' : 'text-red-400'}`}>
                        {tok.known ? tok.id : '?'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              {userTokens.length > 0 && (
                <p className="text-xs text-slate-500">
                  Your text as IDs: [{userTokens.map(t => t.known ? t.id : '?').join(', ')}]
                  {userTokens.some(t => !t.known) && (
                    <span className="text-red-400 ml-1">
                      (red = character not in training vocabulary)
                    </span>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
