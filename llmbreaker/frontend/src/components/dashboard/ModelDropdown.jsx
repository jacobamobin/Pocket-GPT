import { useState, useContext, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModelContext } from '../../contexts/ModelContext'
import { TrainingContext } from '../../contexts/TrainingContext'
import { UIContext } from '../../contexts/UIContext'
import { saveModel, renameModel, deleteModel } from '../../utils/apiClient'

export default function ModelDropdown() {
  const { state: modelState, dispatch: modelDispatch } = useContext(ModelContext)
  const { state: training } = useContext(TrainingContext)
  const { dispatch: uiDispatch } = useContext(UIContext)

  const [open, setOpen]             = useState(false)
  const [saveName, setSaveName]     = useState('')
  const [saving, setSaving]         = useState(false)
  const [renamingId, setRenamingId] = useState(null)
  const [renameVal, setRenameVal]   = useState('')
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Find active session — running, paused, or completed (anything with a model)
  const activeSession = Object.values(training.sessions).find(
    s => s.status === 'running' || s.status === 'paused' || s.status === 'completed'
  )

  async function handleSave() {
    if (!activeSession || !saveName.trim()) return
    setSaving(true)
    try {
      const entry = await saveModel(activeSession.sessionId, saveName.trim())
      modelDispatch({ type: 'ADD_MODEL', payload: entry })
      setSaveName('')
      uiDispatch({ type: 'SHOW_SUCCESS', payload: `Saved "${entry.name}"` })
    } catch (err) {
      uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleRename(id) {
    if (!renameVal.trim()) { setRenamingId(null); return }
    try {
      await renameModel(id, renameVal.trim())
      modelDispatch({ type: 'UPDATE_MODEL', payload: { id, name: renameVal.trim() } })
    } catch (err) {
      uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
    } finally {
      setRenamingId(null)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteModel(id)
      modelDispatch({ type: 'REMOVE_MODEL', payload: id })
    } catch (err) {
      uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
    }
  }

  const { models } = modelState

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-700
                   bg-slate-800/60 hover:border-slate-500 text-slate-300 text-xs transition-colors"
      >
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        <span>Models{models.length > 0 ? ` (${models.length})` : ''}</span>
        <svg
          className={`w-3 h-3 text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-72 z-50
                       bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Save current session */}
            {activeSession && (
              <div className="p-3 border-b border-slate-700/60">
                <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Save current model</p>
                <div className="flex gap-2">
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder={`Model ${models.length + 1}`}
                    className="flex-1 text-xs bg-slate-800 border border-slate-600 rounded px-2 py-1.5
                               text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving || !saveName.trim()}
                    className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white
                               hover:bg-blue-500 disabled:opacity-40 transition-colors"
                  >
                    {saving ? '…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {/* Model list */}
            <div className="max-h-64 overflow-y-auto">
              {models.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">No saved models yet</p>
              ) : (
                models.slice().reverse().map(m => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800/50 group"
                  >
                    {renamingId === m.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  handleRename(m.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onBlur={(e) => {
                          // If focus moved to another element within the dropdown, skip rename
                          if (ref.current && ref.current.contains(e.relatedTarget)) {
                            setRenamingId(null)
                            return
                          }
                          handleRename(m.id)
                        }}
                        className="flex-1 text-xs bg-slate-800 border border-blue-500 rounded
                                   px-2 py-1 text-slate-200 focus:outline-none"
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 truncate">{m.name}</p>
                        <p className="text-[10px] text-slate-500">
                          step {m.step?.toLocaleString()}
                          {m.train_loss != null && ` · loss ${m.train_loss.toFixed(3)}`}
                        </p>
                      </div>
                    )}

                    {renamingId !== m.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => { setRenamingId(m.id); setRenameVal(m.name) }}
                          className="text-slate-500 hover:text-slate-300 p-1"
                          title="Rename"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                          title="Delete"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
