# Model Library + Time-Travel Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a model checkpoint system (persist models across restarts, hotswap, rename, delete) and a time-travel scrubber (replay stored metrics at any past step, resume training from saved checkpoints).

**Architecture:**
- Backend: `checkpoints/` directory with `.pt` files + `models_registry.json` for metadata. New REST endpoints for CRUD and checkpoint ops. Trainer emits step-level checkpoints when manually triggered.
- Frontend: `ModelContext` for library state. `ModelDropdown` component in `Header`. `ScrubBar` component rendered at bottom of each tab. Visualizations read from `displayStep` (scrub position) instead of always using latest.

**Tech Stack:** PyTorch `state_dict` serialization, Flask REST, React context, Framer Motion.

---

## Backend

### Checkpoint storage
- `checkpoints/<session_id>_step<N>.pt` — model state_dict + optimizer state_dict + training_config + model_config + step
- `checkpoints/models_registry.json` — list of `{ id, name, feature_type, session_id, checkpoint_path, step, train_loss, created_at }`

### New API endpoints
- `GET /api/models` — list all saved models from registry
- `POST /api/models/<session_id>/save` — save current model state as named checkpoint; body: `{ name }`
- `PATCH /api/models/<model_id>` — rename; body: `{ name }`
- `DELETE /api/models/<model_id>` — remove entry + file
- `POST /api/models/<model_id>/load` — create new session pre-loaded from checkpoint (for hotswap/resume)

### Trainer changes
- `save_checkpoint(session, step, name)` utility in `trainer.py` — serializes model + optimizer + configs
- Socket event `save_checkpoint` emitted from frontend triggers immediate checkpoint save mid-training

---

## Frontend

### ModelContext (`src/contexts/ModelContext.jsx`)
- State: `{ models: [], activeModelId: null }`
- Actions: `LOAD_MODELS`, `ADD_MODEL`, `UPDATE_MODEL`, `REMOVE_MODEL`, `SET_ACTIVE`
- Fetches `/api/models` on mount

### ModelDropdown (`src/components/dashboard/ModelDropdown.jsx`)
- Rendered in `Header` on the right side, before the WebSocket dot
- Button: shows active model name (or "No model saved") with chevron
- Dropdown panel: list of saved models with Load / Rename / Delete actions
- "+ Save current" button (only when a session is active) — prompts for name, calls `/api/models/<sid>/save`

### ScrubBar (`src/components/shared/ScrubBar.jsx`)
- Rendered at bottom of WatchItLearnTab, AttentionCinemaTab (StyleTransferTab has no step-indexed snapshots)
- Only shows when `lossHistory.length > 0`
- Range input mapped to available steps; dragging changes `displayStep` (lifted state in each tab)
- "Live" button (appears when not at latest) snaps back to `displayStep = null`
- If `displayStep` matches a saved checkpoint step, shows "Resume from here" button → calls load endpoint

### Visualization wiring
- `LossCurveChart` — already has `onHoverStep`; add `displayStep` prop to show persistent crosshair
- `TextProgressionDisplay` — add `displayStep` prop to highlight/scroll to matching sample
- `ProbabilityTower` — already shows `tokenProbabilities[last]`; accept `displayStep` to pick matching entry
- `AttentionCinemaTab` — already has `playbackStep`; wire `ScrubBar` into it instead of the existing `PlaybackTimeline` (or keep both)
- `EmbeddingStarMap` — accept `displayStep` to show snapshot nearest to scrub position

---

## UX notes
- Client-side replay is always available (uses stored metrics, no server round-trip)
- Actual model rewind requires a saved checkpoint at that step
- Scrubbing does not pause live training — "Live" button always snaps back
- Model names default to `"Model <N>"`, user can rename inline
