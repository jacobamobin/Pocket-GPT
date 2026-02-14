# Model Library + Time-Travel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add a named model checkpoint system (persist to disk, hotswap, rename, delete) and a time-travel scrub bar that replays stored metrics at any past step.

**Architecture:** Backend gains `checkpoints/` directory + `models_registry.json` + 5 REST endpoints; a `save_checkpoint` utility in trainer. Frontend gains `ModelContext`, a `ModelDropdown` in the header, and a `ScrubBar` component that feeds a `displayStep` prop down into each tab's visualizations.

**Tech Stack:** PyTorch `state_dict`, Flask REST, React context + useReducer, Framer Motion, Tailwind CSS.

---

### Task 1: Backend — checkpoint save/load utilities

**Files:**
- Create: `backend/checkpoint_manager.py`
- Modify: `backend/models.py` (add `CheckpointRecord` dataclass)

**Context:** `backend/trainer.py` already has `session.model_instance` (a `MicroGPT`) and `session.optimizer`. We need a utility that serialises these plus configs to a `.pt` file and writes an entry to `checkpoints/models_registry.json`.

**Step 1: Create `backend/checkpoint_manager.py`**

```python
"""
checkpoint_manager.py — Save/load model checkpoints and manage the registry.
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional

import torch

CHECKPOINTS_DIR = os.path.join(os.path.dirname(__file__), 'checkpoints')
REGISTRY_PATH   = os.path.join(CHECKPOINTS_DIR, 'models_registry.json')


def _ensure_dir():
    os.makedirs(CHECKPOINTS_DIR, exist_ok=True)


def load_registry() -> List[Dict]:
    _ensure_dir()
    if not os.path.exists(REGISTRY_PATH):
        return []
    with open(REGISTRY_PATH, 'r') as f:
        return json.load(f)


def _save_registry(records: List[Dict]):
    _ensure_dir()
    with open(REGISTRY_PATH, 'w') as f:
        json.dump(records, f, indent=2)


def save_checkpoint(
    model,
    optimizer,
    model_config: dict,
    training_config: dict,
    feature_type: str,
    step: int,
    train_loss: Optional[float],
    name: str,
) -> Dict:
    """
    Serialise model + optimizer to disk and record in registry.
    Returns the registry entry dict.
    """
    _ensure_dir()
    record_id  = str(uuid.uuid4())
    filename   = f"{record_id}.pt"
    filepath   = os.path.join(CHECKPOINTS_DIR, filename)

    torch.save({
        'model_state':    model.state_dict(),
        'optimizer_state': optimizer.state_dict(),
        'model_config':   model_config,
        'training_config': training_config,
        'step':           step,
        'train_loss':     train_loss,
    }, filepath)

    entry = {
        'id':           record_id,
        'name':         name,
        'feature_type': feature_type,
        'filename':     filename,
        'step':         step,
        'train_loss':   train_loss,
        'created_at':   datetime.utcnow().isoformat() + 'Z',
    }

    records = load_registry()
    records.append(entry)
    _save_registry(records)
    return entry


def load_checkpoint(record_id: str) -> Optional[Dict]:
    """
    Returns the full checkpoint dict (model_state, optimizer_state, configs, step).
    Returns None if not found.
    """
    records = load_registry()
    entry   = next((r for r in records if r['id'] == record_id), None)
    if not entry:
        return None
    filepath = os.path.join(CHECKPOINTS_DIR, entry['filename'])
    if not os.path.exists(filepath):
        return None
    return torch.load(filepath, map_location='cpu', weights_only=False)


def rename_checkpoint(record_id: str, new_name: str) -> bool:
    records = load_registry()
    for r in records:
        if r['id'] == record_id:
            r['name'] = new_name
            _save_registry(records)
            return True
    return False


def delete_checkpoint(record_id: str) -> bool:
    records = load_registry()
    entry   = next((r for r in records if r['id'] == record_id), None)
    if not entry:
        return False
    filepath = os.path.join(CHECKPOINTS_DIR, entry['filename'])
    if os.path.exists(filepath):
        os.remove(filepath)
    _save_registry([r for r in records if r['id'] != record_id])
    return True
```

**Step 2: Manually test by opening Python REPL in backend dir**

```bash
cd /Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/backend
python3 -c "
from checkpoint_manager import load_registry, _ensure_dir
_ensure_dir()
print('registry:', load_registry())
"
```
Expected: `registry: []` — no error, `checkpoints/` directory created.

**Step 3: Commit**

```bash
git add backend/checkpoint_manager.py
git commit -m "feat: add checkpoint save/load/rename/delete utilities"
```

---

### Task 2: Backend — REST endpoints for model library

**Files:**
- Modify: `backend/app.py` (add 5 routes + import checkpoint_manager)

**Context:** `app.py` already has `manager` (TrainingManager), `socketio`, and the pattern `@app.route('/api/...')`. Active sessions are in `manager.sessions[session_id]`. The trainer stores `session.model_instance` and `session.optimizer` during training.

**Step 1: Add imports + 5 routes to `backend/app.py`**

At the top of `app.py`, after existing imports, add:
```python
import checkpoint_manager as _ckpt
```

Then add these routes (paste after the existing `/api/health` route section):

```python
# ---------------------------------------------------------------------------
# REST: Model Library
# ---------------------------------------------------------------------------

@app.route('/api/models', methods=['GET'])
def list_models():
    return jsonify({'models': _ckpt.load_registry()})


@app.route('/api/models/<session_id>/save', methods=['POST'])
def save_model(session_id):
    body    = request.get_json(force=True) or {}
    name    = body.get('name', 'Untrained Model')
    session = manager.get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    if not session.model_instance or not session.optimizer:
        return jsonify({'error': 'No model in session yet'}), 400

    last_loss = session.loss_history[-1].get('train_loss') if session.loss_history else None
    entry = _ckpt.save_checkpoint(
        model          = session.model_instance,
        optimizer      = session.optimizer,
        model_config   = dict(session.model_config),
        training_config= dict(session.training_config),
        feature_type   = session.feature_type.value,
        step           = session.current_iter,
        train_loss     = last_loss,
        name           = name,
    )
    return jsonify(entry), 201


@app.route('/api/models/<record_id>', methods=['PATCH'])
def rename_model(record_id):
    body     = request.get_json(force=True) or {}
    new_name = body.get('name', '')
    if not new_name.strip():
        return jsonify({'error': 'name required'}), 400
    ok = _ckpt.rename_checkpoint(record_id, new_name.strip())
    if not ok:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'ok': True})


@app.route('/api/models/<record_id>', methods=['DELETE'])
def delete_model(record_id):
    ok = _ckpt.delete_checkpoint(record_id)
    if not ok:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'ok': True})


@app.route('/api/models/<record_id>/load', methods=['POST'])
def load_model_as_session(record_id):
    """
    Load a saved checkpoint into a new in-memory session.
    Returns a session_id the frontend can use with start_training.
    The session is pre-configured with the checkpoint's model/training config.
    The actual weight restoration happens when the trainer starts (see trainer.py Task 3).
    """
    ckpt = _ckpt.load_checkpoint(record_id)
    if not ckpt:
        return jsonify({'error': 'Checkpoint not found'}), 404

    # Build a hyperparameters dict from saved config
    hp = {**ckpt['training_config'], **{
        k: ckpt['model_config'][k]
        for k in ('block_size', 'dropout')
        if k in ckpt['model_config']
    }}
    hp['model_size'] = _infer_model_size(ckpt['model_config'])

    records  = _ckpt.load_registry()
    entry    = next(r for r in records if r['id'] == record_id)
    ft       = entry['feature_type']
    dataset  = ckpt['training_config'].get('dataset_name', 'shakespeare')

    session_id = manager.create_session(
        feature_type   = ft,
        dataset_id     = dataset,
        hyperparameters= hp,
    )
    session = manager.get_session(session_id)
    # Stash checkpoint data so trainer can restore weights on start
    session._resume_checkpoint = ckpt
    session._resume_from_step  = ckpt.get('step', 0)

    return jsonify({
        'session_id':     session_id,
        'model_config':   session.model_config,
        'training_config': session.training_config,
        'resume_step':    ckpt.get('step', 0),
    })


def _infer_model_size(mc: dict) -> str:
    n = mc.get('n_embd', 64)
    if n <= 32:  return 'small'
    if n <= 64:  return 'medium'
    return 'large'
```

**Step 2: Test endpoints with curl (backend must be running)**

```bash
curl http://localhost:5000/api/models
```
Expected: `{"models": []}`

**Step 3: Commit**

```bash
git add backend/app.py
git commit -m "feat: add model library REST endpoints (list/save/rename/delete/load)"
```

---

### Task 3: Backend — trainer loads checkpoint weights on resume

**Files:**
- Modify: `backend/trainer.py` (detect `session._resume_checkpoint` after model construction)

**Context:** `run_training()` in `trainer.py` constructs `model = MicroGPT(session.model_config).to(device)` around line 131. After construction, if `session._resume_checkpoint` exists, load weights and set `session.current_iter`.

**Step 1: Add resume logic in `trainer.py` after model construction**

Find the block after `model = MicroGPT(session.model_config).to(device)` and `session.model_instance = model`. Add immediately after:

```python
        # Restore weights if this session was loaded from a checkpoint
        resume_ckpt = getattr(session, '_resume_checkpoint', None)
        if resume_ckpt:
            model.load_state_dict(resume_ckpt['model_state'])
            # optimizer is built just below — we'll restore it after optimizer init
```

Then after `optimizer = torch.optim.AdamW(...)` and `session.optimizer = optimizer`, add:

```python
        if resume_ckpt:
            try:
                optimizer.load_state_dict(resume_ckpt['optimizer_state'])
            except Exception:
                pass  # optimizer state mismatch is non-fatal
            session.current_iter = getattr(session, '_resume_from_step', 0)
            session._resume_checkpoint = None  # free memory
```

Also update the for loop start to use `session.current_iter`:
```python
    for step in range(session.current_iter, max_iters):
```
(This line likely already exists — verify before editing.)

**Step 2: Commit**

```bash
git add backend/trainer.py
git commit -m "feat: restore model weights from checkpoint on training resume"
```

---

### Task 4: Frontend — ModelContext

**Files:**
- Create: `frontend/src/contexts/ModelContext.jsx`
- Modify: `frontend/src/App.jsx` (wrap with ModelProvider)
- Modify: `frontend/src/utils/apiClient.js` (add model API functions)

**Step 1: Create `frontend/src/contexts/ModelContext.jsx`**

```jsx
import { createContext, useReducer, useEffect } from 'react'
import { listModels } from '../utils/apiClient'

const initialState = {
  models: [],       // array of registry entries from backend
  loading: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODELS':
      return { ...state, models: action.payload, loading: false }
    case 'ADD_MODEL':
      return { ...state, models: [...state.models, action.payload] }
    case 'UPDATE_MODEL': {
      const { id, name } = action.payload
      return {
        ...state,
        models: state.models.map(m => m.id === id ? { ...m, name } : m),
      }
    }
    case 'REMOVE_MODEL':
      return { ...state, models: state.models.filter(m => m.id !== action.payload) }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export const ModelContext = createContext(null)

export function ModelProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load models from backend on mount
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    listModels()
      .then(models => dispatch({ type: 'SET_MODELS', payload: models }))
      .catch(() => dispatch({ type: 'SET_MODELS', payload: [] }))
  }, [])

  return (
    <ModelContext.Provider value={{ state, dispatch }}>
      {children}
    </ModelContext.Provider>
  )
}
```

**Step 2: Add model API functions to `frontend/src/utils/apiClient.js`**

Append after the existing `deleteSession` export:

```js
// ── Models ────────────────────────────────────────────────────────────────────

export async function listModels() {
  const { data } = await api.get('/api/models')
  return data.models
}

export async function saveModel(sessionId, name) {
  const { data } = await api.post(`/api/models/${sessionId}/save`, { name })
  return data
}

export async function renameModel(recordId, name) {
  const { data } = await api.patch(`/api/models/${recordId}`, { name })
  return data
}

export async function deleteModel(recordId) {
  const { data } = await api.delete(`/api/models/${recordId}`)
  return data
}

export async function loadModelAsSession(recordId) {
  const { data } = await api.post(`/api/models/${recordId}/load`)
  return data
}
```

**Step 3: Wrap App with ModelProvider in `frontend/src/App.jsx`**

```jsx
import { ModelProvider } from './contexts/ModelContext'

// Inside App(), wrap existing providers:
return (
  <TrainingProvider>
    <MetricsProvider>
      <ModelProvider>
        <UIProvider>
          ...
        </UIProvider>
      </ModelProvider>
    </MetricsProvider>
  </TrainingProvider>
)
```

**Step 4: Verify frontend still loads**

```bash
# Frontend should be running on port 5173 — open browser, check no console errors
```

**Step 5: Commit**

```bash
git add frontend/src/contexts/ModelContext.jsx frontend/src/utils/apiClient.js frontend/src/App.jsx
git commit -m "feat: add ModelContext and model API client functions"
```

---

### Task 5: Frontend — ModelDropdown in Header

**Files:**
- Create: `frontend/src/components/dashboard/ModelDropdown.jsx`
- Modify: `frontend/src/components/dashboard/Header.jsx`

**Context:** `Header.jsx` renders a flex row with logo on left, status badges on right. We add `ModelDropdown` between the active-sessions badge and the WebSocket dot. The dropdown lists all saved models, lets the user save the current session's model, rename, or delete entries.

**Step 1: Create `frontend/src/components/dashboard/ModelDropdown.jsx`**

```jsx
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

  const [open, setOpen]         = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving]     = useState(false)
  const [renamingId, setRenamingId] = useState(null)
  const [renameVal, setRenameVal]   = useState('')
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Find active session (any running/paused)
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
    if (!renameVal.trim()) return
    try {
      await renameModel(id, renameVal.trim())
      modelDispatch({ type: 'UPDATE_MODEL', payload: { id, name: renameVal.trim() } })
      setRenamingId(null)
    } catch (err) {
      uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
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
        <span>Models {models.length > 0 && `(${models.length})`}</span>
        <svg className={`w-3 h-3 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {/* Save current */}
            {activeSession && (
              <div className="p-3 border-b border-slate-700/60">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Save current model</p>
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
                  <div key={m.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800/50 group">
                    {renamingId === m.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(m.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onBlur={() => handleRename(m.id)}
                        className="flex-1 text-xs bg-slate-800 border border-blue-500 rounded px-2 py-1
                                   text-slate-200 focus:outline-none"
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
```

**Step 2: Add ModelDropdown to `frontend/src/components/dashboard/Header.jsx`**

Import and render in the right-side flex row, before the WebSocket status dot:

```jsx
import ModelDropdown from './ModelDropdown'

// Inside the right-side <div className="flex items-center gap-4 text-sm">:
// Add <ModelDropdown /> before the WebSocket div
```

Full updated `Header.jsx`:
```jsx
import { useContext } from 'react'
import { TrainingContext } from '../../contexts/TrainingContext'
import ModelDropdown from './ModelDropdown'

export default function Header({ connected }) {
  const { state } = useContext(TrainingContext)

  const activeSessions = Object.values(state.sessions).filter(
    s => s.status === 'running' || s.status === 'paused'
  )

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-neural-border bg-neural-surface shrink-0">
      <span
        className="text-xl font-bold text-transparent bg-clip-text select-none"
        style={{ backgroundImage: 'linear-gradient(135deg, #60A5FA 0%, #06B6D4 100%)' }}
      >
        LLMBreaker
      </span>

      <div className="flex items-center gap-4 text-sm">
        {activeSessions.length > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300"
            title={activeSessions.map(s => `${s.sessionId.slice(0, 8)} (${s.status})`).join('\n')}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
            </span>
            <span>{activeSessions.length} training</span>
          </div>
        )}

        <ModelDropdown />

        <div className="flex items-center gap-1.5 text-slate-500">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
          <span className={connected ? 'text-slate-400' : 'text-slate-600'}>
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  )
}
```

**Step 3: Verify in browser — Models dropdown appears, Save input shows when session active**

**Step 4: Commit**

```bash
git add frontend/src/components/dashboard/ModelDropdown.jsx frontend/src/components/dashboard/Header.jsx
git commit -m "feat: add ModelDropdown to header with save/rename/delete"
```

---

### Task 6: Frontend — ScrubBar component

**Files:**
- Create: `frontend/src/components/shared/ScrubBar.jsx`

**Context:** This is a self-contained component that takes `steps` (sorted array of ints), `displayStep` (null = live), and `onDisplayStep` (callback). It renders a range input mapped to the `steps` array and a "Live" button.

**Step 1: Create `frontend/src/components/shared/ScrubBar.jsx`**

```jsx
import { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function ScrubBar({ steps = [], displayStep, onDisplayStep, maxIters }) {
  if (steps.length < 2) return null

  const isLive = displayStep === null
  const currentIdx = useMemo(() => {
    if (isLive) return steps.length - 1
    const idx = steps.indexOf(displayStep)
    return idx >= 0 ? idx : steps.length - 1
  }, [displayStep, steps, isLive])

  function handleChange(e) {
    const idx = Number(e.target.value)
    const step = steps[idx]
    // If user drags to latest, snap back to live
    onDisplayStep(idx === steps.length - 1 ? null : step)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="card py-3 px-4"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 shrink-0 w-20">
          {isLive ? (
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
              Live
            </span>
          ) : (
            <span className="text-slate-300 font-mono">step {displayStep?.toLocaleString()}</span>
          )}
        </span>

        <input
          type="range"
          min={0}
          max={steps.length - 1}
          step={1}
          value={currentIdx}
          onChange={handleChange}
          className="flex-1 h-2 bg-neural-border rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
                     [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
        />

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-600 font-mono w-16 text-right">
            {steps[steps.length - 1]?.toLocaleString()}
          </span>
          {!isLive && (
            <button
              onClick={() => onDisplayStep(null)}
              className="px-2 py-1 text-[10px] rounded border border-cyan-500/40
                         bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              Live
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-slate-700 mt-1 px-24">
        <span>step {steps[0]?.toLocaleString()}</span>
        <span className="text-slate-600">← drag to rewind</span>
        <span>step {steps[steps.length - 1]?.toLocaleString()}</span>
      </div>
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/shared/ScrubBar.jsx
git commit -m "feat: add ScrubBar time-travel component"
```

---

### Task 7: Wire ScrubBar into WatchItLearnTab

**Files:**
- Modify: `frontend/src/components/tabs/WatchItLearnTab.jsx`

**Context:** `WatchItLearnTab` already has `hoverStep` state and passes it to `LossCurveChart`. We add `displayStep` state, derive the unique `steps` array from `lossHistory`, and pass `displayStep` into each visualization.

Visualizations that need updating:
- `LossCurveChart` — add `displayStep` prop to pin crosshair
- `TextProgressionDisplay` — add `displayStep` to highlight matching sample
- `ProbabilityTower` — pass only the token probabilities up to displayStep
- `EmbeddingStarMap` — pass `displayStep`

**Step 1: Update `WatchItLearnTab.jsx`**

Add `displayStep` state (after `hoverStep`):
```jsx
const [displayStep, setDisplayStep] = useState(null)
```

Derive steps array from lossHistory:
```jsx
const steps = useMemo(
  () => (sessionMetrics?.lossHistory ?? []).map(r => r.step),
  [sessionMetrics?.lossHistory]
)
```
Add `import { useMemo } from 'react'` if not already present.

Update the visualizations section:
```jsx
{/* Text progression + Probability tower side by side */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <TextProgressionDisplay
      samples={sessionMetrics?.samples ?? []}
      highlightStep={displayStep ?? hoverStep}
    />
  </div>
  <ProbabilityTower
    tokenProbabilities={
      displayStep
        ? (sessionMetrics?.tokenProbabilities ?? []).filter(p => p.step <= displayStep)
        : (sessionMetrics?.tokenProbabilities ?? [])
    }
    samples={sessionMetrics?.samples ?? []}
  />
</div>

{/* Embedding star map */}
<EmbeddingStarMap
  embeddingSnapshots={sessionMetrics?.embeddingSnapshots ?? []}
  vocabInfo={sessionMetrics?.vocabInfo ?? null}
  displayStep={displayStep}
/>

{/* ScrubBar */}
<ScrubBar
  steps={steps}
  displayStep={displayStep}
  onDisplayStep={setDisplayStep}
  maxIters={maxIters}
/>
```

Add import:
```jsx
import ScrubBar from '../shared/ScrubBar'
```

**Step 2: Add `displayStep` prop to `LossCurveChart` for persistent crosshair**

In `LossCurveChart.jsx`, accept `displayStep` prop and render a vertical reference line at that step. Find where the chart/tooltip is rendered. If using recharts, add:
```jsx
{displayStep !== null && (
  <ReferenceLine x={displayStep} stroke="#60A5FA" strokeDasharray="3 3" strokeOpacity={0.6} />
)}
```

**Step 3: Verify scrub bar appears after training starts and dragging rewinds text samples**

**Step 4: Commit**

```bash
git add frontend/src/components/tabs/WatchItLearnTab.jsx frontend/src/components/shared/LossCurveChart.jsx
git commit -m "feat: wire ScrubBar time-travel into WatchItLearnTab"
```

---

### Task 8: Wire ScrubBar into AttentionCinemaTab

**Files:**
- Modify: `frontend/src/components/tabs/AttentionCinemaTab.jsx`

**Context:** `AttentionCinemaTab` already has `playbackStep` and `PlaybackTimeline`. The `ScrubBar` replaces `PlaybackTimeline` or sits alongside it. Simplest: replace `PlaybackTimeline` with `ScrubBar` (they do the same thing). `displayStep` in this tab = `playbackStep`.

**Step 1: Replace PlaybackTimeline with ScrubBar in `AttentionCinemaTab.jsx`**

Remove `PlaybackTimeline` import and `isPlaying`/`setIsPlaying` state. Add `ScrubBar` import.

Change:
```jsx
{steps.length > 0 && (
  <PlaybackTimeline ... />
)}
```
To:
```jsx
{steps.length > 0 && (
  <ScrubBar
    steps={steps}
    displayStep={playbackStep}
    onDisplayStep={setPlaybackStep}
    maxIters={maxIters}
  />
)}
```

**Step 2: Commit**

```bash
git add frontend/src/components/tabs/AttentionCinemaTab.jsx
git commit -m "feat: replace PlaybackTimeline with ScrubBar in AttentionCinemaTab"
```

---

### Task 9: Add UIContext SHOW_SUCCESS action (if missing)

**Files:**
- Check/Modify: `frontend/src/contexts/UIContext.jsx`

**Context:** `ModelDropdown` dispatches `{ type: 'SHOW_SUCCESS', payload: '...' }`. Verify `UIContext` handles this. If missing, add a `successToast` field and a success toast in Dashboard.

**Step 1: Read UIContext and check for SHOW_SUCCESS**

```bash
cat frontend/src/contexts/UIContext.jsx
```

**Step 2: If missing, add to reducer:**

```jsx
case 'SHOW_SUCCESS': return { ...state, successToast: action.payload }
case 'CLEAR_SUCCESS': return { ...state, successToast: null }
```

And in Dashboard.jsx, add a green toast alongside the existing error toast (copy the pattern, use green colour tokens).

**Step 3: Commit if changed**

```bash
git add frontend/src/contexts/UIContext.jsx frontend/src/components/dashboard/Dashboard.jsx
git commit -m "feat: add success toast to UIContext and Dashboard"
```

---

## Testing Checklist (manual, end-to-end)

1. Start backend (`python app.py`) and frontend (`npm run dev`)
2. Go to Watch It Learn tab, start training
3. Wait 200+ steps — ScrubBar appears at bottom
4. Drag scrubber left — TextProgressionDisplay scrolls to earlier sample, ProbabilityTower shows earlier token probs
5. Click "Live" — snaps back to current step
6. Open Models dropdown in header — "Save current model" input visible
7. Type a name, press Enter — model saved, appears in list
8. Hover model entry — rename (pencil) and delete (trash) icons appear
9. Click pencil → rename inline → Enter confirms
10. Click trash → model removed from list and `checkpoints/` directory
11. Restart backend, refresh frontend → Models dropdown still shows saved model (registry persisted)
12. AttentionCinemaTab — ScrubBar appears, dragging moves attention heatmaps to earlier steps
