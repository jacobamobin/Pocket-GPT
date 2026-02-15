import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploader from './FileUploader'
import InfoIcon from './InfoIcon'
import { listDatasets, uploadDataset } from '../../utils/apiClient'

export default function DatasetSelector({ value, onChange, onError, disabled, className = '' }) {
  const [datasets, setDatasets] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDatasets()
      .then(setDatasets)
      .catch(() => onError?.('Failed to load datasets'))
      .finally(() => setLoading(false))
  }, [])

  const selected = datasets.find(d => d.name === value)

  async function handleFile(file) {
    setUploading(true)
    try {
      const data = await uploadDataset(file)
      // Inject the user dataset into the local list and select it
      const userDs = {
        name: data.dataset_id,
        display_name: data.filename,
        char_count: data.char_count,
        vocab_size: data.vocab_size,
        word_count: data.word_count,
      }
      setDatasets(prev => [...prev, userDs])
      onChange(data.dataset_id)
    } catch (err) {
      onError?.(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`card flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="section-header mb-0 flex items-center gap-2">
          <span>Dataset</span>
          <InfoIcon topicId="dataset-selector" />
        </div>
        {uploading && (
          <span className="text-xs text-gold-light animate-pulse">Uploading…</span>
        )}
      </div>

      {/* Dropdown */}
      <div className="relative" title="Choose training data. Smaller datasets train faster.">
        <select
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full appearance-none bg-neural-surface border border-white/10
                     rounded-lg px-3 py-2.5 text-sm text-white pr-8
                     focus:outline-none focus:border-gold-base focus:shadow-[0_0_0_3px_rgba(167,139,113,0.1)]
                     transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="" disabled>{loading ? 'Loading…' : 'Select dataset…'}</option>
          {datasets.map(ds => (
            <option key={ds.name} value={ds.name}>{ds.display_name}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-3 w-4 h-4 text-white/40"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className="flex items-center gap-3 text-xs text-white/30">
        <span className="border-t border-white/10 flex-1" />
        <span>OR</span>
        <span className="border-t border-white/10 flex-1" />
      </div>

      <FileUploader onFile={handleFile} disabled={disabled || uploading} />

      {/* Metadata */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10 pt-3 grid grid-cols-3 gap-2"
          >
            {[
              { label: 'Chars', value: selected.char_count.toLocaleString() },
              { label: 'Words', value: selected.word_count.toLocaleString() },
              { label: 'Vocab', value: selected.vocab_size },
            ].map(({ label, value: v }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
                <span className="stat-value">{v}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
