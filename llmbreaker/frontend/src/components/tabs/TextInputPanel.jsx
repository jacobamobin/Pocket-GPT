import { useEffect, useRef } from 'react'
import FileUploader from '../shared/FileUploader'
import { motion, AnimatePresence } from 'framer-motion'

function countWords(text) {
  return (text.match(/\S+/g) || []).length
}

function countVocab(text) {
  // Character-level vocab size (unique chars)
  return new Set(text).size
}

export default function TextInputPanel({ text, onChange, onUploadFile, disabled }) {
  const textareaRef = useRef(null)

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 320) + 'px'
  }, [text])

  const charCount = text.length
  const wordCount = countWords(text)
  const vocabSize = text.length > 0 ? countVocab(text) : 0
  const tooShort  = text.length > 0 && wordCount < 50
  const warning   = text.length > 0 && wordCount < 300 && wordCount >= 50

  return (
    <div className="card flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Your Text
      </h3>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste your writing here — emails, essays, tweets, anything…
Min 50 words. The model will learn to imitate your style."
        className="
          w-full min-h-[120px] resize-none rounded-lg border border-neural-border
          bg-neural-surface text-slate-200 text-sm leading-relaxed p-3
          placeholder:text-slate-600
          focus:outline-none focus:border-blue-500/60
          disabled:opacity-40 disabled:cursor-not-allowed
          font-mono
        "
        style={{ overflow: 'hidden' }}
        title="Paste your writing (emails, essays, tweets). Min 50 words."
      />

      {/* Upload option */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-neural-border" />
        <span className="text-xs text-slate-600">or</span>
        <div className="flex-1 h-px bg-neural-border" />
      </div>
      <FileUploader
        onFile={onUploadFile}
        disabled={disabled}
      />

      {/* Metadata + warnings */}
      <AnimatePresence initial={false}>
        {charCount > 0 && (
          <motion.div
            key="meta"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
              <span>Characters: <span className="text-slate-300">{charCount.toLocaleString()}</span></span>
              <span>Words: <span className="text-slate-300">{wordCount.toLocaleString()}</span></span>
              <span>Vocab: <span className="text-slate-300">{vocabSize}</span></span>
            </div>

            {tooShort && (
              <p className="mt-2 text-xs text-blue-400 border border-blue-500/30 bg-blue-950/30 rounded px-2 py-1">
                ⚠ Min 50 words required — add more text to enable training
              </p>
            )}
            {warning && !tooShort && (
              <p className="mt-2 text-xs text-slate-500 border border-neural-border rounded px-2 py-1">
                ℹ 300+ words recommended for better style learning
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
