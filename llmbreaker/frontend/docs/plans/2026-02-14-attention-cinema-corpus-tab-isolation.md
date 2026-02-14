# Attention Cinema Corpus + Tab Isolation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add corpus selection/upload to AttentionCinemaTab, show a model architecture info card, remove the settings gear from that tab, and filter the ModelDropdown to only show models belonging to the currently active tab.

**Architecture:** AttentionCinemaTab gains dataset + text state and passes it to createSession (mirroring WatchItLearnTab). A new shared ModelInfoCard component reads session.modelConfig. ModelDropdown reads ui.activeTab from UIContext to filter its model list by feature_type.

**Tech Stack:** React, existing DatasetSelector + TextInputPanel shared components, UIContext.activeTab, FEATURE_TYPE constants.

---

### Task 1: Add corpus selection to AttentionCinemaTab

**Files:**
- Modify: `frontend/src/components/tabs/AttentionCinemaTab.jsx`

**Context:**
- `AttentionCinemaTab` currently hardcodes `dataset_id: 'shakespeare'` in `handlePlay`
- `DatasetSelector` is already used in `WatchItLearnTab` — import it the same way
- `TextInputPanel` is already used in `StyleTransferTab` for custom text upload
- `uploadDataset` and `datasetFromText` are in `apiClient.js`
- The tab already imports `UIContext` and `useTabPersistence`

**Step 1: Add state variables**

After `const [modelSizeConfig, setModelSizeConfig] = useState('medium')`, add:

```jsx
const [datasetId,   setDatasetId]   = useState('shakespeare')
const [text,        setText]        = useState('')
const [uploadedId,  setUploadedId]  = useState(null)
```

**Step 2: Add to useTabPersistence call**

Add `datasetId`, `text`, `uploadedId` to the state object passed to `useTabPersistence('attention_cinema', {...})`.

**Step 3: Add to the savedState restore useEffect**

Inside the existing savedState useEffect, add:
```jsx
if (savedState.datasetId  !== undefined) setDatasetId(savedState.datasetId)
if (savedState.text       !== undefined) setText(savedState.text)
if (savedState.uploadedId !== undefined) setUploadedId(savedState.uploadedId)
```

**Step 4: Add file upload handler (copy from StyleTransferTab)**

After the existing `handlePlay` function, add:
```jsx
async function handleUploadFile(file) {
  const isTxt  = file.name.toLowerCase().endsWith('.txt')
  const isDocx = file.name.toLowerCase().endsWith('.docx')

  if (isTxt) {
    const reader = new FileReader()
    reader.onload  = (e) => { setText(e.target.result || ''); setUploadedId(null) }
    reader.onerror = () => uiDispatch({ type: 'SHOW_ERROR', payload: 'Failed to read file' })
    reader.readAsText(file, 'utf-8')
  } else if (isDocx) {
    try {
      const { uploadDataset } = await import('../../utils/apiClient')
      const data = await uploadDataset(file)
      setUploadedId(data.dataset_id)
      setText('')
      uiDispatch({ type: 'SHOW_SUCCESS', payload: `✓ ${file.name} uploaded (${data.word_count?.toLocaleString() ?? '?'} words)` })
    } catch (err) {
      uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
    }
  } else {
    uiDispatch({ type: 'SHOW_ERROR', payload: 'Only .txt and .docx files are supported' })
  }
}
```

Actually, `uploadDataset` is already exported from apiClient — import it statically at the top instead:
```jsx
import { createSession, uploadDataset, datasetFromText } from '../../utils/apiClient'
```

**Step 5: Update handlePlay to use corpus state**

Replace the hardcoded `dataset_id: 'shakespeare'` block with:
```jsx
async function handlePlay() {
  if (status === SESSION_STATUS.PAUSED) { controls.resume(); return }

  setStarting(true)
  try {
    let datasetId_resolved = uploadedId
    if (!datasetId_resolved && text.trim()) {
      const dsData = await datasetFromText(text)
      datasetId_resolved = dsData.dataset_id
    }
    if (!datasetId_resolved) {
      datasetId_resolved = datasetId  // built-in dataset id (e.g. 'shakespeare')
    }

    const data = await createSession({
      feature_type: 'attention_cinema',
      dataset_id:   datasetId_resolved,
      hyperparameters: {
        max_iters:      maxItersConfig,
        eval_interval:  evalIntervalConfig,
        model_size:     modelSizeConfig,
      },
    })

    const sid = data.session_id
    setSessionId(sid)
    trainingDispatch({ type: 'CREATE_SESSION', payload: { sessionId: sid, featureType: 'attention_cinema', status: 'idle', modelConfig: data.model_config, trainingConfig: data.training_config } })
    metricsDispatch({ type: 'INIT_SESSION', payload: { sessionId: sid } })

    setTimeout(() => {
      socket?.emit('join_session',   { session_id: sid })
      socket?.emit('start_training', { session_id: sid })
      trainingDispatch({ type: 'SESSION_STARTED', payload: { session_id: sid } })
    }, 50)
  } catch (err) {
    uiDispatch({ type: 'SHOW_ERROR', payload: err.message })
  } finally {
    setStarting(false)
  }
}
```

**Step 6: Add DatasetSelector + TextInputPanel to the JSX**

Add these imports:
```jsx
import DatasetSelector  from '../shared/DatasetSelector'
import TextInputPanel   from './TextInputPanel'
```

In the JSX, replace the existing top-row grid (which currently only has TrainingControls + ViewModeToggle) with a 3-column grid:

```jsx
{/* Top row: corpus + controls + view toggle */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Corpus selector: built-in datasets OR custom text */}
  <div className="flex flex-col gap-3">
    {!text && !uploadedId ? (
      <DatasetSelector
        value={datasetId}
        onChange={setDatasetId}
        onError={(msg) => uiDispatch({ type: 'SHOW_ERROR', payload: msg })}
        disabled={status === SESSION_STATUS.RUNNING || starting}
      />
    ) : (
      <TextInputPanel
        text={text}
        onChange={(v) => { setText(v); setUploadedId(null) }}
        onUploadFile={handleUploadFile}
        disabled={status === SESSION_STATUS.RUNNING || starting}
        placeholder="Paste text or upload a file..."
      />
    )}
    {/* Toggle between built-in and custom */}
    <button
      onClick={() => { setText(''); setUploadedId(null) }}
      disabled={status === SESSION_STATUS.RUNNING || starting}
      className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors self-start disabled:opacity-40"
    >
      {text || uploadedId ? '← use built-in dataset' : 'or paste custom text →'}
    </button>
  </div>

  <TrainingControls
    status={status}
    currentIter={currentIter}
    maxIters={maxIters}
    onPlay={handlePlay}
    onPause={handlePause}
    onStop={handleStop}
    onStep={handleStep}
    speed={speed}
    onSpeedChange={handleSpeed}
    disabled={starting}
    isTraining={status === SESSION_STATUS.RUNNING || status === SESSION_STATUS.PAUSED}
  />

  <ViewModeToggle
    viewMode={viewMode}
    onViewMode={setViewMode}
    renderMode={renderMode}
    onRenderMode={setRenderMode}
  />
</div>
```

Note: `onOpenConfig` is intentionally NOT passed to TrainingControls — this removes the settings gear.

**Step 7: Commit**

```bash
cd /Users/jacobmobin/Documents/GitHub/CTRLHACKDEL
git add llmbreaker/frontend/src/components/tabs/AttentionCinemaTab.jsx
git commit -m "feat: add corpus selection and upload to AttentionCinemaTab, remove settings gear"
```

---

### Task 2: ModelInfoCard shared component

**Files:**
- Create: `frontend/src/components/shared/ModelInfoCard.jsx`
- Modify: `frontend/src/components/tabs/AttentionCinemaTab.jsx`

**Context:**
- When training starts, `session.modelConfig` contains: `n_embd`, `n_layer`, `n_head`, `block_size`, `vocab_size`, `dropout`
- Total params estimate for a GPT: roughly `vocab_size * n_embd * 2 + n_layer * (12 * n_embd^2)` (simplified)
- In AttentionCinemaTab, `session` is `sessionId ? training.sessions[sessionId] : null`
- `session.modelConfig` is available once `CREATE_SESSION` is dispatched

**Step 1: Create `frontend/src/components/shared/ModelInfoCard.jsx`**

```jsx
/**
 * ModelInfoCard — shows architecture summary for an active training session.
 * Props: modelConfig (object with n_embd, n_layer, n_head, block_size, vocab_size, dropout)
 */
export default function ModelInfoCard({ modelConfig }) {
  if (!modelConfig) return null

  const { n_embd = 0, n_layer = 0, n_head = 0, block_size = 0, vocab_size = 0, dropout = 0 } = modelConfig

  // Rough parameter count: embeddings + n_layer * (attn QKV + proj + ff) + lm_head (tied)
  const attn_params  = n_layer * (4 * n_embd * n_embd)          // Q,K,V,proj
  const ff_params    = n_layer * (8 * n_embd * n_embd)          // FFN (4x expand, 4x contract)
  const emb_params   = vocab_size * n_embd                      // token embedding
  const pos_params   = block_size * n_embd                      // positional embedding
  const total_params = attn_params + ff_params + emb_params + pos_params
  const param_label  = total_params >= 1e6
    ? `${(total_params / 1e6).toFixed(2)}M`
    : `${(total_params / 1e3).toFixed(1)}K`

  const stats = [
    { label: 'Layers',      value: n_layer },
    { label: 'Heads',       value: n_head  },
    { label: 'Embed dim',   value: n_embd  },
    { label: 'Context',     value: block_size },
    { label: 'Vocab',       value: vocab_size },
    { label: 'Dropout',     value: dropout.toFixed(2) },
    { label: '~Params',     value: param_label },
  ]

  return (
    <div className="card py-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Model Architecture</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">{label}</span>
            <span className="text-xs font-mono text-slate-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Add ModelInfoCard to AttentionCinemaTab**

Add import:
```jsx
import ModelInfoCard from '../shared/ModelInfoCard'
```

Add after the top-row grid (after the closing `</div>` of the corpus/controls/view grid):
```jsx
{/* Model architecture info */}
<ModelInfoCard modelConfig={session?.modelConfig ?? null} />
```

**Step 3: Commit**

```bash
cd /Users/jacobmobin/Documents/GitHub/CTRLHACKDEL
git add llmbreaker/frontend/src/components/shared/ModelInfoCard.jsx \
        llmbreaker/frontend/src/components/tabs/AttentionCinemaTab.jsx
git commit -m "feat: add ModelInfoCard with architecture stats to AttentionCinemaTab"
```

---

### Task 3: Filter ModelDropdown by active tab

**Files:**
- Modify: `frontend/src/components/dashboard/ModelDropdown.jsx`

**Context:**
- `UIContext` has `ui.activeTab` which is one of `FEATURE_TYPE.WATCH_LEARN | ATTENTION_CINEMA | STYLE_TRANSFER` (strings: `'watch_learn'`, `'attention_cinema'`, `'style_transfer'`)
- `ModelDropdown` already imports `UIContext`
- Each saved model has a `feature_type` string in the registry entry (set by `save_checkpoint`)
- `TrainingContext` sessions have `featureType` (camelCase) — but the model registry uses `feature_type` (snake_case)

**Step 1: Read active tab from UIContext in ModelDropdown**

Add `state: ui` to the UIContext destructure:
```jsx
const { state: ui, dispatch: uiDispatch } = useContext(UIContext)
```

**Step 2: Derive filtered models and matching active session**

Replace:
```jsx
const { models } = modelState
```

With:
```jsx
const currentFeatureType = ui.activeTab  // e.g. 'watch_learn'
const models = modelState.models.filter(m => m.feature_type === currentFeatureType)
```

And for the active session, also scope it to the current tab:
```jsx
const activeSession = Object.values(training.sessions).find(
  s => (s.status === 'running' || s.status === 'paused' || s.status === 'completed')
    && s.featureType === currentFeatureType
)
```

Note: `s.featureType` is the camelCase version stored in TrainingContext via `CREATE_SESSION` payload.

**Step 3: Update placeholder text to reflect current tab**

In the save input placeholder, change from `Model ${models.length + 1}` to:
```jsx
placeholder={`${currentFeatureType.replace('_', ' ')} model ${modelState.models.filter(m => m.feature_type === currentFeatureType).length + 1}`}
```

**Step 4: Commit**

```bash
cd /Users/jacobmobin/Documents/GitHub/CTRLHACKDEL
git add llmbreaker/frontend/src/components/dashboard/ModelDropdown.jsx
git commit -m "feat: filter ModelDropdown to show only models for the active tab"
```
