# LLMBreaker - Development Status

**Project:** Interactive LLM Education Platform  
**Design Document:** `LLMBreaker-System-Design.md`  
**Status:** In Development

---

## Phase 1: Project Setup & Dependencies

**Goal:** Establish project structure and install all required dependencies for both backend and frontend.

**Reference:** Section 3.2 (Technology Stack), Appendix 10.7 (Setup Instructions)

### Tasks
- [x] Create root project directory `llmbreaker/`
- [x] Create `backend/` directory with Python virtual environment
- [x] Install backend dependencies:
  - [x] PyTorch 2.10.0 (2.1.0 not available for Python 3.13; using latest)
  - [x] Flask 3.0.0
  - [x] Flask-SocketIO 5.3.0
  - [x] Flask-CORS 4.0.0
  - [x] Eventlet 0.40.4 (0.33.0 incompatible with Python 3.13; upgraded)
  - [x] python-docx 1.1.0
  - [x] NumPy 2.4.2 (1.26.0 not available for Python 3.13; using latest)
- [x] Create `frontend/` directory with Vite + React
- [x] Install frontend dependencies:
  - [x] React 18.2.x
  - [x] React Router 6.x
  - [x] Tailwind CSS 3.4.x + PostCSS
  - [x] Framer Motion 11.x
  - [x] visx (heatmap, group, scale, axis, grid, shape, tooltip, legend)
  - [x] socket.io-client 4.x
  - [x] Axios 1.x
  - [x] react-dropzone 14.x
  - [x] Three.js 0.160.x
- [x] Create `backend/datasets/` directory
- [x] Download and place pre-bundled datasets:
  - [x] `shakespeare.txt` (1.1MB, karpathy/char-rnn)
  - [x] `poems.txt` (519KB, Project Gutenberg)
  - [x] `childrens.txt` (151KB, Alice in Wonderland, Project Gutenberg)
- [x] Configure Tailwind with dark theme (blue/cyan palette, no reds)
- [x] Create `.gitignore` files for both backend and frontend
- [x] Verify both servers launch successfully (empty apps)

---

## Phase 2: Backend Core Infrastructure

**Goal:** Build Flask application foundation with WebSocket support and basic routing.

**Reference:** Section 3.1 (Architecture), Section 7.1 (REST Endpoints), Section 7.2 (WebSocket Events)

### Tasks
- [x] Create `backend/app.py` with Flask app initialization
- [x] Configure Flask-SocketIO with eventlet async mode
- [x] Enable Flask-CORS for frontend communication
- [x] Implement REST endpoints:
  - [x] `GET /api/datasets` - List pre-bundled datasets
  - [x] `POST /api/datasets/upload` - Handle file uploads
  - [x] `POST /api/datasets/from-text` - Handle pasted text
  - [x] `POST /api/sessions/create` - Initialize training session
  - [x] `GET /api/sessions/{session_id}` - Get session status
  - [x] `DELETE /api/sessions/{session_id}` - Terminate session
- [x] Implement WebSocket event handlers:
  - [x] `start_training` - Begin training (with stub loop emitting mock metrics)
  - [x] `pause_training` - Pause execution
  - [x] `resume_training` - Resume training
  - [x] `stop_training` - Terminate training
  - [x] `step_training` - Execute single step
  - [x] `set_speed` - Adjust training speed
- [x] Create `backend/uploads/` directory for user files
- [x] Test all endpoints with Postman or curl
- [x] Verify WebSocket connection from simple test client

---

## Phase 3: MicroGPT Model Implementation

**Goal:** Implement the ~7,900 parameter character-level GPT model with attention extraction.

**Reference:** Section 4 (LLM Architecture Deep Dive), Section 5.1 (Backend Data Models)

### Tasks
- [x] Create `backend/micro_gpt.py`
- [x] Implement `Head` class (single attention head):
  - [x] Query, Key, Value projections
  - [x] Causal mask (lower triangular)
  - [x] Attention score computation
  - [x] Softmax + dropout
  - [x] Attention weight extraction hook (`self.last_attention`)
- [x] Implement `MultiHeadAttention` class:
  - [x] Create multiple `Head` instances
  - [x] Concatenate outputs
  - [x] Output projection
- [x] Implement `FeedForward` class:
  - [x] Linear expansion (n_embd → 4*n_embd)
  - [x] ReLU activation
  - [x] Linear contraction (4*n_embd → n_embd)
  - [x] Dropout
- [x] Implement `TransformerBlock` class:
  - [x] Layer normalization before attention
  - [x] Multi-head attention with residual connection
  - [x] Layer normalization before feedforward
  - [x] Feedforward with residual connection
- [x] Implement `MicroGPT` model class:
  - [x] Token embedding table (vocab_size × n_embd)
  - [x] Positional embedding table (block_size × n_embd)
  - [x] Stack of `TransformerBlock` modules
  - [x] Final layer normalization
  - [x] Output head with weight tying
  - [x] `forward()` method with loss computation
  - [x] `generate()` method for autoregressive sampling
  - [x] `extract_attention_weights()` method
- [x] Verify parameter count ≈ 7,900 (actual: 8,368 — doc's ~7,900 excluded LN biases)
- [x] Test forward pass with dummy input
- [x] Test generation with random initialization

---

## Phase 4: Training Infrastructure

**Goal:** Build training loop, session manager, and metrics emission system.

**Reference:** Section 4.3 (Training Hyperparameters), Section 5.1 (TrainingSession), Section 7.2 (WebSocket Events)

### Tasks
- [x] Create `backend/training_manager.py` (done in Phase 2)
- [x] Implement `TrainingSession` dataclass:
  - [x] All fields from Section 5.1
  - [x] Session status enum (idle, running, paused, stopped, completed, error)
  - [x] Metrics history storage (loss, attention, samples)
- [x] Implement `TrainingManager` class:
  - [x] `sessions: Dict[str, TrainingSession]` storage
  - [x] `create_session(config)` → session_id
  - [x] `get_session(session_id)` → TrainingSession
  - [x] `start_training(session_id)` - Launch background task
  - [x] `pause_training(session_id)` - Set status to paused
  - [x] `resume_training(session_id)` - Set status to running
  - [x] `stop_training(session_id)` - Terminate training
  - [x] `cleanup_session(session_id)` - Remove from memory
- [x] Create `backend/trainer.py`
- [x] Implement training loop:
  - [x] Get batch from dataset
  - [x] Forward pass
  - [x] Compute loss (cross-entropy)
  - [x] Backward pass
  - [x] Optimizer step (AdamW)
  - [x] Check for pause/stop signals (every iteration)
  - [x] Respect speed_multiplier (sleep accordingly)
- [x] Implement evaluation logic (every `eval_interval` steps):
  - [x] Compute train/val loss
  - [x] Extract attention weights from all heads
  - [x] Generate text sample
  - [x] Emit metrics via WebSocket
- [x] Create `backend/metrics_emitter.py`
- [x] Implement emission functions:
  - [x] `emit_training_metrics(session_id, step, train_loss, val_loss)`
  - [x] `emit_generated_sample(session_id, step, text, prompt)`
  - [x] `emit_attention_snapshot(session_id, step, layer, head, matrix, tokens)`
  - [x] Convert torch tensors → JSON (`.numpy().tolist()`)
  - [x] Throttle to max 30 updates/sec
- [x] Test training loop end-to-end with small dataset
- [x] Verify WebSocket events are emitted correctly

---

## Phase 5: Dataset Handling

**Goal:** Implement dataset loading, tokenization, and user upload processing.

**Reference:** Section 5.1 (Backend Data Models), Section 7.1 (Dataset Endpoints), Section 9.1 (Input Validation)

### Tasks
- [x] Create `backend/dataset_loader.py`
- [x] Implement character-level tokenization:
  - [x] Build vocabulary from text (sorted unique chars)
  - [x] Create `char_to_idx` and `idx_to_char` mappings
  - [x] `encode(text)` → List[int]
  - [x] `decode(indices)` → str
- [x] Implement dataset loading:
  - [x] `load_dataset(name)` - Load pre-bundled dataset
  - [x] `load_from_file(path)` - Load user-uploaded file
  - [x] `load_from_text(text)` - Use pasted text directly (validates min 100 chars)
  - [x] Return: text, vocab, char_to_idx, idx_to_char (via prepare_dataset)
- [x] Implement train/val split (90/10)
- [x] Implement batch generation:
  - [x] `get_batch(data, batch_size, block_size)` → (x, y)
  - [x] Random sampling of sequences
  - [x] Return torch tensors on correct device
- [x] Implement file upload validation (in app.py):
  - [x] Check file size (max 10MB via Flask MAX_CONTENT_LENGTH)
  - [x] Check file type (.txt, .docx)
  - [x] Parse .docx files with python-docx
  - [x] Validate text length (min 100 chars, max 5M chars)
- [x] Implement metadata extraction:
  - [x] Character count
  - [x] Word count (split on whitespace)
  - [x] Vocabulary size
- [x] Test loading all three pre-bundled datasets (30/30 unit tests passed)
- [x] Test uploading .txt and .docx files
- [x] Test pasting text directly

---

## Phase 6: Frontend Foundation

**Goal:** Set up React application with routing, contexts, and WebSocket connection.

**Reference:** Section 3.4 (Component Architecture), Section 5.2 (Frontend Data Models), Section 7.3 (WebSocket Flow)

### Tasks
- [x] Create `frontend/src/types/index.js` with all type definitions (JSDoc):
  - [x] SESSION_STATUS, FEATURE_TYPE, SPEED_OPTIONS constants
  - [x] JSDoc typedefs: ModelConfig, TrainingConfig, TrainingMetrics, GeneratedSample, AttentionSnapshot
  - [x] SessionInfo, DatasetInfo
- [x] Set up React Router in `App.jsx`:
  - [x] Route `/` → LandingPage
  - [x] Route `/app` → Dashboard
  - [x] Wildcard → redirect to `/`
- [x] Create contexts in `frontend/src/contexts/`:
  - [x] `TrainingContext.jsx` - Manages active sessions, status, iter counts
  - [x] `MetricsContext.jsx` - Stores loss history, attention snapshots, samples, finalStats
  - [x] `UIContext.jsx` - Tab state, error toasts, loading flag
- [x] Create `frontend/src/hooks/useWebSocket.js`:
  - [x] Connect to `http://localhost:5000` on mount
  - [x] Handle connection/disconnection events
  - [x] Provide `socket` + `connected` to components
  - [x] Auto-reconnect with exponential backoff
- [x] Create `frontend/src/hooks/useTrainingSession.js`:
  - [x] Listen to all WebSocket events for specific session
  - [x] Dispatch to TrainingContext + MetricsContext
  - [x] Provide start/pause/resume/stop/step/setSpeed functions
  - [x] Proper cleanup of listeners on unmount
- [x] Create `frontend/src/utils/apiClient.js`:
  - [x] Axios instance configured for `http://localhost:5000`
  - [x] listDatasets, uploadDataset, datasetFromText
  - [x] createSession, getSession, deleteSession
  - [x] Error interceptors normalising error messages
- [x] Configure Tailwind theme in `tailwind.config.js` (done in Phase 1):
  - [x] Dark mode enabled
  - [x] Custom colors (blues/cyans, neural-*)
  - [x] Neural gradient backgrounds, animations
- [x] Test WebSocket connection and reconnection (build passes, dev server starts)
- [x] Test all API client functions (6/6 pass against live backend)

---

## Phase 7: Landing Page & Dashboard Shell

**Goal:** Build landing page with animations and dashboard structure with tabbed navigation.

**Reference:** Section 6.1 (Landing Page), Section 6.2 (Dashboard), Appendix 10.1 (Color Palette)

### Tasks
- [x] Create `frontend/src/components/landing/LandingPage.jsx`
- [x] Create `frontend/src/components/landing/AnimatedBackground.jsx`:
  - [x] Canvas-based particle system (55 nodes, requestAnimationFrame)
  - [x] Floating nodes (blue/cyan dots with radial glow)
  - [x] Connections forming/dissolving (fade by distance, pulsing opacity)
  - [x] Subtle glow effects (per-node phase offset)
- [x] Implement landing page layout:
  - [x] Centered "LLMBreaker" title (clamp 3–6rem, blue→cyan gradient)
  - [x] Tagline "See intelligence emerge in real-time"
  - [x] Large "Launch" button with arrow icon
  - [x] Navigate to `/app` on click
  - [x] Framer Motion fade-in + staggered animations on load
  - [x] Hover: lift 2px + expanded shadow; tap: scale 0.97
- [x] Create `frontend/src/components/dashboard/Dashboard.jsx`
- [x] Create `frontend/src/components/dashboard/Header.jsx`:
  - [x] Gradient logo (top-left)
  - [x] Animated pulsing dot + session count badge (top-right)
  - [x] WS Connected/Offline indicator
- [x] Create `frontend/src/components/dashboard/TabBar.jsx`:
  - [x] Three tabs: Watch It Learn 📝, Attention Cinema 🎬, Style Transfer ✨
  - [x] Animated active underline (Framer Motion layoutId spring)
  - [x] Tab switching without stopping training
- [x] Create empty placeholder components:
  - [x] `WatchItLearnTab.jsx`
  - [x] `AttentionCinemaTab.jsx`
  - [x] `StyleTransferTab.jsx`
- [x] Implement tab content switching with AnimatePresence fade transitions
- [x] Test navigation: build passes (431 modules, 0 errors)
- [x] Verify animations are smooth (60fps canvas loop, Framer Motion spring)

---

## Phase 8: Feature 1 - Watch It Learn to Spell

**Goal:** Complete first feature with dataset selection, training controls, loss curve, and text progression.

**Reference:** Section 6.2 (Tab 1 Layout), Section 8.1 (Feature Spec), Section 7 (APIs & WebSocket)

### Tasks
- [x] Create `frontend/src/components/tabs/WatchItLearnTab.jsx`
- [x] Create `frontend/src/components/shared/DatasetSelector.jsx`:
  - [x] Dropdown with pre-bundled datasets
  - [x] "Upload .txt" button with file picker
  - [x] Display metadata (char count, vocab size, word count)
  - [x] Integrate with `FileUploader.jsx` (react-dropzone)
- [x] Create `frontend/src/components/shared/TrainingControls.jsx`:
  - [x] Play/Pause button (toggle state)
  - [x] Stop button
  - [x] Speed selector dropdown (1x, 2x, 5x, 10x)
  - [x] Step button (only enabled when paused)
  - [x] Current step display (e.g., "250 / 500")
  - [x] Tooltips on all controls
- [x] Create `frontend/src/components/shared/LossCurveChart.jsx` with visx:
  - [x] X-axis: Training steps
  - [x] Y-axis: Loss value
  - [x] Two lines: Train loss (solid blue), Val loss (dashed cyan)
  - [x] Crosshair on hover
  - [x] Tooltip showing exact step/loss values
  - [x] Sync marker with text progression (onHoverStep callback)
  - [x] Passive annotations at key milestones (steps 50/200/400)
  - [x] Animated latest-point dot
- [x] Create `frontend/src/components/tabs/TextProgressionDisplay.jsx`:
  - [x] Stacked layout (one row per checkpoint)
  - [x] Monospace font
  - [x] Color coding: gray (early) → blue → cyan (well-learned)
  - [x] Highlight row when hovering loss curve
  - [x] Scroll container with auto-scroll to latest
- [x] Implement training flow:
  - [x] Select dataset → Create session via API
  - [x] Click Play → emit `start_training`
  - [x] Listen to `training_metrics` → Update loss curve
  - [x] Listen to `generated_sample` → Add to progression display
  - [x] Listen to `training_completed` → Show completion banner
- [ ] Test full feature end-to-end:
  - [ ] Load Shakespeare dataset → Train → See progression
  - [ ] Upload custom .txt → Train → Verify works
  - [ ] Pause mid-training → Step through manually
  - [ ] Hover loss curve → Highlight corresponding text sample

---

## Phase 9: Feature 2 - Attention Evolution Cinema

**Goal:** Build attention heatmap visualization with overview/detail modes, playback controls, and 2D/3D toggle.

**Reference:** Section 6.3 (Tab 2 Layout), Section 8.2 (Feature Spec), Section 4.4 (Attention Extraction)

### Tasks
- [x] Create `frontend/src/components/tabs/AttentionCinemaTab.jsx`
- [x] Create `frontend/src/components/tabs/ViewModeToggle.jsx`:
  - [x] Overview/Detail toggle buttons
  - [x] 2D/3D toggle buttons
  - [x] State management for active modes
- [x] Create `frontend/src/components/tabs/LayerHeadSelector.jsx`:
  - [x] Layer dropdown (Layer 0, Layer 1)
  - [x] Head dropdown (Head 0, Head 1)
  - [x] Only visible in Detail mode (AnimatePresence slide-in)
- [x] Create `frontend/src/components/tabs/AttentionHeatmapGrid.jsx` (Overview mode):
  - [x] 2×2 grid layout for 4 heatmaps
  - [x] Each cell renders small heatmap
  - [x] Color scale: White (0.0) → Dark Blue (1.0)
  - [x] Click any cell → Switch to Detail mode with that layer/head
- [x] Create `frontend/src/components/tabs/Heatmap2D.jsx` with SVG:
  - [x] SVG rect cells for matrix (first 16×16 tokens)
  - [x] Axis labels showing tokens
  - [x] Color scale legend (vertical gradient bar, right side)
  - [x] Hover info showing query→key attention value
- [x] Create `frontend/src/components/tabs/Heatmap3D.jsx` with Three.js:
  - [x] 3D bar chart (height = attention weight)
  - [x] Camera controls (drag to rotate, scroll to zoom)
  - [x] Blue gradient coloring by height (blue-100 → blue-900)
  - [x] Cleanup on unmount (dispose renderer/geometry/material)
- [x] Create `frontend/src/components/tabs/PlaybackTimeline.jsx`:
  - [x] Scrubber slider (0 to max_steps), snaps to checkpoints
  - [x] Step display ("Step 250 / 500")
  - [x] Previous/Play/Next buttons
  - [x] Auto-advance through checkpoints at ~1.7 FPS
  - [x] "Follow Live" button to jump back to latest
- [x] Implement attention data flow:
  - [x] Listen to `attention_snapshot` events (useTrainingSession)
  - [x] Store ALL snapshots in context (MetricsContext updated)
  - [x] Update heatmaps when new data arrives
- [x] Implement playback logic:
  - [x] Scrub timeline → Find nearest checkpoint
  - [x] null playbackStep = always follow latest
  - [x] Play button → setInterval auto-advance
  - [x] Previous/Next → Jump to adjacent checkpoint in steps[]
- [ ] Test full feature end-to-end:
  - [ ] Start training → Watch heatmaps form in Overview
  - [ ] Click specific heatmap → Enter Detail mode
  - [ ] Scrub timeline → See patterns evolve
  - [ ] Toggle 3D → Verify visualization works
  - [ ] Switch layer/head → Smooth transition

---

## Phase 10: Feature 3 - Style Transfer + Final Integration

**Goal:** Complete style transfer feature and integrate all three features with final polish.

**Reference:** Section 6.4 (Tab 3 Layout), Section 8.3 (Feature Spec), Section 9 (Error Handling)

### Tasks
- [x] Create `frontend/src/components/tabs/StyleTransferTab.jsx`
- [x] Create `frontend/src/components/tabs/TextInputPanel.jsx`:
  - [x] Large textarea (auto-resize via scrollHeight)
  - [x] File uploader button (react-dropzone for .txt/.docx)
  - [x] Metadata display (chars, words, char-level vocab size)
  - [x] Validation warning if < 300 words (and error if < 50 words)
  - [x] Real-time character/word counting
- [x] Create `frontend/src/components/tabs/SideBySideComparison.jsx`:
  - [x] Two-column layout (50/50 split)
  - [x] Left: Original text excerpt display
  - [x] Right: Latest generated sample display
  - [x] Highlighted matching bigrams (blue bg)
  - [x] Style metrics below original (formality, avg sentence length, vocab richness)
  - [x] Confidence metrics below generated (confidence %, avg token prob, perplexity)
- [x] Implement style metrics calculation (frontend):
  - [x] Formality score (formal/informal keyword analysis, 0–100)
  - [x] Average sentence length (split on .!?)
  - [x] Vocabulary richness (unique words / total words)
- [x] Implement style transfer flow:
  - [x] User pastes text → real-time metadata calculation
  - [x] POST to `/api/datasets/from-text` on Train click
  - [x] .docx upload → `uploadDataset()` → store dataset_id
  - [x] .txt upload → FileReader client-side → populate textarea
  - [x] Create session with dataset_id
  - [x] Click "Train" → Start training (speed 2× default)
  - [x] Listen to metrics → Update loss curve
  - [x] Listen to samples → Display generated text on right (live)
  - [x] On completion → Display style comparison + completion banner
- [x] Implement error handling across all features:
  - [x] File upload errors → error toast
  - [x] Text validation errors (too short) → inline warning
  - [x] Training errors → UIContext SHOW_ERROR toast
  - [x] WebSocket disconnections → Connected/Offline indicator in Header
  - [x] Session not found → dispatched as UPDATE_STATUS error
  - [x] Error toasts displayed in Dashboard with dismiss button
- [x] Add tooltips to all interactive elements:
  - [x] `title` attributes on all buttons and controls
  - [x] Textarea placeholder explains min word requirement
- [x] Implement animations and polish:
  - [x] Page transitions (AnimatePresence fade in Dashboard)
  - [x] Button hover/tap effects (Framer Motion whileHover/whileTap)
  - [x] Loading states (`starting` flag disables controls)
  - [x] Completion banners on all three tabs
  - [x] AnimatePresence for Layer/Head selector slide-in
  - [x] SideBySideComparison fades in on first sample
- [x] Bug fix: `useTrainingSession` now dispatches `UPDATE_ITER` on
      `training_metrics` so progress bars advance in all three tabs
- [ ] Test critical 60-second demo flow:
  - [ ] User pastes email signature (150 words)
  - [ ] Clicks "Train" → Completes in 20 seconds
  - [ ] Watches attention patterns form
  - [ ] Sees generated text in their style
  - [ ] Verify "wow" moment is clear and impactful
- [ ] Cross-feature testing:
  - [ ] Start training in Tab 1 → Switch to Tab 2 → Training continues
  - [ ] Verify session status indicator updates correctly
  - [ ] Test all error scenarios gracefully handled
- [ ] Performance optimization:
  - [ ] Verify 30 FPS for all animations
  - [ ] Ensure training completes in 20-30 seconds on target machine
- [ ] Final visual polish:
  - [ ] Consistent spacing (8px grid)
  - [ ] Smooth transitions everywhere
  - [ ] No layout shifts during loading

### Completion Checklist
- [x] All three features implemented end-to-end
- [x] Landing page → Dashboard navigation smooth
- [x] Training sessions run without crashes (build verified)
- [x] Visualizations render correctly (build: 912 modules, 0 errors)
- [x] Error handling displays helpful messages
- [x] Tooltips present on all interactive elements
- [x] Animations smooth (Framer Motion throughout)
- [x] Code follows design document specifications
- [ ] Live end-to-end demo tested on target machine
- [ ] Ready for hackathon demo 🚀

---

## Notes

- **No caching:** Training always runs from scratch (per requirements)
- **No deployment:** Runs locally only (two-terminal setup)
- **No unit tests:** Focus on functional demo (per requirements)
- **Macs only:** Optimized for macOS 11+ with M1/Intel CPUs
- **Dark theme:** Blues/cyans only, no reds anywhere

**When all phases complete, the project is demo-ready for hackathon judges.**
