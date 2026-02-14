import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploader from './FileUploader'
import { listDatasets, uploadDataset } from '../../utils/apiClient'

export default function DatasetSelector({ value, onChange, onError, disabled }) {
  const [datasets, setDatasets]     = useState([])
  const [uploading, setUploading]   = useState(false)
  const [loading, setLoading]       = useState(true)

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
        name:         data.dataset_id,
        display_name: data.filename,
        char_count:   data.char_count,
        vocab_size:   data.vocab_size,
        word_count:   data.word_count,
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
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Dataset</h3>
        {uploading && (
          <span className="text-xs text-blue-400 animate-pulse">Uploading…</span>
        )}
      </div>

      {/* Dropdown */}
      <div className="relative" title="Choose training data. Smaller datasets train faster.">
        <select
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full appearance-none bg-neural-surface border border-neural-border
                     rounded-lg px-3 py-2.5 text-sm text-white pr-8
                     focus:outline-none focus:border-blue-500 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="" disabled>{loading ? 'Loading…' : 'Select dataset…'}</option>
          {datasets.map(ds => (
            <option key={ds.name} value={ds.name}>{ds.display_name}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-3 w-4 h-4 text-slate-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="border-t border-neural-border flex-1" />
        <span>OR</span>
        <span className="border-t border-neural-border flex-1" />
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
            className="border-t border-neural-border pt-3 grid grid-cols-3 gap-2"
          >
            {[
              { label: 'Chars',  value: selected.char_count.toLocaleString() },
              { label: 'Words',  value: selected.word_count.toLocaleString() },
              { label: 'Vocab',  value: selected.vocab_size },
            ].map(({ label, value: v }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-mono text-blue-300">{v}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
