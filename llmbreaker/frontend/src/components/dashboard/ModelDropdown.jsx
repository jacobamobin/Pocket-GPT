import { useState, useContext, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { ModelContext } from '../../contexts/ModelContext'
import { TrainingContext } from '../../contexts/TrainingContext'
import { UIContext } from '../../contexts/UIContext'
import { saveModel, renameModel, deleteModel } from '../../utils/apiClient'

export default function ModelDropdown() {
  const { state: modelState, dispatch: modelDispatch } = useContext(ModelContext)
  const { state: training } = useContext(TrainingContext)
  const { state: ui, dispatch: uiDispatch } = useContext(UIContext)

  const [open, setOpen]                   = useState(false)
  const [saveName, setSaveName]           = useState('')
  const [saving, setSaving]               = useState(false)
  const [renamingId, setRenamingId]       = useState(null)
  const [renameVal, setRenameVal]         = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const currentFeatureType = ui.activeTab

  // Find active session — running, paused, or completed (anything with a model)
  const activeSession = Object.values(training.sessions).find(
    s => (s.status === 'running' || s.status === 'paused' || s.status === 'completed')
      && s.featureType === currentFeatureType
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

  const models = modelState.models.filter(m => m.feature_type === currentFeatureType)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-white/10
                   bg-neural-surface hover:border-gold-base/50 text-white/60 text-xs transition-colors"
      >
        <span>Models{models.length > 0 ? ` (${models.length})` : ''}</span>
        <FiChevronDown
          className={`w-3 h-3 text-white/40 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-72 z-50
                       bg-neural-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
          >
            {/* Save current session */}
            {activeSession && (
              <div className="p-3 border-b border-white/10">
                <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider font-semibold">Save current model</p>
                <div className="flex gap-2">
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder={`Model ${models.length + 1}`}
                    className="flex-1 text-xs bg-neural-card border border-white/10 rounded px-2 py-1.5
                               text-white placeholder:text-white/30 focus:outline-none focus:border-gold-base"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving || !saveName.trim()}
                    className="px-3 py-1.5 text-xs rounded bg-white text-black font-semibold
                               hover:bg-gold-hover disabled:opacity-40 transition-colors"
                  >
                    {saving ? '…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {/* Model list */}
            <div className="max-h-64 overflow-y-auto">
              {models.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-6">No saved models yet</p>
              ) : (
                models.slice().reverse().map(m => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.05] group"
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
                        className="flex-1 text-xs bg-neural-card border border-gold-base rounded
                                   px-2 py-1 text-white focus:outline-none"
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{m.name}</p>
                        <p className="text-[10px] text-white/40">
                          step {m.step?.toLocaleString()}
                          {m.train_loss != null && ` · loss ${m.train_loss.toFixed(3)}`}
                        </p>
                      </div>
                    )}

                    {renamingId !== m.id && (
                      confirmDeleteId === m.id ? (
                        <div className="flex gap-1 items-center shrink-0">
                          <span className="text-[10px] text-red-400">Delete?</span>
                          <button
                            onClick={() => { handleDelete(m.id); setConfirmDeleteId(null) }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 hover:bg-white/20 border border-white/10"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => { setRenamingId(m.id); setRenameVal(m.name) }}
                            className="text-white/40 hover:text-gold-base p-1"
                            title="Rename"
                          >
                            <FiEdit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(m.id)}
                            className="text-white/40 hover:text-red-400 p-1"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )
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
