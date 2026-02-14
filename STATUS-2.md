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
- [ ] Create `backend/app.py` with Flask app initialization
- [ ] Configure Flask-SocketIO with eventlet async mode
- [ ] Enable Flask-CORS for frontend communication
- [ ] Implement REST endpoints:
  - [ ] `GET /api/datasets` - List pre-bundled datasets
  - [ ] `POST /api/datasets/upload` - Handle file uploads
  - [ ] `POST /api/datasets/from-text` - Handle pasted text
  - [ ] `POST /api/sessions/create` - Initialize training session
  - [ ] `GET /api/sessions/{session_id}` - Get session status
  - [ ] `DELETE /api/sessions/{session_id}` - Terminate session
- [ ] Implement WebSocket event handlers:
  - [ ] `start_training` - Begin training
  - [ ] `pause_training` - Pause execution
  - [ ] `resume_training` - Resume training
  - [ ] `stop_training` - Terminate training
  - [ ] `step_training` - Execute single step
  - [ ] `set_speed` - Adjust training speed
- [ ] Create `backend/uploads/` directory for user files
- [ ] Test all endpoints with Postman or curl
- [ ] Verify WebSocket connection from simple test client

---

## Phase 3: MicroGPT Model Implementation

**Goal:** Implement the ~7,900 parameter character-level GPT model with attention extraction.

**Reference:** Section 4 (LLM Architecture Deep Dive), Section 5.1 (Backend Data Models)

### Tasks
- [ ] Create `backend/micro_gpt.py`
- [ ] Implement `Head` class (single attention head):
  - [ ] Query, Key, Value projections
  - [ ] Causal mask (lower triangular)
  - [ ] Attention score computation
  - [ ] Softmax + dropout
  - [ ] Attention weight extraction hook (`self.last_attention`)
- [ ] Implement `MultiHeadAttention` class:
  - [ ] Create multiple `Head` instances
  - [ ] Concatenate outputs
  - [ ] Output projection
- [ ] Implement `FeedForward` class:
  - [ ] Linear expansion (n_embd → 4*n_embd)
  - [ ] ReLU activation
  - [ ] Linear contraction (4*n_embd → n_embd)
  - [ ] Dropout
- [ ] Implement `TransformerBlock` class:
  - [ ] Layer normalization before attention
  - [ ] Multi-head attention with residual connection
  - [ ] Layer normalization before feedforward
  - [ ] Feedforward with residual connection
- [ ] Implement `MicroGPT` model class:
  - [ ] Token embedding table (vocab_size × n_embd)
  - [ ] Positional embedding table (block_size × n_embd)
  - [ ] Stack of `TransformerBlock` modules
  - [ ] Final layer normalization
  - [ ] Output head with weight tying
  - [ ] `forward()` method with loss computation
  - [ ] `generate()` method for autoregressive sampling
  - [ ] `extract_attention_weights()` method
- [ ] Verify parameter count ≈ 7,900 with `sum(p.numel() for p in model.parameters())`
- [ ] Test forward pass with dummy input
- [ ] Test generation with random initialization

---

## Phase 4: Training Infrastructure

**Goal:** Build training loop, session manager, and metrics emission system.

**Reference:** Section 4.3 (Training Hyperparameters), Section 5.1 (TrainingSession), Section 7.2 (WebSocket Events)

### Tasks
- [ ] Create `backend/training_manager.py`
- [ ] Implement `TrainingSession` dataclass:
  - [ ] All fields from Section 5.1
  - [ ] Session status enum (idle, running, paused, stopped, completed, error)
  - [ ] Metrics history storage (loss, attention, samples)
- [ ] Implement `TrainingManager` class:
  - [ ] `sessions: Dict[str, TrainingSession]` storage
  - [ ] `create_session(config)` → session_id
  - [ ] `get_session(session_id)` → TrainingSession
  - [ ] `start_training(session_id)` - Launch background task
  - [ ] `pause_training(session_id)` - Set status to paused
  - [ ] `resume_training(session_id)` - Set status to running
  - [ ] `stop_training(session_id)` - Terminate training
  - [ ] `cleanup_session(session_id)` - Remove from memory
- [ ] Create `backend/trainer.py`
- [ ] Implement training loop:
  - [ ] Get batch from dataset
  - [ ] Forward pass
  - [ ] Compute loss (cross-entropy)
  - [ ] Backward pass
  - [ ] Optimizer step (AdamW)
  - [ ] Check for pause/stop signals (every iteration)
  - [ ] Respect speed_multiplier (sleep accordingly)
- [ ] Implement evaluation logic (every `eval_interval` steps):
  - [ ] Compute train/val loss
  - [ ] Extract attention weights from all heads
  - [ ] Generate text sample
  - [ ] Emit metrics via WebSocket
- [ ] Create `backend/metrics_emitter.py`
- [ ] Implement emission functions:
  - [ ] `emit_training_metrics(session_id, step, train_loss, val_loss)`
  - [ ] `emit_generated_sample(session_id, step, text, prompt)`
  - [ ] `emit_attention_snapshot(session_id, step, layer, head, matrix, tokens)`
  - [ ] Convert torch tensors → JSON (`.numpy().tolist()`)
  - [ ] Throttle to max 30 updates/sec
- [ ] Test training loop end-to-end with small dataset
- [ ] Verify WebSocket events are emitted correctly

---

## Phase 5: Dataset Handling

**Goal:** Implement dataset loading, tokenization, and user upload processing.

**Reference:** Section 5.1 (Backend Data Models), Section 7.1 (Dataset Endpoints), Section 9.1 (Input Validation)

### Tasks
- [ ] Create `backend/dataset_loader.py`
- [ ] Implement character-level tokenization:
  - [ ] Build vocabulary from text (sorted unique chars)
  - [ ] Create `char_to_idx` and `idx_to_char` mappings
  - [ ] `encode(text)` → List[int]
  - [ ] `decode(indices)` → str
- [ ] Implement dataset loading:
  - [ ] `load_dataset(name)` - Load pre-bundled dataset
  - [ ] `load_from_file(path)` - Load user-uploaded file
  - [ ] `load_from_text(text)` - Use pasted text directly
  - [ ] Return: text, vocab, char_to_idx, idx_to_char
- [ ] Implement train/val split (90/10)
- [ ] Implement batch generation:
  - [ ] `get_batch(split, batch_size, block_size)` → (x, y)
  - [ ] Random sampling of sequences
  - [ ] Return torch tensors on correct device
- [ ] Implement file upload validation:
  - [ ] Check file size (max 10MB)
  - [ ] Check file type (.txt, .docx)
  - [ ] Parse .docx files with python-docx
  - [ ] Validate text length (min 100 chars, max 5M chars)
- [ ] Implement metadata extraction:
  - [ ] Character count
  - [ ] Word count (split on whitespace)
  - [ ] Vocabulary size
- [ ] Test loading all three pre-bundled datasets
- [ ] Test uploading .txt and .docx files
- [ ] Test pasting text directly

---

## Phase 6: Frontend Foundation

**Goal:** Set up React application with routing, contexts, and WebSocket connection.

**Reference:** Section 3.4 (Component Architecture), Section 5.2 (Frontend Data Models), Section 7.3 (WebSocket Flow)

### Tasks
- [ ] Create `frontend/src/types/index.ts` with all TypeScript interfaces:
  - [ ] SessionStatus, FeatureType enums
  - [ ] ModelConfig, TrainingConfig, TrainingMetrics, GeneratedSample, AttentionSnapshot interfaces
  - [ ] SessionInfo, DatasetInfo, SessionConfig, StyleMetrics, ConfidenceMetrics
- [ ] Set up React Router in `App.jsx`:
  - [ ] Route `/` → LandingPage
  - [ ] Route `/app` → Dashboard
- [ ] Create contexts in `frontend/src/contexts/`:
  - [ ] `TrainingContext.jsx` - Manages active sessions, status
  - [ ] `MetricsContext.jsx` - Stores loss history, attention data, samples
  - [ ] `UIContext.jsx` - Tab state, modals, tooltips
- [ ] Create `frontend/src/hooks/useWebSocket.ts`:
  - [ ] Connect to `ws://localhost:5000` on mount
  - [ ] Handle connection/disconnection events
  - [ ] Provide `socket` instance to components
  - [ ] Auto-reconnect on disconnect
- [ ] Create `frontend/src/hooks/useTrainingSession.ts`:
  - [ ] Listen to WebSocket events for specific session
  - [ ] Update contexts with metrics/samples/attention
  - [ ] Provide control functions (start, pause, stop, step)
  - [ ] Handle errors and status changes
- [ ] Create `frontend/src/utils/apiClient.ts`:
  - [ ] Axios instance configured for `http://localhost:5000`
  - [ ] Functions for all REST endpoints
  - [ ] Error interceptors
- [ ] Configure Tailwind theme in `tailwind.config.js`:
  - [ ] Dark mode enabled
  - [ ] Custom colors (blues/cyans, no reds)
  - [ ] Extend with neural gradient backgrounds
- [ ] Test WebSocket connection and reconnection
- [ ] Test all API client functions

---

## Phase 7: Landing Page & Dashboard Shell

**Goal:** Build landing page with animations and dashboard structure with tabbed navigation.

**Reference:** Section 6.1 (Landing Page), Section 6.2 (Dashboard), Appendix 10.1 (Color Palette)

### Tasks
- [ ] Create `frontend/src/components/landing/LandingPage.jsx`
- [ ] Create `frontend/src/components/landing/AnimatedBackground.jsx`:
  - [ ] Canvas-based particle system
  - [ ] Floating nodes (blue/cyan dots)
  - [ ] Connections forming/dissolving between nodes
  - [ ] Subtle glow effects
- [ ] Implement landing page layout:
  - [ ] Centered "LLMBreaker" title (96px, gradient text)
  - [ ] Tagline "See intelligence emerge in real-time"
  - [ ] Large "Launch" button
  - [ ] Navigate to `/app` on click
  - [ ] Fade-in animation on load
- [ ] Create `frontend/src/components/dashboard/Dashboard.jsx`
- [ ] Create `frontend/src/components/dashboard/Header.jsx`:
  - [ ] Small logo (top-left)
  - [ ] Session status indicator (top-right)
  - [ ] Tooltip showing active sessions
- [ ] Create `frontend/src/components/dashboard/TabBar.jsx`:
  - [ ] Three tabs: Watch It Learn, Attention Cinema, Style Transfer
  - [ ] Icons: 📝, 🎬, ✨
  - [ ] Active state (underline + brighter color)
  - [ ] Tab switching without stopping training
- [ ] Create empty placeholder components:
  - [ ] `WatchItLearnTab.jsx`
  - [ ] `AttentionCinemaTab.jsx`
  - [ ] `StyleTransferTab.jsx`
- [ ] Implement tab content switching in Dashboard
- [ ] Test navigation: Landing → Dashboard → Tab switching
- [ ] Verify animations are smooth (60fps)

---

## Phase 8: Feature 1 - Watch It Learn to Spell

**Goal:** Complete first feature with dataset selection, training controls, loss curve, and text progression.

**Reference:** Section 6.2 (Tab 1 Layout), Section 8.1 (Feature Spec), Section 7 (APIs & WebSocket)

### Tasks
- [ ] Create `frontend/src/components/tabs/WatchItLearnTab.jsx`
- [ ] Create `frontend/src/components/shared/DatasetSelector.jsx`:
  - [ ] Dropdown with pre-bundled datasets
  - [ ] "Upload .txt" button with file picker
  - [ ] Display metadata (char count, vocab size, word count)
  - [ ] Integrate with `FileUploader.jsx` (react-dropzone)
- [ ] Create `frontend/src/components/shared/TrainingControls.jsx`:
  - [ ] Play/Pause button (toggle state)
  - [ ] Stop button
  - [ ] Speed selector dropdown (1x, 2x, 5x, 10x)
  - [ ] Step button (only enabled when paused)
  - [ ] Current step display (e.g., "250 / 500")
  - [ ] Tooltips on all controls
- [ ] Create `frontend/src/components/shared/LossCurveChart.jsx` with visx:
  - [ ] X-axis: Training steps
  - [ ] Y-axis: Loss value (log scale)
  - [ ] Two lines: Train loss (solid blue), Val loss (dashed cyan)
  - [ ] Crosshair on hover
  - [ ] Tooltip showing exact step/loss values
  - [ ] Sync marker with text progression (vertical line)
  - [ ] Passive annotations at key milestones
  - [ ] Framer Motion for animating new points
- [ ] Create `frontend/src/components/tabs/TextProgressionDisplay.jsx`:
  - [ ] Stacked layout (one row per checkpoint)
  - [ ] Monospace font (14px)
  - [ ] Color coding: gray (wrong) → blue (correct)
  - [ ] Highlight row when hovering loss curve
  - [ ] Scroll container for many samples
- [ ] Implement training flow:
  - [ ] Select dataset → Create session via API
  - [ ] Click Play → emit `start_training`
  - [ ] Listen to `training_metrics` → Update loss curve
  - [ ] Listen to `generated_sample` → Add to progression display
  - [ ] Listen to `training_completed` → Show completion state
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
- [ ] Create `frontend/src/components/tabs/AttentionCinemaTab.jsx`
- [ ] Create `frontend/src/components/tabs/ViewModeToggle.jsx`:
  - [ ] Overview/Detail radio buttons
  - [ ] 2D/3D toggle buttons
  - [ ] State management for active modes
- [ ] Create `frontend/src/components/tabs/LayerHeadSelector.jsx`:
  - [ ] Layer dropdown (Layer 0, Layer 1)
  - [ ] Head dropdown (Head 0, Head 1)
  - [ ] Only visible in Detail mode
- [ ] Create `frontend/src/components/tabs/AttentionHeatmapGrid.jsx` (Overview mode):
  - [ ] 2×2 grid layout for 4 heatmaps
  - [ ] Each cell renders small heatmap (200×200px)
  - [ ] Color scale: White (0.0) → Dark Blue (1.0)
  - [ ] Click any cell → Switch to Detail mode with that layer/head
- [ ] Create `frontend/src/components/tabs/Heatmap2D.jsx` with visx:
  - [ ] HeatmapRect component for matrix cells
  - [ ] Axis labels showing tokens
  - [ ] Color scale legend (vertical bar, right side)
  - [ ] Hover tooltip with exact attention weight
  - [ ] Framer Motion for smooth color transitions
- [ ] Create `frontend/src/components/tabs/Heatmap3D.jsx` with Three.js:
  - [ ] 3D bar chart (height = attention weight)
  - [ ] Camera controls (drag to rotate, scroll to zoom)
  - [ ] Blue gradient coloring by height
  - [ ] Fallback message if WebGL unavailable
- [ ] Create `frontend/src/components/tabs/PlaybackTimeline.jsx`:
  - [ ] Scrubber slider (0 to max_steps)
  - [ ] Step display ("Step 250 / 500")
  - [ ] Previous/Play/Next buttons
  - [ ] Auto-advance on Play (10 FPS default)
  - [ ] Smooth interpolation between checkpoints
- [ ] Implement attention data flow:
  - [ ] Listen to `attention_snapshot` events
  - [ ] Group by step, layer, head
  - [ ] Store in context (attention_snapshots state)
  - [ ] Update heatmaps when new data arrives
- [ ] Implement playback logic:
  - [ ] Scrub timeline → Find nearest checkpoint
  - [ ] Interpolate between checkpoints for smooth animation
  - [ ] Play button → Auto-advance at configurable FPS
  - [ ] Previous/Next → Jump ±50 steps
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
- [ ] Create `frontend/src/components/tabs/StyleTransferTab.jsx`
- [ ] Create `frontend/src/components/tabs/TextInputPanel.jsx`:
  - [ ] Large textarea (auto-resize, 10 rows default)
  - [ ] File uploader button (react-dropzone for .txt/.docx)
  - [ ] Metadata display (chars, words, vocab)
  - [ ] Validation warning if < 300 words
  - [ ] Real-time character/word counting
- [ ] Create `frontend/src/components/tabs/SideBySideComparison.jsx`:
  - [ ] Two-column layout (50/50 split)
  - [ ] Left: Original text sample display
  - [ ] Right: Generated text display
  - [ ] Highlighted matching phrases (blue)
  - [ ] Style metrics below original (formality, avg sentence length, vocab richness)
  - [ ] Confidence metrics below generated (avg token prob, perplexity)
- [ ] Implement style metrics calculation (frontend):
  - [ ] Formality score (keyword analysis)
  - [ ] Average sentence length
  - [ ] Vocabulary richness (unique/total)
- [ ] Implement style transfer flow:
  - [ ] User pastes text → Calculate metadata
  - [ ] POST to `/api/datasets/from-text`
  - [ ] Create session with dataset_id
  - [ ] Click "Train" → Start training (speed 2x default)
  - [ ] Listen to metrics → Update loss curve
  - [ ] Listen to samples → Display generated text on right
  - [ ] On completion → Display style comparison
- [ ] Implement error handling across all features:
  - [ ] File upload errors (size, type, parsing)
  - [ ] Text validation errors (too short/long)
  - [ ] Training crashes (OOM, invalid input)
  - [ ] WebSocket disconnections
  - [ ] Session not found errors
  - [ ] Display error toasts with clear messages (Section 9.3)
- [ ] Add tooltips to all interactive elements:
  - [ ] Use consistent styling (dark background, white text)
  - [ ] Position intelligently (avoid off-screen)
  - [ ] Reference Section 8 for tooltip text
- [ ] Implement animations and polish:
  - [ ] Page transitions (fade in/out)
  - [ ] Button hover effects (lift 2px, shadow expand)
  - [ ] Loading states (spinners during API calls)
  - [ ] Success states (checkmarks on completion)
  - [ ] Smooth scrolling in long text areas
- [ ] Test critical 60-second demo flow:
  - [ ] User pastes email signature (150 words)
  - [ ] Clicks "Train" → Completes in 20 seconds
  - [ ] Watches attention patterns form
  - [ ] Sees generated text in their style
  - [ ] Verify "wow" moment is clear and impactful
- [ ] Cross-feature testing:
  - [ ] Start training in Tab 1 → Switch to Tab 2 → Training continues
  - [ ] Run multiple sessions simultaneously (if implemented)
  - [ ] Verify session status indicator updates correctly
  - [ ] Test all error scenarios gracefully handled
- [ ] Performance optimization:
  - [ ] Verify 30 FPS for all animations
  - [ ] Check WebSocket latency < 50ms
  - [ ] Ensure training completes in 20-30 seconds on target machine
  - [ ] Optimize re-renders (React.memo on expensive components)
- [ ] Final visual polish:
  - [ ] Consistent spacing (8px grid)
  - [ ] Proper color contrast (WCAG AA)
  - [ ] Smooth transitions everywhere
  - [ ] No layout shifts during loading
  - [ ] Responsive behavior (though desktop-focused)

### Completion Checklist
- [ ] All three features work end-to-end
- [ ] Landing page → Dashboard navigation smooth
- [ ] Training sessions run without crashes
- [ ] Visualizations render correctly
- [ ] Error handling displays helpful messages
- [ ] Tooltips present on all interactive elements
- [ ] Animations smooth at 60 FPS
- [ ] Code follows design document specifications
- [ ] Ready for hackathon demo 🚀

---

## Notes

- **No caching:** Training always runs from scratch (per requirements)
- **No deployment:** Runs locally only (two-terminal setup)
- **No unit tests:** Focus on functional demo (per requirements)
- **Macs only:** Optimized for macOS 11+ with M1/Intel CPUs
- **Dark theme:** Blues/cyans only, no reds anywhere

**When all phases complete, the project is demo-ready for hackathon judges.**
