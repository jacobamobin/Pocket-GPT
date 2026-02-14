# LLMBreaker - Complete Software Design Document

**Version:** 1.0  
**Date:** February 13, 2026  
**Project Type:** Interactive LLM Education Platform  
**Target Platform:** macOS (Local Application)  
**Tagline:** *"See intelligence emerge in real-time"*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Requirements](#2-product-requirements)
3. [System Architecture](#3-system-architecture)
4. [LLM Architecture Deep Dive](#4-llm-architecture-deep-dive)
5. [Data Models & Storage](#5-data-models--storage)
6. [Screen Structure & Visual Layouts](#6-screen-structure--visual-layouts)
7. [Routes, APIs & WebSocket Events](#7-routes-apis--websocket-events)
8. [Detailed Feature Specifications](#8-detailed-feature-specifications)
9. [Error Handling & Validation](#9-error-handling--validation)
10. [Appendices](#10-appendices)

---

## 1. Executive Summary

### 1.1 Project Name & Purpose

**LLMBreaker** is an interactive educational platform that demystifies transformer-based language models through real-time training visualization. Users witness neural networks learning from scratch, observe attention patterns evolving, and experiment with style transfer—all within 20-30 seconds.

### 1.2 The Problem

**78% of AI users have zero understanding of how language models work internally.**

Current education suffers from:
- 🔒 **Black Box Problem:** No visibility into model internals during training
- 📚 **Static Textbooks:** Dense math equations without interactive exploration
- 🔌 **Disconnect:** Cannot experiment with architectural decisions in real-time

### 1.3 The Solution

Three integrated experiences that make LLM training **tangible and visual**:

1. **Watch It Learn to Spell**  
   Time-lapse showing progression: `"xkqz mmm"` → `"the cat sat on the mat"`

2. **Attention Evolution Cinema**  
   Animated heatmaps showing attention patterns forming from random noise to structured relationships

3. **Style Transfer Speed Run**  
   Train on user's writing (emails, essays) → Generate new text in their style

### 1.4 Target Audience

| Audience | Use Case |
|----------|----------|
| **Hackathon Judges** | Technical evaluation, demo impact |
| **CS Students** | Learning transformers beyond textbook theory |
| **ML Educators** | Interactive teaching tool for workshops |
| **AI Enthusiasts** | Understanding ChatGPT mechanics |

### 1.5 Key Value Propositions

✅ **Instant Understanding:** Reduce LLM learning curve from weeks to hours  
✅ **Tactile Interaction:** Toggle architecture components, see training change  
✅ **Personal Engagement:** Train on your own writing  
✅ **Zero Friction:** Runs entirely locally, no deployment

---

## 2. Product Requirements

### 2.1 Functional Requirements

#### FR-1: Real-Time Training Visualization
- **FR-1.1:** Display live loss curves (train + validation) updating every 50 steps
- **FR-1.2:** Stream generated text samples at configurable checkpoints
- **FR-1.3:** Show character-level progression from gibberish → coherent text
- **FR-1.4:** Support controls: Play, Pause, Stop, Speed (1x/2x/5x/10x), Step-by-step

#### FR-2: Attention Pattern Visualization
- **FR-2.1:** Render 2D attention heatmaps with blue gradient (white=0.0, dark blue=1.0)
- **FR-2.2:** Support layer/head selection via dropdowns
- **FR-2.3:** Display grid overview showing all layers × heads simultaneously
- **FR-2.4:** Animate smooth transitions between training checkpoints (Framer Motion)
- **FR-2.5:** Optional 3D bar chart visualization mode (Three.js)
- **FR-2.6:** Timeline scrubber for playback control

#### FR-3: Style Transfer
- **FR-3.1:** Accept text input via textarea (paste) or file upload (.txt, .docx)
- **FR-3.2:** Train micro-model on user corpus (300-1000 words)
- **FR-3.3:** Generate text samples in learned style
- **FR-3.4:** Side-by-side comparison with style metrics

#### FR-4: Dataset Management
- **FR-4.1:** Pre-bundle datasets: Shakespeare, Poems, Children's Books
- **FR-4.2:** User file upload support (.txt, .docx)
- **FR-4.3:** Display metadata: character count, vocabulary size, word count

#### FR-5: Multi-Session Support
- **FR-5.1:** Run multiple training sessions concurrently
- **FR-5.2:** Switch between features without stopping training (sessions continue in background)
- **FR-5.3:** Session status indicators in header

#### FR-6: Landing Page
- **FR-6.1:** Animated neural network background (particle effects)
- **FR-6.2:** Branding: "LLMBreaker" logo + tagline
- **FR-6.3:** Single "Launch" button → Main app
- **FR-6.4:** No authentication/sign-up

### 2.2 Non-Functional Requirements

#### NFR-1: Performance
- **NFR-1.1:** Train ~8K parameter model in 20-30 seconds (500 iterations, CPU)
- **NFR-1.2:** Maintain 30 FPS for heatmap animations
- **NFR-1.3:** WebSocket latency < 50ms for metric streaming
- **NFR-1.4:** Smooth UI rendering even during training (no blocking)

#### NFR-2: Usability
- **NFR-2.1:** Tooltips on all interactive elements
- **NFR-2.2:** Passive educational annotations on charts (subtle)
- **NFR-2.3:** No onboarding tutorial (demo-driven interface)
- **NFR-2.4:** Monospace fonts for generated text (character alignment)

#### NFR-3: Reliability
- **NFR-3.1:** Graceful failure when input exceeds memory
- **NFR-3.2:** Training crash recovery (allow restart without page reload)
- **NFR-3.3:** No caching (always train from scratch)

#### NFR-4: Compatibility
- **NFR-4.1:** Run on macOS 11+ with Python 3.9+ and Node 18+
- **NFR-4.2:** Two-terminal launch (manual `python app.py` + `npm start`)
- **NFR-4.3:** No deployment infrastructure

### 2.3 Success Criteria

**Critical 60-Second Demo Flow:**
1. User pastes email signature (150 words)
2. Clicks "Train" → Training completes in 20 seconds
3. Watches attention patterns form in real-time
4. Sees AI-generated text in their style
5. **Judge Reaction:** "Wow, it learned my style!"

**Metrics:**
- ✅ Demo runs without crashes
- ✅ Judges express "aha moment" during attention animation
- ✅ Architecture survives technical Q&A
- ✅ Judges request to try it themselves

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                             │
│                  React 18 + Vite (localhost:3000)                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│  │  Landing    │   │  Dashboard  │   │   Tabs:     │            │
│  │   Page      │──▶│   (Main     │──▶│  1. Watch   │            │
│  │  (Route /)  │   │    App)     │   │  2. Cinema  │            │
│  │             │   │ (Route /app)│   │  3. Style   │            │
│  └─────────────┘   └─────────────┘   └─────────────┘            │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │         VISUALIZATION ENGINE (Client-Side)                │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  • visx 3.x         → Heatmaps, line charts, scales      │    │
│  │  • Framer Motion    → Smooth animations, transitions     │    │
│  │  • Tailwind CSS     → Dark theme, utility-first styling  │    │
│  │  • Three.js (opt)   → 3D attention visualization         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │      STATE MANAGEMENT (React Context + useReducer)        │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  • TrainingContext   → Active sessions, status           │    │
│  │  • MetricsContext    → Loss history, attention data      │    │
│  │  • UIContext         → Tab state, modals, tooltips       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │         WEBSOCKET CLIENT (socket.io-client 4.x)           │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  Connection: ws://localhost:5000                          │    │
│  │                                                            │    │
│  │  Receives:                    Sends:                      │    │
│  │  • training_metrics           • start_training            │    │
│  │  • generated_sample           • pause_training            │    │
│  │  • attention_snapshot         • stop_training             │    │
│  │  • training_completed         • step_training             │    │
│  │  • error                      • set_speed                 │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ WebSocket (Socket.IO)
                         │ HTTP REST (Axios)
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                      BACKEND LAYER                              │
│              Flask 3.x + PyTorch 2.x (localhost:5000)           │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Flask Application (app.py)                    │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Flask-SocketIO 5.x  → WebSocket server + rooms      │    │
│  │  • Flask-CORS 4.x      → Cross-origin handling         │    │
│  │  • Eventlet 0.33.x     → Async task management         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      Training Manager (training_manager.py)             │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  sessions: Dict[UUID, TrainingSession]                  │    │
│  │                                                          │    │
│  │  Methods:                                                │    │
│  │  • create_session(config) → session_id                  │    │
│  │  • start_training(session_id)                           │    │
│  │  • pause_training(session_id)                           │    │
│  │  • stop_training(session_id)                            │    │
│  │  • step_training(session_id)                            │    │
│  │  • cleanup_session(session_id)                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Micro-GPT Model (micro_gpt.py)                  │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  Architecture: Character-level GPT                      │    │
│  │  Parameters: ~7,900                                      │    │
│  │                                                          │    │
│  │  Config:                                                 │    │
│  │  • vocab_size: 65                                        │    │
│  │  • n_embd: 16                                            │    │
│  │  • n_layer: 2                                            │    │
│  │  • n_head: 2                                             │    │
│  │  • block_size: 64                                        │    │
│  │  • dropout: 0.0                                          │    │
│  │  • weight_tying: True                                    │    │
│  │                                                          │    │
│  │  Components (detailed in Section 4):                    │    │
│  │  • Token Embeddings                                      │    │
│  │  • Positional Embeddings                                 │    │
│  │  • Transformer Blocks (2x)                               │    │
│  │  • Layer Normalization                                   │    │
│  │  • Output Head (tied to embeddings)                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       Training Loop (trainer.py)                        │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • AdamW optimizer (lr=1e-3)                            │    │
│  │  • Cosine LR decay with warmup                          │    │
│  │  • Batch size: 32                                        │    │
│  │  • Max iterations: 500                                   │    │
│  │  • Eval interval: 50 steps                               │    │
│  │                                                          │    │
│  │  Hooks:                                                  │    │
│  │  • on_step_complete() → emit metrics via WebSocket      │    │
│  │  • extract_attention() → save to snapshots              │    │
│  │  • generate_sample() → emit to client                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      Dataset Loader (dataset_loader.py)                 │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  Pre-bundled datasets:                                   │    │
│  │  • shakespeare.txt   (1.1M chars, vocab=65)             │    │
│  │  • poems.txt         (45K chars, vocab=58)              │    │
│  │  • childrens.txt     (120K chars, vocab=52)             │    │
│  │                                                          │    │
│  │  User uploads:                                           │    │
│  │  • Accepts .txt, .docx                                   │    │
│  │  • Character-level tokenization                          │    │
│  │  • Vocabulary extraction                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      Metrics Emitter (metrics_emitter.py)               │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Converts torch tensors → JSON                        │    │
│  │  • Throttles to 30 updates/sec max                      │    │
│  │  • Broadcasts to Socket.IO rooms                        │    │
│  │  • Handles numpy serialization                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                   FILE SYSTEM (No Database)                     │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  backend/                                                        │
│  ├── datasets/                                                   │
│  │   ├── shakespeare.txt                                         │
│  │   ├── poems.txt                                               │
│  │   ├── childrens.txt                                           │
│  │   └── uploads/                (user files, ephemeral)        │
│  │       └── <uuid>.txt                                          │
│  │                                                                │
│  ├── checkpoints/                (optional temp storage)         │
│  │   └── session_<uuid>/                                         │
│  │       └── step_<N>.pt                                         │
│  │                                                                │
│  └── app.py                      (Flask app entry point)        │
│                                                                  │
│  frontend/                                                       │
│  ├── src/                                                        │
│  │   ├── components/                                             │
│  │   ├── contexts/                                               │
│  │   ├── hooks/                                                  │
│  │   └── App.jsx                                                 │
│  │                                                                │
│  └── public/                                                     │
│      └── (static assets)                                         │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

#### Frontend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 18.2.x | Component-based UI, hooks, concurrent rendering |
| **Build Tool** | Vite | 5.x | Fast dev server, HMR, optimized builds |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first, dark theme, responsive design |
| **CSS Processing** | PostCSS | 8.x | Autoprefixer, CSS optimization |
| **Animation** | Framer Motion | 11.x | Layout animations, gesture support, spring physics |
| **Charts/Viz** | visx | 3.10.x | React-native D3 primitives, composable scales |
| **3D Graphics** | Three.js | 0.160.x | Optional 3D attention visualization |
| **WebSocket** | socket.io-client | 4.6.x | Bidirectional real-time communication |
| **HTTP Client** | Axios | 1.6.x | REST API calls, interceptors |
| **State Mgmt** | Context + useReducer | Native | Lightweight, no external deps |
| **Routing** | React Router | 6.21.x | Declarative routing, nested routes |
| **File Upload** | react-dropzone | 14.x | Drag-and-drop file uploads |

#### Backend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Flask | 3.0.x | Lightweight, flexible, Python ecosystem |
| **WebSocket** | Flask-SocketIO | 5.3.x | Socket.IO server, rooms, async tasks |
| **Async Runtime** | Eventlet | 0.33.x | Cooperative multitasking, greenlets |
| **ML Framework** | PyTorch | 2.1.x | Dynamic graphs, autograd, GPU support |
| **CORS** | Flask-CORS | 4.0.x | Cross-origin request handling |
| **File Parsing** | python-docx | 1.1.x | .docx file support |
| **Numerical** | NumPy | 1.26.x | Array operations, serialization |
| **Utils** | python-dotenv | 1.0.x | Environment variable management |

### 3.3 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERACTION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

  User Action (Click "Train")
         │
         ▼
  ┌──────────────┐
  │  React UI    │  1. Validate input
  │  Component   │  2. Create session config
  └──────┬───────┘
         │ HTTP POST /api/sessions/create
         ▼
  ┌──────────────────┐
  │  Flask Endpoint  │  3. Generate session_id (UUID)
  │  /api/sessions   │  4. Initialize model + optimizer
  └──────┬───────────┘  5. Store in sessions dict
         │
         │ Return session_id
         ▼
  ┌──────────────┐
  │  React UI    │  6. Emit WebSocket event
  └──────┬───────┘     start_training(session_id)
         │
         │ WebSocket
         ▼
  ┌──────────────────┐
  │  Flask-SocketIO  │  7. Join session room
  │  Event Handler   │  8. Start background task
  └──────┬───────────┘
         │
         │ socketio.start_background_task(train_loop)
         ▼
  ┌────────────────────────────────────────────────────────┐
  │              TRAINING LOOP (Background Task)            │
  ├────────────────────────────────────────────────────────┤
  │                                                          │
  │  for iter in range(max_iters):                          │
  │      # Training step                                     │
  │      1. Get batch from dataset                           │
  │      2. Forward pass                                     │
  │      3. Compute loss                                     │
  │      4. Backward pass                                    │
  │      5. Optimizer step                                   │
  │                                                          │
  │      # Emit metrics (every eval_interval)               │
  │      if iter % eval_interval == 0:                       │
  │         ┌───────────────────────────────────┐           │
  │         │ Extract Metrics:                   │           │
  │         │ • Train/val loss                   │           │
  │         │ • Attention weights (all layers)   │           │
  │         │ • Generated text sample            │           │
  │         └─────────────┬─────────────────────┘           │
  │                       │                                   │
  │                       │ Emit via WebSocket              │
  │                       ▼                                   │
  │         ┌───────────────────────────────────┐           │
  │         │  socketio.emit('training_metrics', │           │
  │         │     data, room=session_id)         │           │
  │         └───────────────────────────────────┘           │
  │                                                          │
  │      # Check for pause/stop commands                    │
  │      if session.status == 'paused':                      │
  │          socketio.sleep(0.1)  # Yield control           │
  │          continue                                        │
  │      if session.status == 'stopped':                     │
  │          break                                           │
  │                                                          │
  └────────────────────────────────────────────────────────┘
         │
         │ WebSocket events
         ▼
  ┌──────────────────┐
  │  React WebSocket │  9. Receive events
  │  Event Listeners │  10. Update state
  └──────┬───────────┘  11. Trigger re-renders
         │
         ▼
  ┌──────────────────────────────────────┐
  │  UI Updates:                          │
  │  • Loss curve animates new point      │
  │  • Generated text appends new sample  │
  │  • Attention heatmap transitions      │
  └──────────────────────────────────────┘
```

### 3.4 Component Architecture (Frontend)

```
App.jsx
├── Router
│   ├── Route: /
│   │   └── LandingPage.jsx
│   │       ├── AnimatedBackground.jsx  (Canvas particles)
│   │       └── LaunchButton.jsx
│   │
│   └── Route: /app
│       └── Dashboard.jsx
│           ├── Header.jsx
│           │   ├── Logo.jsx
│           │   └── SessionStatus.jsx  (Active sessions indicator)
│           │
│           ├── TabBar.jsx
│           │   ├── TabButton.jsx (Watch It Learn)
│           │   ├── TabButton.jsx (Attention Cinema)
│           │   └── TabButton.jsx (Style Transfer)
│           │
│           └── TabContent.jsx
│               │
│               ├── WatchItLearnTab.jsx
│               │   ├── DatasetSelector.jsx
│               │   │   ├── DropdownMenu.jsx
│               │   │   └── FileUploader.jsx
│               │   ├── TrainingControls.jsx
│               │   │   ├── PlayPauseButton.jsx
│               │   │   ├── StopButton.jsx
│               │   │   ├── SpeedSelector.jsx
│               │   │   └── StepButton.jsx
│               │   ├── LossCurveChart.jsx  (visx)
│               │   │   ├── AxisBottom.jsx
│               │   │   ├── AxisLeft.jsx
│               │   │   ├── LinePath.jsx  (train loss)
│               │   │   ├── LinePath.jsx  (val loss)
│               │   │   ├── Crosshair.jsx
│               │   │   └── Tooltip.jsx
│               │   └── TextProgressionDisplay.jsx
│               │       └── ProgressionRow.jsx  (per checkpoint)
│               │
│               ├── AttentionCinemaTab.jsx
│               │   ├── TrainingControls.jsx  (shared)
│               │   ├── ViewModeToggle.jsx
│               │   │   ├── OverviewDetailToggle.jsx
│               │   │   └── Mode2D3DToggle.jsx
│               │   ├── LayerHeadSelector.jsx
│               │   │   ├── LayerDropdown.jsx
│               │   │   └── HeadDropdown.jsx
│               │   ├── AttentionVisualization.jsx
│               │   │   ├── OverviewMode.jsx
│               │   │   │   └── HeatmapGrid.jsx
│               │   │   │       └── HeatmapCell.jsx  (visx)
│               │   │   └── DetailMode.jsx
│               │   │       ├── Heatmap2D.jsx  (visx + Framer Motion)
│               │   │       │   ├── HeatmapRect.jsx
│               │   │       │   ├── ColorScale.jsx
│               │   │       │   └── AxisLabels.jsx
│               │   │       └── Heatmap3D.jsx  (Three.js)
│               │   └── PlaybackTimeline.jsx
│               │       ├── Scrubber.jsx
│               │       ├── PlaybackControls.jsx
│               │       └── StepDisplay.jsx
│               │
│               └── StyleTransferTab.jsx
│                   ├── TextInputPanel.jsx
│                   │   ├── Textarea.jsx
│                   │   ├── FileUploader.jsx  (react-dropzone)
│                   │   └── TextMetadata.jsx
│                   ├── TrainingControls.jsx  (shared)
│                   ├── LossCurveChart.jsx  (shared)
│                   └── SideBySideComparison.jsx
│                       ├── OriginalTextDisplay.jsx
│                       │   └── StyleMetrics.jsx
│                       └── GeneratedTextDisplay.jsx
│                           └── ConfidenceMetrics.jsx
```

---

## 4. LLM Architecture Deep Dive

### 4.1 Micro-GPT Model Architecture

**Every component visualized in detail:**

```
┌────────────────────────────────────────────────────────────────┐
│                    MICRO-GPT ARCHITECTURE                       │
│                    (~7,900 parameters)                          │
└────────────────────────────────────────────────────────────────┘

INPUT: "the cat"  →  Tokenized: [20, 8, 5, 0, 3, 1, 20]
                                  ↓
        ┌───────────────────────────────────────────────┐
        │      TOKEN EMBEDDING TABLE                     │
        │      (vocab_size × n_embd)                     │
        │      65 × 16 = 1,040 parameters                │
        ├───────────────────────────────────────────────┤
        │  Lookup each token index → embedding vector   │
        │                                                 │
        │  token[20] → [0.23, -0.41, 0.67, ..., 0.12]   │
        │  token[8]  → [-0.12, 0.56, -0.23, ..., 0.89]  │
        │  ...                                            │
        └─────────────────┬─────────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────────┐
        │   POSITIONAL EMBEDDING TABLE                   │
        │   (block_size × n_embd)                        │
        │   64 × 16 = 1,024 parameters                   │
        ├───────────────────────────────────────────────┤
        │  Add position information to each token        │
        │                                                 │
        │  position[0] → [0.12, 0.34, -0.56, ..., 0.78] │
        │  position[1] → [0.45, -0.12, 0.23, ..., 0.91] │
        │  ...                                            │
        └─────────────────┬─────────────────────────────┘
                          │
                          │ Element-wise addition
                          ▼
        ┌───────────────────────────────────────────────┐
        │         TOKEN + POSITION EMBEDDINGS            │
        │         Shape: (batch, seq_len, n_embd)        │
        │         Example: (32, 64, 16)                  │
        └─────────────────┬─────────────────────────────┘
                          │
                          ▼
╔═════════════════════════════════════════════════════════════════╗
║                  TRANSFORMER BLOCK 0                             ║
╠═════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │              LAYER NORMALIZATION 1                       │   ║
║  │              (2 × n_embd = 32 params)                    │   ║
║  ├─────────────────────────────────────────────────────────┤   ║
║  │  Normalize across embedding dimension:                   │   ║
║  │  x = (x - mean) / sqrt(variance + epsilon)              │   ║
║  │  x = x * gamma + beta                                    │   ║
║  └───────────────────────┬─────────────────────────────────┘   ║
║                          │                                       ║
║                          ▼                                       ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │         MULTI-HEAD SELF-ATTENTION (2 heads)             │   ║
║  │         1,024 parameters                                 │   ║
║  ├─────────────────────────────────────────────────────────┤   ║
║  │                                                           │   ║
║  │  For each of 2 attention heads:                          │   ║
║  │                                                           │   ║
║  │  ┌───────────────────────────────────────────────┐      │   ║
║  │  │  HEAD 0 (head_size = n_embd / n_head = 8)    │      │   ║
║  │  ├───────────────────────────────────────────────┤      │   ║
║  │  │                                                │      │   ║
║  │  │  1. Project input to Query (Q)                │      │   ║
║  │  │     Linear(n_embd, head_size) → 16×8=128 params│     │   ║
║  │  │     Q = x @ W_q                                │      │   ║
║  │  │     Shape: (batch, seq_len, 8)                │      │   ║
║  │  │                                                │      │   ║
║  │  │  2. Project input to Key (K)                  │      │   ║
║  │  │     Linear(n_embd, head_size) → 128 params    │      │   ║
║  │  │     K = x @ W_k                                │      │   ║
║  │  │                                                │      │   ║
║  │  │  3. Project input to Value (V)                │      │   ║
║  │  │     Linear(n_embd, head_size) → 128 params    │      │   ║
║  │  │     V = x @ W_v                                │      │   ║
║  │  │                                                │      │   ║
║  │  │  4. Compute attention scores                  │      │   ║
║  │  │     scores = Q @ K^T / sqrt(head_size)        │      │   ║
║  │  │     Shape: (batch, seq_len, seq_len)          │      │   ║
║  │  │                                                │      │   ║
║  │  │     Example 4×4 attention matrix:             │      │   ║
║  │  │     ┌─────────────────────────────────┐       │      │   ║
║  │  │     │      t  h  e     (tokens)       │       │      │   ║
║  │  │     │  t  1.0 0.0 0.0 0.0             │       │      │   ║
║  │  │     │  h  0.5 0.5 0.0 0.0  ← Causal   │       │      │   ║
║  │  │     │  e  0.3 0.4 0.3 0.0     mask    │       │      │   ║
║  │  │     │     0.2 0.3 0.3 0.2             │       │      │   ║
║  │  │     └─────────────────────────────────┘       │      │   ║
║  │  │                                                │      │   ║
║  │  │  5. Apply causal mask                         │      │   ║
║  │  │     scores = scores.masked_fill(              │      │   ║
║  │  │         mask == 0, float('-inf'))             │      │   ║
║  │  │     Prevents attending to future tokens       │      │   ║
║  │  │                                                │      │   ║
║  │  │  6. Apply softmax                             │      │   ║
║  │  │     attention_weights = softmax(scores)       │      │   ║
║  │  │     Normalize each row to sum to 1.0          │      │   ║
║  │  │                                                │      │   ║
║  │  │     **THIS IS WHAT WE VISUALIZE!**            │      │   ║
║  │  │                                                │      │   ║
║  │  │  7. Apply dropout (if enabled)                │      │   ║
║  │  │                                                │      │   ║
║  │  │  8. Weighted sum of values                    │      │   ║
║  │  │     output = attention_weights @ V            │      │   ║
║  │  │     Shape: (batch, seq_len, head_size)        │      │   ║
║  │  │                                                │      │   ║
║  │  └────────────────────────────────────────────────┘      │   ║
║  │                                                           │   ║
║  │  ┌───────────────────────────────────────────────┐      │   ║
║  │  │  HEAD 1 (same process as HEAD 0)             │      │   ║
║  │  │  384 parameters (Q, K, V projections)         │      │   ║
║  │  └───────────────────────────────────────────────┘      │   ║
║  │                                                           │   ║
║  │  9. Concatenate head outputs                             │   ║
║  │     concat([head0_out, head1_out], dim=-1)              │   ║
║  │     Shape: (batch, seq_len, n_embd)                      │   ║
║  │                                                           │   ║
║  │  10. Project concatenated output                         │   ║
║  │      Linear(n_embd, n_embd) → 256 params                │   ║
║  │      + Dropout                                            │   ║
║  │                                                           │   ║
║  └─────────────────┬─────────────────────────────────────┘   ║
║                    │                                           ║
║                    │ Residual connection (add input)          ║
║                    ▼                                           ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │              LAYER NORMALIZATION 2                       │   ║
║  │              (32 params)                                 │   ║
║  └───────────────────────┬─────────────────────────────────┘   ║
║                          │                                     ║
║                          ▼                                     ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │           FEEDFORWARD NEURAL NETWORK                     │   ║
║  │           2,048 parameters                               │   ║
║  ├─────────────────────────────────────────────────────────┤   ║
║  │                                                           │   ║
║  │  1. Expand: Linear(n_embd, 4 × n_embd)                  │   ║
║  │     16 → 64 dimensions                                   │   ║
║  │     16 × 64 = 1,024 params                               │   ║
║  │                                                           │   ║
║  │  2. Non-linearity: ReLU                                  │   ║
║  │     ReLU(x) = max(0, x)                                  │   ║
║  │                                                           │   ║
║  │  3. Contract: Linear(4 × n_embd, n_embd)                │   ║
║  │     64 → 16 dimensions                                   │   ║
║  │     64 × 16 = 1,024 params                               │   ║
║  │                                                           │   ║
║  │  4. Dropout                                               │   ║
║  │                                                           │   ║
║  └─────────────────┬─────────────────────────────────────┘   ║
║                    │                                           ║
║                    │ Residual connection (add input)          ║
║                    ▼                                           ║
║  [Output of Transformer Block 0]                              ║
║                                                                 ║
╚═══════════════════════════════════════════════════════════════╝
                          │
                          ▼
╔═════════════════════════════════════════════════════════════════╗
║                  TRANSFORMER BLOCK 1                             ║
║                  (Identical structure to Block 0)                ║
║                  3,136 parameters                                ║
╚═══════════════════════════════════════════════════════════════╝
                          │
                          ▼
        ┌───────────────────────────────────────────────┐
        │         FINAL LAYER NORMALIZATION              │
        │         (32 params)                            │
        └─────────────────┬─────────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────────┐
        │         OUTPUT HEAD (Language Modeling)        │
        │         WEIGHT TYING: Uses token embedding     │
        │         weights (no additional params)         │
        ├───────────────────────────────────────────────┤
        │  Linear(n_embd, vocab_size)                    │
        │  16 → 65 dimensions                            │
        │  Shares weights with input embedding table     │
        │                                                 │
        │  Output logits shape: (batch, seq_len, 65)    │
        └─────────────────┬─────────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────────┐
        │              SOFTMAX                           │
        │  Convert logits to probabilities               │
        │                                                 │
        │  probabilities = softmax(logits, dim=-1)       │
        │  Shape: (batch, seq_len, vocab_size)           │
        │                                                 │
        │  Example for next token prediction:            │
        │  ┌─────────────────────────────────────┐       │
        │  │  Token  │  Probability              │       │
        │  ├─────────────────────────────────────┤       │
        │  │  "m"    │  0.623  ← Highest        │       │
        │  │  "c"    │  0.281                    │       │
        │  │  "f"    │  0.057                    │       │
        │  │  "s"    │  0.029                    │       │
        │  │  ...    │  ...                      │       │
        │  └─────────────────────────────────────┘       │
        │                                                 │
        │  **THIS IS WHAT WE SHOW IN TAB 1!**            │
        └─────────────────┬─────────────────────────────┘
                          │
                          ▼
                    PREDICTED TOKEN
```

### 4.2 Parameter Budget Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│              TOTAL PARAMETERS: ~7,900                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Component                         │ Calculation  │ Params   │
│  ──────────────────────────────────┼──────────────┼─────────│
│  Token Embeddings                  │ 65 × 16      │  1,040   │
│  Positional Embeddings             │ 64 × 16      │  1,024   │
│  ──────────────────────────────────┼──────────────┼─────────│
│  Transformer Block 0:              │              │          │
│    Layer Norm 1                    │ 2 × 16       │     32   │
│    Attention Head 0 (Q, K, V)      │ 3×16×8       │    384   │
│    Attention Head 1 (Q, K, V)      │ 3×16×8       │    384   │
│    Attention Output Projection     │ 16×16        │    256   │
│    Layer Norm 2                    │ 2 × 16       │     32   │
│    FFN Layer 1                     │ 16×64        │  1,024   │
│    FFN Layer 2                     │ 64×16        │  1,024   │
│  ──────────────────────────────────┼──────────────┼─────────│
│  Transformer Block 1:              │ (same)       │  3,136   │
│  ──────────────────────────────────┼──────────────┼─────────│
│  Final Layer Norm                  │ 2 × 16       │     32   │
│  Output Head                       │ TIED (0)     │      0   │
│  ──────────────────────────────────┼──────────────┼─────────│
│  TOTAL                             │              │  7,900   │
└─────────────────────────────────────────────────────────────┘

**Weight Tying:** The output head shares weights with the token
embedding table, saving 65×16 = 1,040 parameters. This is why
total parameters ~7,900 instead of ~8,900.
```

### 4.3 Training Hyperparameters

```
┌─────────────────────────────────────────────────────────────┐
│                  TRAINING CONFIGURATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Hyperparameter              │ Value      │ Rationale        │
│  ────────────────────────────┼────────────┼─────────────────│
│  Optimizer                   │ AdamW      │ Momentum + decay │
│  Learning Rate               │ 1e-3       │ High for small   │
│  Weight Decay                │ 0.0        │ No regularization│
│  Batch Size                  │ 32         │ Balance speed/mem│
│  Max Iterations              │ 500        │ 20-30 sec target │
│  Eval Interval               │ 50         │ 10 checkpoints   │
│  Warmup Steps                │ 50         │ Stabilize early  │
│  LR Schedule                 │ Cosine     │ Smooth decay     │
│  Gradient Clip               │ 1.0        │ Prevent explosion│
│  Dropout                     │ 0.0        │ Every param counts│
│  Block Size                  │ 64         │ Sequence length  │
│  ────────────────────────────┼────────────┼─────────────────│
│  Expected Training Time:                                     │
│  • CPU (M1 Mac):             15-20 seconds                   │
│  • CPU (Intel):              25-35 seconds                   │
│  • GPU (if available):       8-12 seconds                    │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Attention Extraction Process

```
During training, we capture attention weights for visualization:

┌─────────────────────────────────────────────────────────────┐
│           ATTENTION WEIGHT EXTRACTION HOOK                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  In forward pass of attention module:                        │
│                                                               │
│  def forward(self, x):                                       │
│      Q = self.query(x)    # (batch, seq, head_size)         │
│      K = self.key(x)                                         │
│      V = self.value(x)                                       │
│                                                               │
│      scores = Q @ K.T / sqrt(head_size)                      │
│      scores = scores.masked_fill(mask == 0, -inf)            │
│                                                               │
│      attention_weights = softmax(scores, dim=-1)             │
│                                                               │
│      # CAPTURE FOR VISUALIZATION                             │
│      self.last_attention = attention_weights.detach().cpu()  │
│                                                               │
│      attention_weights = dropout(attention_weights)          │
│      output = attention_weights @ V                          │
│                                                               │
│      return output                                            │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  After eval_interval steps, extract from all heads:         │
│                                                               │
│  attention_snapshots = []                                    │
│  for layer_idx in range(n_layer):                            │
│      for head_idx in range(n_head):                          │
│          attn = model.blocks[layer_idx].sa.heads[head_idx]\ │
│                      .last_attention[0]  # First in batch    │
│                                                               │
│          snapshot = {                                         │
│              'step': current_step,                            │
│              'layer': layer_idx,                              │
│              'head': head_idx,                                │
│              'matrix': attn.numpy().tolist(),                │
│              'tokens': decode(input_tokens)                   │
│          }                                                    │
│          attention_snapshots.append(snapshot)                │
│                                                               │
│  # Emit via WebSocket                                        │
│  for snapshot in attention_snapshots:                        │
│      socketio.emit('attention_snapshot', snapshot,           │
│                    room=session_id)                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Data Models & Storage

### 5.1 Backend Data Models (Python)

#### TrainingSession

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum

class SessionStatus(Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    COMPLETED = "completed"
    ERROR = "error"

class FeatureType(Enum):
    WATCH_LEARN = "watch_learn"
    ATTENTION_CINEMA = "attention_cinema"
    STYLE_TRANSFER = "style_transfer"

@dataclass
class TrainingSession:
    """Represents a single model training session."""
    
    # Identity
    session_id: str                    # UUID v4
    feature_type: FeatureType
    status: SessionStatus = SessionStatus.IDLE
    
    # Model configuration
    model_config: Dict = field(default_factory=lambda: {
        'vocab_size': 65,
        'n_embd': 16,
        'n_layer': 2,
        'n_head': 2,
        'block_size': 64,
        'dropout': 0.0,
        'bias': False,
        'weight_tying': True
    })
    
    # Training configuration
    training_config: Dict = field(default_factory=lambda: {
        'batch_size': 32,
        'max_iters': 500,
        'learning_rate': 1e-3,
        'eval_interval': 50,
        'warmup_steps': 50,
        'lr_decay': 'cosine',
        'grad_clip': 1.0
    })
    
    # Dataset
    dataset_name: str = ""             # "shakespeare" | "poems" | "user_<uuid>"
    dataset_path: str = ""             # File path
    text_corpus: str = ""              # Raw text
    vocab: List[str] = field(default_factory=list)
    char_to_idx: Dict[str, int] = field(default_factory=dict)
    idx_to_char: Dict[int, str] = field(default_factory=dict)
    
    # Runtime state
    current_iter: int = 0
    speed_multiplier: float = 1.0
    model_instance: Optional[object] = None
    optimizer: Optional[object] = None
    
    # Metrics history
    loss_history: List[Dict] = field(default_factory=list)
    # Example: [{'step': 0, 'train_loss': 3.5, 'val_loss': 3.6}, ...]
    
    attention_snapshots: List[Dict] = field(default_factory=list)
    # Example: [{'step': 0, 'layer': 0, 'head': 0, 'matrix': [[...]]}, ...]
    
    generated_samples: List[Dict] = field(default_factory=list)
    # Example: [{'step': 0, 'text': 'xjkl3 qqw', 'prompt': ''}, ...]
    
    # Timestamps
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Error tracking
    error_message: Optional[str] = None
```

#### MicroGPT Model

```python
import torch
import torch.nn as nn
from torch.nn import functional as F

class Head(nn.Module):
    """Single attention head with weight extraction."""
    
    def __init__(self, n_embd, head_size, block_size, dropout):
        super().__init__()
        self.key = nn.Linear(n_embd, head_size, bias=False)
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)
        
        # Causal mask
        self.register_buffer(
            'tril',
            torch.tril(torch.ones(block_size, block_size))
        )
        
        self.dropout = nn.Dropout(dropout)
        
        # Storage for visualization
        self.last_attention = None
    
    def forward(self, x):
        B, T, C = x.shape
        k = self.key(x)    # (B, T, head_size)
        q = self.query(x)  # (B, T, head_size)
        v = self.value(x)  # (B, T, head_size)
        
        # Compute attention scores
        scores = q @ k.transpose(-2, -1) * (C ** -0.5)  # (B, T, T)
        scores = scores.masked_fill(self.tril[:T, :T] == 0, float('-inf'))
        
        # Softmax to get attention weights
        attn = F.softmax(scores, dim=-1)  # (B, T, T)
        
        # CAPTURE FOR VISUALIZATION (before dropout)
        self.last_attention = attn.detach().cpu()
        
        attn = self.dropout(attn)
        
        # Weighted aggregation
        out = attn @ v  # (B, T, head_size)
        return out

class MultiHeadAttention(nn.Module):
    """Multiple attention heads in parallel."""
    
    def __init__(self, n_embd, n_head, block_size, dropout):
        super().__init__()
        head_size = n_embd // n_head
        self.heads = nn.ModuleList([
            Head(n_embd, head_size, block_size, dropout)
            for _ in range(n_head)
        ])
        self.proj = nn.Linear(n_embd, n_embd)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x):
        out = torch.cat([h(x) for h in self.heads], dim=-1)
        out = self.dropout(self.proj(out))
        return out

class FeedForward(nn.Module):
    """Simple feedforward network with expansion."""
    
    def __init__(self, n_embd, dropout):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd),
            nn.ReLU(),
            nn.Linear(4 * n_embd, n_embd),
            nn.Dropout(dropout),
        )
    
    def forward(self, x):
        return self.net(x)

class TransformerBlock(nn.Module):
    """Transformer block: attention + feedforward."""
    
    def __init__(self, n_embd, n_head, block_size, dropout):
        super().__init__()
        self.sa = MultiHeadAttention(n_embd, n_head, block_size, dropout)
        self.ffwd = FeedForward(n_embd, dropout)
        self.ln1 = nn.LayerNorm(n_embd)
        self.ln2 = nn.LayerNorm(n_embd)
    
    def forward(self, x):
        # Attention with residual
        x = x + self.sa(self.ln1(x))
        # Feedforward with residual
        x = x + self.ffwd(self.ln2(x))
        return x

class MicroGPT(nn.Module):
    """Tiny GPT for educational purposes."""
    
    def __init__(self, config):
        super().__init__()
        self.config = config
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Token embeddings
        self.token_embedding_table = nn.Embedding(
            config['vocab_size'],
            config['n_embd']
        )
        
        # Positional embeddings
        self.position_embedding_table = nn.Embedding(
            config['block_size'],
            config['n_embd']
        )
        
        # Transformer blocks
        self.blocks = nn.Sequential(*[
            TransformerBlock(
                config['n_embd'],
                config['n_head'],
                config['block_size'],
                config['dropout']
            )
            for _ in range(config['n_layer'])
        ])
        
        # Final layer norm
        self.ln_f = nn.LayerNorm(config['n_embd'])
        
        # Output head (weight tying)
        if config.get('weight_tying', True):
            self.lm_head = None  # Will use token_embedding_table.weight
        else:
            self.lm_head = nn.Linear(config['n_embd'], config['vocab_size'])
    
    def forward(self, idx, targets=None):
        B, T = idx.shape
        
        # Token + positional embeddings
        tok_emb = self.token_embedding_table(idx)  # (B, T, n_embd)
        pos_emb = self.position_embedding_table(
            torch.arange(T, device=self.device)
        )  # (T, n_embd)
        x = tok_emb + pos_emb  # (B, T, n_embd)
        
        # Transformer blocks
        x = self.blocks(x)
        
        # Final layer norm
        x = self.ln_f(x)
        
        # Output projection (with weight tying)
        if self.lm_head is None:
            logits = F.linear(
                x,
                self.token_embedding_table.weight
            )  # (B, T, vocab_size)
        else:
            logits = self.lm_head(x)
        
        # Compute loss if targets provided
        if targets is None:
            loss = None
        else:
            B, T, C = logits.shape
            logits = logits.view(B * T, C)
            targets = targets.view(B * T)
            loss = F.cross_entropy(logits, targets)
        
        return logits, loss
    
    def generate(self, idx, max_new_tokens, temperature=1.0):
        """Generate text autoregressively."""
        for _ in range(max_new_tokens):
            # Crop to block_size
            idx_cond = idx[:, -self.config['block_size']:]
            
            # Forward pass
            logits, _ = self(idx_cond)
            
            # Focus on last time step
            logits = logits[:, -1, :]  # (B, vocab_size)
            
            # Apply temperature
            logits = logits / temperature
            
            # Softmax to get probabilities
            probs = F.softmax(logits, dim=-1)  # (B, vocab_size)
            
            # Sample from distribution
            idx_next = torch.multinomial(probs, num_samples=1)  # (B, 1)
            
            # Append to sequence
            idx = torch.cat((idx, idx_next), dim=1)  # (B, T+1)
        
        return idx
    
    def extract_attention_weights(self):
        """Extract attention weights from all heads for visualization."""
        snapshots = []
        for layer_idx, block in enumerate(self.blocks):
            for head_idx, head in enumerate(block.sa.heads):
                if head.last_attention is not None:
                    # Get first sample in batch
                    attn_matrix = head.last_attention[0].numpy()  # (T, T)
                    snapshots.append({
                        'layer': layer_idx,
                        'head': head_idx,
                        'matrix': attn_matrix.tolist()
                    })
        return snapshots
```

### 5.2 Frontend Data Models (TypeScript)

```typescript
// types.ts

export enum SessionStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export enum FeatureType {
  WATCH_LEARN = 'watch_learn',
  ATTENTION_CINEMA = 'attention_cinema',
  STYLE_TRANSFER = 'style_transfer'
}

export interface ModelConfig {
  vocab_size: number;
  n_embd: number;
  n_layer: number;
  n_head: number;
  block_size: number;
  dropout: number;
  bias: boolean;
  weight_tying: boolean;
}

export interface TrainingConfig {
  batch_size: number;
  max_iters: number;
  learning_rate: number;
  eval_interval: number;
  warmup_steps: number;
  lr_decay: string;
  grad_clip: number;
}

export interface TrainingMetrics {
  sessionId: string;
  step: number;
  trainLoss: number;
  valLoss: number;
  timestamp: number;
}

export interface GeneratedSample {
  sessionId: string;
  step: number;
  text: string;
  prompt: string;
  timestamp: number;
}

export interface AttentionSnapshot {
  sessionId: string;
  step: number;
  layer: number;
  head: number;
  matrix: number[][];  // 2D array of attention weights
  tokens: string[];    // Token labels for axes
  timestamp: number;
}

export interface SessionInfo {
  sessionId: string;
  featureType: FeatureType;
  status: SessionStatus;
  currentIter: number;
  maxIters: number;
  progress: number;  // 0.0 to 1.0
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface DatasetInfo {
  name: string;
  displayName: string;
  charCount: number;
  vocabSize: number;
  wordCount?: number;
  filePath: string;
}

export interface SessionConfig {
  featureType: FeatureType;
  datasetId?: string;          // For pre-bundled datasets
  userText?: string;           // For pasted text
  userFile?: File;             // For uploaded files
  hyperparameters?: TrainingConfig;
}

export interface StyleMetrics {
  formality: number;           // 0-100
  avgSentenceLength: number;
  vocabRichness: number;       // unique_words / total_words
}

export interface ConfidenceMetrics {
  avgTokenProb: number;
  perplexity: number;
}
```

### 5.3 Storage Architecture

**No persistent database.** All state is ephemeral and in-memory.

```
┌─────────────────────────────────────────────────────────────┐
│                   IN-MEMORY STORAGE (Backend)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  # Global dictionary in Flask app                            │
│  sessions: Dict[str, TrainingSession] = {}                   │
│                                                               │
│  # Example state:                                             │
│  {                                                            │
│    "550e8400-e29b-41d4-a716-446655440000": TrainingSession(│
│      session_id="550e8400...",                               │
│      feature_type=FeatureType.WATCH_LEARN,                   │
│      status=SessionStatus.RUNNING,                           │
│      current_iter=250,                                        │
│      ...                                                      │
│    ),                                                         │
│    "7c9e6679-7425-40de-944b-e07fc1f90ae7": TrainingSession(│
│      ...                                                      │
│    )                                                          │
│  }                                                            │
│                                                               │
│  # Cleanup policy:                                            │
│  • Sessions removed on explicit stop/delete                  │
│  • Automatic cleanup after 1 hour of inactivity              │
│  • All state cleared on Flask app restart                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   FILE SYSTEM LAYOUT                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  backend/                                                     │
│  ├── app.py                  # Flask application entry      │
│  ├── micro_gpt.py            # Model definition             │
│  ├── training_manager.py     # Session management           │
│  ├── trainer.py              # Training loop logic          │
│  ├── dataset_loader.py       # Dataset handling             │
│  ├── metrics_emitter.py      # WebSocket emission           │
│  ├── requirements.txt        # Python dependencies          │
│  │                                                            │
│  ├── datasets/               # Pre-bundled datasets          │
│  │   ├── shakespeare.txt                                     │
│  │   ├── poems.txt                                           │
│  │   └── childrens.txt                                       │
│  │                                                            │
│  └── uploads/                # User uploads (ephemeral)      │
│      └── user_<uuid>.txt     # Deleted after session ends   │
│                                                               │
│  frontend/                                                    │
│  ├── src/                                                     │
│  │   ├── App.jsx                                              │
│  │   ├── components/                                          │
│  │   │   ├── landing/                                         │
│  │   │   ├── dashboard/                                       │
│  │   │   ├── shared/                                          │
│  │   │   └── tabs/                                            │
│  │   ├── contexts/                                            │
│  │   │   ├── TrainingContext.jsx                             │
│  │   │   ├── MetricsContext.jsx                              │
│  │   │   └── UIContext.jsx                                   │
│  │   ├── hooks/                                               │
│  │   │   ├── useWebSocket.js                                 │
│  │   │   ├── useTrainingSession.js                           │
│  │   │   └── useAnimatedMetrics.js                           │
│  │   ├── utils/                                               │
│  │   │   ├── apiClient.js                                    │
│  │   │   └── formatters.js                                   │
│  │   └── types/                                               │
│  │       └── index.ts                                         │
│  │                                                             │
│  ├── public/                                                  │
│  ├── package.json                                             │
│  ├── vite.config.js                                           │
│  └── tailwind.config.js                                       │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Screen Structure & Visual Layouts

### 6.1 Landing Page (`/`)

```
┌────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE                             │
│                     (Dark Theme: #0F172A)                       │
└────────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────┐
     │                                                    │
     │         Animated Neural Network Background       │
     │         (Canvas with particle system)             │
     │         • Floating nodes (blue/cyan dots)         │
     │         • Connections forming/dissolving          │
     │         • Subtle glow effects                     │
     │                                                    │
     │         ┌────────────────────────────────┐        │
     │         │                                 │        │
     │         │       LLMBreaker                │        │
     │         │   (96px, bold, gradient text    │        │
     │         │    blue→cyan)                   │        │
     │         │                                 │        │
     │         └────────────────────────────────┘        │
     │                                                    │
     │         ┌────────────────────────────────┐        │
     │         │                                 │        │
     │         │  See intelligence emerge        │        │
     │         │      in real-time               │        │
     │         │  (24px, light gray)             │        │
     │         │                                 │        │
     │         └────────────────────────────────┘        │
     │                                                    │
     │                                                    │
     │         ┌────────────────────────────────┐        │
     │         │                                 │        │
     │         │         Launch  →               │        │
     │         │  (Button: 200px × 56px)         │        │
     │         │  (Blue gradient, hover lift)    │        │
     │         │                                 │        │
     │         └────────────────────────────────┘        │
     │                                                    │
     │                                                    │
     │                                                    │
     │         Built for [Hackathon Name] 2026           │
     │         (12px, dark gray, bottom)                 │
     │                                                    │
     └──────────────────────────────────────────────────┘

Color Palette:
• Background: #0F172A (slate-900)
• Primary Blue: #3B82F6
• Cyan Accent: #06B6D4
• Text Light: #F1F5F9
• Text Dim: #64748B
```

**Animations:**
- Particles drift slowly (0.5px/frame)
- Connections pulse opacity (0.2 → 0.6)
- Button hover: Lift 2px, shadow expand
- Entire page fades in (500ms ease-out)

---

### 6.2 Dashboard - Tab 1: Watch It Learn to Spell

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
│ [Logo: LLMBreaker]                          [🟢 2 active sessions]│
├──────────────────────────────────────────────────────────────────┤
│ TAB BAR                                                           │
│ [📝 Watch It Learn] [🎬 Attention Cinema] [✨ Style Transfer]    │
│  └─ ACTIVE (blue underline)                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐│
│  │ DATASET SELECTOR            │  │ TRAINING CONTROLS            ││
│  ├────────────────────────────┤  ├──────────────────────────────┤│
│  │ [Dropdown: Shakespeare   ▼]│  │ [▶ Play] [⏸ Pause] [⏹ Stop] ││
│  │                             │  │                               ││
│  │ ── OR ──                    │  │ Speed: [2x ▼]                ││
│  │                             │  │ Step: [  >  ] [250/500]      ││
│  │ [📁 Upload .txt]            │  │                               ││
│  │                             │  │ [Tooltips on hover]          ││
│  │ ───────────────────────────│  └──────────────────────────────┘│
│  │ Metadata (after selection): │                                  │
│  │ • Chars: 1,115,394          │                                  │
│  │ • Vocab: 65                 │                                  │
│  │ • Words: ~185,000           │                                  │
│  └────────────────────────────┘                                  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ LOSS CURVE                                                    ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │                                                                ││
│  │  3.5 ┤                                                        ││
│  │      │╲                                                       ││
│  │  3.0 │ ╲                                                      ││
│  │      │  ╲___                                                  ││
│  │  2.5 │      ╲____                                             ││
│  │      │           ╲_____                                       ││
│  │  2.0 │                ╲_______                                ││
│  │      │                        ╲_____  ← Train Loss (blue)    ││
│  │  1.5 │                             ╲___                       ││
│  │      │                                 ╲‥‥‥  Val Loss (cyan) ││
│  │  1.0 └─────┬──────┬──────┬──────┬──────┬──────              ││
│  │            0     100    200    300    400    500              ││
│  │                          ↑ [Crosshair on hover]               ││
│  │                    Tooltip: Step 250, Loss 2.14               ││
│  │                                                                ││
│  │  [Annotation at ~step 200: "Model learning bigrams" (subtle)]││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ GENERATED TEXT PROGRESSION                                    ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │                                                                ││
│  │  Step   0: "xjkl3 qqw zzz mmm ggg"                            ││
│  │           (gray, monospace, 14px)                              ││
│  │                                                                ││
│  │  Step 100: "the caat sit oon maaat"                           ││
│  │           (some chars blue, others gray)                       ││
│  │                                                                ││
│  │  Step 200: "the cat sit on mat and"                           ││
│  │           (most chars blue)                                    ││
│  │                                                                ││
│  │  Step 300: "the cat sat on the mat"                           ││
│  │           (all chars blue)                                     ││
│  │           └─ [HIGHLIGHTED] ← Synced with loss hover at 250   ││
│  │                                                                ││
│  │  Step 400: "the cat sat on the mat and purred"                ││
│  │           (blue + green, indicates quality)                    ││
│  │                                                                ││
│  │  Step 500: "the cat sat on the mat and purred contentedly"    ││
│  │           (all green, high quality)                            ││
│  │                                                                ││
│  │  [Scroll for more samples]                                     ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

Interactions:
• Hover loss curve → Highlight corresponding text sample
• Click dataset dropdown → Modal file picker
• Upload file → Show metadata preview → Enable "Train" button
• Click "Play" → Training starts, metrics stream in real-time
• Loss curve animates new points (Framer Motion spring)
• Text samples fade in as they're generated
```

---

### 6.3 Dashboard - Tab 2: Attention Evolution Cinema

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER & TAB BAR (same as Tab 1)                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐│
│  │ TRAINING CONTROLS           │  │ VIEW MODE                    ││
│  ├────────────────────────────┤  ├──────────────────────────────┤│
│  │ [▶ Play] [⏸] [⏹]          │  │ [Overview] [Detail]          ││
│  │ Speed: [1x ▼]              │  │ └─ ACTIVE                    ││
│  │                             │  │                               ││
│  │                             │  │ [2D] [3D]                    ││
│  │                             │  │ └─ ACTIVE                    ││
│  └────────────────────────────┘  └──────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ LAYER/HEAD SELECTOR (visible in Detail Mode only)            ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │ Layer: [Layer 0 ▼]         Head: [Head 0 ▼]                  ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ ATTENTION VISUALIZATION                                       ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │                                                                ││
│  │  ┌─────────────────────────────────────────────────────────┐ ││
│  │  │ OVERVIEW MODE: Heatmap Grid (2 layers × 2 heads = 4)    │ ││
│  │  ├─────────────────────────────────────────────────────────┤ ││
│  │  │                                                           │ ││
│  │  │  Layer 0, Head 0         Layer 0, Head 1                │ ││
│  │  │  ┌──────────────┐        ┌──────────────┐               │ ││
│  │  │  │▓▓░░░░░░░░░░░░│        │░░▓▓░░░░░░░░░░│               │ ││
│  │  │  │▓░▓░░░░░░░░░░░│        │░░░▓░░░░░░░░░░│               │ ││
│  │  │  │░░░▓░░░░░░░░░░│        │░░░░▓░░░░░░░░░│               │ ││
│  │  │  │░░░░▓░░░░░░░░░│        │░░░░░▓░░░░░░░░│               │ ││
│  │  │  │░░░░░▓░░░░░░░░│        │░░░░░░▓░░░░░░░│               │ ││
│  │  │  │░░░░░░▓░░░░░░░│        │░░░░░░░▓░░░░░░│               │ ││
│  │  │  │░░░░░░░▓░░░░░░│        │░░░░░░░░▓░░░░░│               │ ││
│  │  │  │░░░░░░░░▓░░░░░│        │░░░░░░░░░▓░░░░│               │ ││
│  │  │  └──────────────┘        └──────────────┘               │ ││
│  │  │                                                           │ ││
│  │  │  Layer 1, Head 0         Layer 1, Head 1                │ ││
│  │  │  ┌──────────────┐        ┌──────────────┐               │ ││
│  │  │  │░░░░▓░░░░░░░░░│        │░░░░░▓░░░░░░░░│               │ ││
│  │  │  │░░░░░▓░░░░░░░░│        │░░░░░░▓░░░░░░░│               │ ││
│  │  │  │░░░░░░▓░░░░░░░│        │░░░░░░░▓░░░░░░│               │ ││
│  │  │  │░░░░░░░▓░░░░░░│        │░░░░░░░░▓░░░░░│               │ ││
│  │  │  │░░░░░░░░▓░░░░░│        │░░░░░░░░░▓░░░░│               │ ││
│  │  │  │░░░░░░░░░▓░░░░│        │░░░░░░░░░░▓░░░│               │ ││
│  │  │  │░░░░░░░░░░▓░░░│        │░░░░░░░░░░░▓░░│               │ ││
│  │  │  │░░░░░░░░░░░▓░░│        │░░░░░░░░░░░░▓░│               │ ││
│  │  │  └──────────────┘        └──────────────┘               │ ││
│  │  │                                                           │ ││
│  │  │  [Click any heatmap to view in Detail Mode]             │ ││
│  │  │                                                           │ ││
│  │  └─────────────────────────────────────────────────────────┘ ││
│  │                                                                ││
│  │  ── OR (Detail Mode) ──                                       ││
│  │                                                                ││
│  │  ┌─────────────────────────────────────────────────────────┐ ││
│  │  │ DETAIL MODE: Single Heatmap (Layer 0, Head 0)           │ ││
│  │  ├─────────────────────────────────────────────────────────┤ ││
│  │  │                                                           │ ││
│  │  │        t    h    e         c    a    t    ...            │ ││
│  │  │    ┌────────────────────────────────────────┐            │ ││
│  │  │  t │ 0.82 0.05 0.01 0.00 0.03 0.04 0.02 ... │            │ ││
│  │  │  h │ 0.23 0.61 0.12 0.01 0.01 0.01 0.01 ... │            │ ││
│  │  │  e │ 0.05 0.18 0.73 0.02 0.01 0.01 0.00 ... │            │ ││
│  │  │    │ 0.01 0.02 0.03 0.89 0.02 0.02 0.01 ... │            │ ││
│  │  │  c │ 0.12 0.08 0.06 0.04 0.67 0.02 0.01 ... │            │ ││
│  │  │  a │ 0.08 0.09 0.07 0.05 0.23 0.45 0.03 ... │            │ ││
│  │  │  t │ 0.03 0.04 0.05 0.03 0.12 0.18 0.55 ... │            │ ││
│  │  │ .. │ ...  ...  ...  ...  ...  ...  ...  .. │            │ ││
│  │  │    └────────────────────────────────────────┘            │ ││
│  │  │                                                           │ ││
│  │  │  [Hover cell: "Attention from 'c' → 'a' = 0.23"]        │ ││
│  │  │                                                           │ ││
│  │  │  Color Scale (right side):                               │ ││
│  │  │  ┌──┐                                                     │ ││
│  │  │  │██│ 1.0  (Dark Blue)                                   │ ││
│  │  │  │▓▓│ 0.75                                                │ ││
│  │  │  │▒▒│ 0.50                                                │ ││
│  │  │  │░░│ 0.25                                                │ ││
│  │  │  │  │ 0.0  (White)                                        │ ││
│  │  │  └──┘                                                     │ ││
│  │  │                                                           │ ││
│  │  └─────────────────────────────────────────────────────────┘ ││
│  │                                                                ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ PLAYBACK TIMELINE                                             ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │                                                                ││
│  │  Step: ├───────────●──────────────────────┤ 250 / 500        ││
│  │        0            ↑                     500                 ││
│  │                  Scrubber                                      ││
│  │                                                                ││
│  │  [◀◀ Prev] [▶ Play] [▶▶ Next]                                ││
│  │   (step -50) (auto)   (step +50)                             ││
│  │                                                                ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

Animations:
• Heatmap cells smoothly transition colors (Framer Motion)
• Timeline scrubber interpolates between checkpoints
• Grid → Detail transition: Scale + fade
• 2D → 3D toggle: Rotate camera (Three.js)
```

---

### 6.4 Dashboard - Tab 3: Style Transfer Speed Run

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER & TAB BAR (same as Tab 1)                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ TEXT INPUT                                                    ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │ ┌──────────────────────────────────────────────────────────┐ ││
│  │ │ Paste your text here...                                   │ ││
│  │ │                                                            │ ││
│  │ │ (Textarea, auto-resize, 10 rows default)                  │ ││
│  │ │                                                            │ ││
│  │ │ Example:                                                   │ ││
│  │ │ "Dear Team, I hope this email finds you well...           │ ││
│  │ │  I wanted to follow up on our discussion...               │ ││
│  │ │  Please let me know your thoughts..."                     │ ││
│  │ │                                                            │ ││
│  │ └──────────────────────────────────────────────────────────┘ ││
│  │                                                                ││
│  │  ── OR ──                                                      ││
│  │                                                                ││
│  │  [📁 Upload .txt or .docx]  (react-dropzone)                 ││
│  │                                                                ││
│  │  ───────────────────────────────────────────────────────────  ││
│  │  Metadata:                                                     ││
│  │  • Characters: 1,234  │  Words: 234  │  Vocab: 45            ││
│  │                                                                ││
│  │  [⚠ Warning: Min 300 words recommended] (if < 300)           ││
│  │                                                                ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌────────────────────────────┐                                   │
│  │ TRAINING CONTROLS           │                                   │
│  ├────────────────────────────┤                                   │
│  │ [▶ Train] [⏹ Stop]         │                                   │
│  │ Speed: [2x ▼]              │                                   │
│  │ Step: [  >  ] [250/500]    │                                   │
│  └────────────────────────────┘                                   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ LOSS CURVE (same as Tab 1)                                    ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ SIDE-BY-SIDE COMPARISON                                       ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │                                                                ││
│  │  ┌─────────────────────────┐ │ ┌─────────────────────────┐   ││
│  │  │ Original Text Sample    │ │ │ Generated (Your Style)  │   ││
│  │  ├─────────────────────────┤ │ ├─────────────────────────┤   ││
│  │  │                         │ │ │                         │   ││
│  │  │ "Dear Team,             │ │ │ "Dear colleague,        │   ││
│  │  │                         │ │ │                         │   ││
│  │  │  I hope this email finds│ │ │  I trust this message   │   ││
│  │  │  you well. I wanted to  │ │ │  reaches you in good    │   ││
│  │  │  follow up on our       │ │ │  spirits. I wish to     │   ││
│  │  │  discussion regarding   │ │ │  revisit our dialogue   │   ││
│  │  │  the Q2 roadmap.        │ │ │  concerning Q2 plans.   │   ││
│  │  │                         │ │ │                         │   ││
│  │  │  Please let me know     │ │ │  Kindly inform me of    │   ││
│  │  │  your thoughts at your  │ │ │  your perspective when  │   ││
│  │  │  earliest convenience." │ │ │  convenient."           │   ││
│  │  │                         │ │ │                         │   ││
│  │  │ [Highlighted phrases    │ │ │ [Highlighted similar    │   ││
│  │  │  in blue]               │ │ │  style patterns]        │   ││
│  │  │                         │ │ │                         │   ││
│  │  └─────────────────────────┘ │ └─────────────────────────┘   ││
│  │                                                                ││
│  │  ┌─────────────────────────┐ │ ┌─────────────────────────┐   ││
│  │  │ Style Metrics           │ │ │ Confidence Metrics      │   ││
│  │  ├─────────────────────────┤ │ ├─────────────────────────┤   ││
│  │  │ • Formality: High (85)  │ │ │ • Confidence: 72%       │   ││
│  │  │ • Avg Sentence: 15 words│ │ │ • Avg Token Prob: 0.41  │   ││
│  │  │ • Vocab Richness: 0.68  │ │ │ • Perplexity: 12.3      │   ││
│  │  └─────────────────────────┘ │ └─────────────────────────┘   ││
│  │                                                                ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

Interactions:
• Paste text → Instant metadata calculation
• Drag-drop file → Auto-populate textarea
• Click "Train" → Training starts (20-30 sec)
• During training: Loss curve animates
• On completion: Generated sample appears on right
• Hover highlighted phrases → Show matching algorithm explanation
```

---

## 7. Routes, APIs & WebSocket Events

### 7.1 HTTP REST Endpoints

#### GET `/api/datasets`
**Purpose:** List pre-bundled datasets

**Response:**
```json
{
  "datasets": [
    {
      "name": "shakespeare",
      "display_name": "Shakespeare Complete Works",
      "char_count": 1115394,
      "vocab_size": 65,
      "word_count": 185000,
      "file_path": "/datasets/shakespeare.txt"
    },
    {
      "name": "poems",
      "display_name": "Classic Poetry Collection",
      "char_count": 45231,
      "vocab_size": 58,
      "word_count": 7500,
      "file_path": "/datasets/poems.txt"
    },
    {
      "name": "childrens",
      "display_name": "Children's Books",
      "char_count": 120000,
      "vocab_size": 52,
      "word_count": 20000,
      "file_path": "/datasets/childrens.txt"
    }
  ]
}
```

---

#### POST `/api/datasets/upload`
**Purpose:** Upload user file

**Request:** Multipart form data
- `file`: File object (.txt, .docx)

**Response:**
```json
{
  "dataset_id": "user_a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "filename": "my_essay.txt",
  "char_count": 2341,
  "vocab_size": 52,
  "word_count": 450,
  "text_preview": "In this essay, I argue that..."
}
```

**Error Responses:**
- `400`: File too large (> 10MB)
- `415`: Unsupported file type
- `500`: File processing error

---

#### POST `/api/datasets/from-text`
**Purpose:** Create dataset from pasted text

**Request:**
```json
{
  "text": "User's pasted text content goes here..."
}
```

**Response:** (Same as upload)

---

#### POST `/api/sessions/create`
**Purpose:** Initialize training session

**Request:**
```json
{
  "feature_type": "watch_learn",  // or "attention_cinema" or "style_transfer"
  "dataset_id": "shakespeare",     // or user dataset ID
  "hyperparameters": {
    "batch_size": 32,
    "max_iters": 500,
    "learning_rate": 0.001,
    "eval_interval": 50
  }
}
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "idle",
  "model_config": {
    "vocab_size": 65,
    "n_embd": 16,
    "n_layer": 2,
    "n_head": 2,
    "block_size": 64
  },
  "training_config": {
    "batch_size": 32,
    "max_iters": 500,
    "learning_rate": 0.001,
    "eval_interval": 50
  },
  "created_at": "2026-02-13T10:30:00Z"
}
```

---

#### GET `/api/sessions/{session_id}`
**Purpose:** Get session status

**Response:**
```json
{
  "session_id": "550e8400-...",
  "status": "running",
  "current_iter": 250,
  "max_iters": 500,
  "progress": 0.5,
  "started_at": "2026-02-13T10:31:00Z"
}
```

---

#### DELETE `/api/sessions/{session_id}`
**Purpose:** Terminate session

**Response:**
```json
{
  "message": "Session terminated",
  "session_id": "550e8400-..."
}
```

---

### 7.2 WebSocket Events (Socket.IO)

#### Client → Server

**`start_training`**
```json
{
  "session_id": "550e8400-..."
}
```

**`pause_training`**
```json
{
  "session_id": "550e8400-..."
}
```

**`resume_training`**
```json
{
  "session_id": "550e8400-..."
}
```

**`stop_training`**
```json
{
  "session_id": "550e8400-..."
}
```

**`step_training`**
```json
{
  "session_id": "550e8400-..."
}
```

**`set_speed`**
```json
{
  "session_id": "550e8400-...",
  "speed_multiplier": 2.0  // 1.0, 2.0, 5.0, 10.0
}
```

---

#### Server → Client

**`training_started`**
```json
{
  "session_id": "550e8400-...",
  "timestamp": 1707818400
}
```

**`training_metrics`**
```json
{
  "session_id": "550e8400-...",
  "step": 250,
  "train_loss": 2.145,
  "val_loss": 2.312,
  "timestamp": 1707818410
}
```

**`generated_sample`**
```json
{
  "session_id": "550e8400-...",
  "step": 250,
  "text": "the cat sat on the mat",
  "prompt": "the cat",
  "timestamp": 1707818410
}
```

**`attention_snapshot`**
```json
{
  "session_id": "550e8400-...",
  "step": 250,
  "layer": 0,
  "head": 1,
  "matrix": [
    [0.82, 0.05, 0.01, ...],
    [0.23, 0.61, 0.12, ...],
    ...
  ],
  "tokens": ["t", "h", "e", " ", "c", "a", "t"],
  "timestamp": 1707818410
}
```

**`training_paused`**
```json
{
  "session_id": "550e8400-...",
  "current_step": 250,
  "timestamp": 1707818420
}
```

**`training_resumed`**
```json
{
  "session_id": "550e8400-...",
  "timestamp": 1707818430
}
```

**`training_stopped`**
```json
{
  "session_id": "550e8400-...",
  "reason": "user_requested",
  "timestamp": 1707818440
}
```

**`training_completed`**
```json
{
  "session_id": "550e8400-...",
  "final_train_loss": 1.234,
  "final_val_loss": 1.345,
  "total_time_seconds": 27.5,
  "timestamp": 1707818450
}
```

**`error`**
```json
{
  "session_id": "550e8400-...",
  "error_type": "out_of_memory",
  "message": "Input text too large. Try < 1000 words.",
  "timestamp": 1707818460
}
```

---

### 7.3 WebSocket Connection Flow

```
┌─────────────┐                                    ┌─────────────┐
│   React     │                                    │   Flask     │
│  Component  │                                    │  SocketIO   │
└──────┬──────┘                                    └──────┬──────┘
       │                                                   │
       │ 1. useEffect(() => connect)                      │
       │──────────────────────────────────────────────────>│
       │                                                   │
       │ 2. emit('join', {session_id})                    │
       │──────────────────────────────────────────────────>│
       │                                                   │
       │ 3. on('joined_room', callback)                   │
       │<──────────────────────────────────────────────────│
       │                                                   │
       │ 4. emit('start_training', {session_id})          │
       │──────────────────────────────────────────────────>│
       │                                                   │
       │                                         [Start background task]
       │                                                   │
       │ 5. on('training_started', callback)              │
       │<──────────────────────────────────────────────────│
       │                                                   │
       │                                         [Training loop begins]
       │                                                   │
       │ 6. on('training_metrics', callback)              │
       │<──────────────────────────────────────────────────│
       │   (every eval_interval steps)                    │
       │                                                   │
       │ 7. on('generated_sample', callback)              │
       │<──────────────────────────────────────────────────│
       │                                                   │
       │ 8. on('attention_snapshot', callback)            │
       │<──────────────────────────────────────────────────│
       │   (one per layer/head)                           │
       │                                                   │
       │                                         [Training completes]
       │                                                   │
       │ 9. on('training_completed', callback)            │
       │<──────────────────────────────────────────────────│
       │                                                   │
       │ 10. disconnect()                                 │
       │──────────────────────────────────────────────────>│
       │                                                   │
```

---

## 8. Detailed Feature Specifications

### 8.1 Feature 1: Watch It Learn to Spell

**Purpose:** Visualize text generation quality improving over training steps

**User Journey:**
1. User lands on Tab 1 (default view)
2. Selects dataset from dropdown OR uploads .txt file
3. Clicks "Play" button
4. Training begins, loss curve animates
5. Generated text samples appear every 50 steps
6. User hovers loss curve to see corresponding text
7. Training completes, all 10 samples visible
8. User can replay by clicking "Play" again

**Technical Flow:**
```
User Action: Click "Play"
    ↓
Frontend: emit('start_training', {session_id})
    ↓
Backend: Start training loop (background task)
    ↓
Every 50 steps:
  1. Evaluate train/val loss
  2. Generate text sample (100 chars)
  3. emit('training_metrics', {step, train_loss, val_loss})
  4. emit('generated_sample', {step, text, prompt})
    ↓
Frontend: Receive events
  1. Update loss_history state
  2. Append to generated_samples state
  3. Trigger re-render
  4. Framer Motion animates new point on chart
  5. Fade in new text sample
    ↓
Training completes (step 500)
    ↓
Backend: emit('training_completed', {final_loss, time})
    ↓
Frontend: Show completion state, enable replay
```

**Key UI States:**
- **Idle:** "Play" button enabled, dataset selected
- **Running:** "Play" becomes "Pause", loss curve animating
- **Paused:** "Pause" becomes "Play", "Step" button enabled
- **Completed:** "Play" resets to "Replay", all samples visible

**Edge Cases:**
- **User switches tabs mid-training:** Training continues in background
- **User selects new dataset mid-training:** Show confirmation modal "Stop current training?"
- **Upload fails:** Show error toast, keep previous dataset selected
- **Training crashes:** emit('error'), show error message, allow restart

**Tooltips:**
- Dataset dropdown: "Choose training data. Smaller datasets train faster."
- Play button: "Start training from scratch"
- Speed selector: "Adjust training speed (faster = less smooth)"
- Loss curve: "Lower loss = better predictions"
- Text samples: "Hover loss curve to see output at different stages"

---

### 8.2 Feature 2: Attention Evolution Cinema

**Purpose:** Visualize attention pattern formation during training

**User Journey:**
1. User clicks "Attention Cinema" tab
2. Clicks "Play" to start training
3. Watches attention heatmaps evolve in grid view (Overview)
4. Clicks specific heatmap to enter Detail view
5. Scrubs timeline to see patterns at different steps
6. Toggles 3D view to see attention as heights
7. Switches between layers/heads via dropdowns
8. Uses playback controls to step through checkpoints

**Technical Flow:**
```
User Action: Click "Play"
    ↓
Frontend: emit('start_training', {session_id})
    ↓
Backend: Start training loop
    ↓
Every 50 steps:
  1. Extract attention weights from all heads
     (2 layers × 2 heads = 4 snapshots)
  2. Convert tensors to nested lists
  3. emit('attention_snapshot', {step, layer, head, matrix, tokens})
     × 4 times (one per head)
    ↓
Frontend: Receive 4 events per checkpoint
  1. Group by step number
  2. Store in attention_snapshots state
  3. Update heatmap visualizations
  4. Framer Motion transitions colors
    ↓
User Action: Scrub timeline to step 200
    ↓
Frontend: Find nearest checkpoint
  1. Get snapshots at step 200
  2. Interpolate if between checkpoints
  3. Update heatmaps with smooth transition
```

**Visualization Modes:**

**Overview Mode:**
- 2×2 grid of small heatmaps
- Each cell is 200px × 200px
- 16×16 attention matrix (truncated if longer)
- Color: White (0.0) → Dark Blue (1.0)
- Click any cell → Switch to Detail Mode

**Detail Mode:**
- Single large heatmap (600px × 600px)
- Full resolution attention matrix
- Axis labels show actual tokens
- Hover cell → Tooltip with exact value
- Color scale legend on right side

**3D Mode (Detail only):**
- Three.js scene with bar chart
- Height = attention weight
- Camera controls: Drag to rotate, scroll to zoom
- Color same as 2D (blue gradient by height)

**Timeline Scrubber:**
- Slider from step 0 to 500
- Snaps to checkpoints (every 50)
- Smooth interpolation between snaps
- Play button auto-advances at configurable FPS

**Key UI States:**
- **Idle:** Heatmaps show zeros (white)
- **Training:** Heatmaps update every 50 steps
- **Scrubbing:** Heatmaps transition smoothly
- **Paused:** Timeline frozen, can scrub manually

**Edge Cases:**
- **Switch layer/head mid-training:** Immediately show that head's latest snapshot
- **3D mode on low-end Mac:** Falls back to 2D with warning
- **Very long sequence (>64 tokens):** Truncate display, show scroll
- **Training hasn't reached first checkpoint:** Show loading state

**Tooltips:**
- Overview/Detail toggle: "Overview: See all layers/heads. Detail: Drill into one."
- 2D/3D toggle: "3D shows attention as bar heights"
- Layer dropdown: "Select which transformer layer to visualize"
- Timeline scrubber: "Scrub to see attention patterns evolve"
- Heatmap cells: "Brighter = more attention. Hover for exact values."

---

### 8.3 Feature 3: Style Transfer Speed Run

**Purpose:** Train on user's writing, generate in their style

**User Journey:**
1. User clicks "Style Transfer" tab
2. Pastes email signature or uploads .docx essay
3. Sees metadata: 234 words, vocab 45
4. Clicks "Train" button
5. Watches training for 20 seconds (2x speed default)
6. Sees generated text appear on right side
7. Compares style metrics: Formality matches!
8. Highlighted phrases show what model learned

**Technical Flow:**
```
User Action: Paste text into textarea
    ↓
Frontend: 
  1. Count chars, words, unique chars
  2. Display metadata
  3. Validate (min 50 words, max 10K words)
  4. Enable "Train" button if valid
    ↓
User Action: Click "Train"
    ↓
Frontend:
  1. POST /api/datasets/from-text {text}
  2. Receive dataset_id
  3. POST /api/sessions/create {dataset_id, feature_type: 'style_transfer'}
  4. Receive session_id
  5. emit('start_training', {session_id})
    ↓
Backend:
  1. Tokenize user text (character-level)
  2. Build vocabulary
  3. Create train/val split (90/10)
  4. Initialize model with user's vocab_size
  5. Start training loop (speed_multiplier=2.0 default)
    ↓
Every 50 steps:
  1. Evaluate loss
  2. Generate sample with same prompt as training sample
  3. emit('training_metrics')
  4. emit('generated_sample')
    ↓
Training completes:
  1. Compute style metrics on generated text
     - Formality score (keyword analysis)
     - Avg sentence length
     - Vocab richness
  2. emit('style_metrics', {formality, avg_sent_len, vocab_richness})
    ↓
Frontend:
  1. Display generated text on right
  2. Display style metrics for comparison
  3. Highlight matching phrases (naive string matching)
```

**Style Metrics Calculation:**

**Formality Score (0-100):**
```python
formal_words = ["regarding", "pursuant", "aforementioned", "nevertheless", ...]
informal_words = ["gonna", "wanna", "yeah", "stuff", ...]

formal_count = sum(1 for word in text if word in formal_words)
informal_count = sum(1 for word in text if word in informal_words)

formality = 50 + (formal_count - informal_count) * 10  # Clamped to 0-100
```

**Avg Sentence Length:**
```python
sentences = text.split('.')
avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
```

**Vocab Richness:**
```python
unique_words = len(set(text.lower().split()))
total_words = len(text.split())
richness = unique_words / total_words  # 0.0 to 1.0
```

**Confidence Metrics:**

**Avg Token Probability:**
```python
# During generation, store probability of selected token
probs = [0.62, 0.41, 0.78, ...]  # One per generated token
avg_prob = sum(probs) / len(probs)
```

**Perplexity:**
```python
# Cross-entropy loss converted to perplexity
perplexity = exp(loss)
```

**Key UI States:**
- **Empty Input:** "Train" button disabled, placeholder text visible
- **Valid Input:** "Train" button enabled, metadata displayed
- **Training:** Progress bar, loss curve animating
- **Completed:** Generated text appears, metrics shown

**Edge Cases:**
- **Input < 50 words:** Show error: "Min 50 words required"
- **Input > 10,000 words:** Show error: "Max 10,000 words. Text truncated."
- **Special characters (emoji, etc.):** Filtered during tokenization
- **Training OOM:** emit('error', "Text too large"), suggest reducing length
- **Generated text is gibberish:** Show anyway with low confidence score

**Tooltips:**
- Text input: "Paste your writing (emails, essays, tweets). Min 50 words."
- Upload button: "Upload .txt or .docx file"
- Train button: "Train model to learn your writing style (20-30 sec)"
- Style metrics: "How formal/structured your writing is"
- Confidence metrics: "How confident the model is in its generations"

---

## 9. Error Handling & Validation

### 9.1 Input Validation

#### Dataset Upload
```python
def validate_file_upload(file):
    """Validate uploaded file."""
    # Check file size
    if file.size > 10 * 1024 * 1024:  # 10 MB
        raise ValueError("File too large. Max 10MB.")
    
    # Check file type
    allowed_extensions = ['.txt', '.docx']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise ValueError(f"Unsupported file type. Use {allowed_extensions}")
    
    # Try to read file
    try:
        if file_ext == '.txt':
            text = file.read().decode('utf-8')
        elif file_ext == '.docx':
            doc = docx.Document(file)
            text = '\n'.join([para.text for para in doc.paragraphs])
    except Exception as e:
        raise ValueError(f"Failed to read file: {str(e)}")
    
    # Check text length
    if len(text) < 100:  # Min 100 chars
        raise ValueError("Text too short. Min 100 characters.")
    
    if len(text) > 5_000_000:  # Max 5M chars
        raise ValueError("Text too long. Max 5M characters.")
    
    return text
```

#### Text Input Validation (Frontend)
```typescript
function validateTextInput(text: string): { valid: boolean; error?: string } {
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).length;
  
  if (charCount < 50) {
    return { valid: false, error: "Min 50 characters required" };
  }
  
  if (charCount > 50000) {
    return { valid: false, error: "Max 50,000 characters exceeded" };
  }
  
  if (wordCount < 10) {
    return { valid: false, error: "Min 10 words required" };
  }
  
  return { valid: true };
}
```

#### Hyperparameter Validation
```python
def validate_hyperparameters(config):
    """Validate training hyperparameters."""
    if config['batch_size'] < 1 or config['batch_size'] > 128:
        raise ValueError("Batch size must be 1-128")
    
    if config['max_iters'] < 10 or config['max_iters'] > 10000:
        raise ValueError("Max iters must be 10-10000")
    
    if config['learning_rate'] <= 0 or config['learning_rate'] > 0.1:
        raise ValueError("Learning rate must be 0-0.1")
    
    if config['eval_interval'] < 1:
        raise ValueError("Eval interval must be >= 1")
    
    return True
```

### 9.2 Error Handling Patterns

#### Backend Error Handling
```python
# app.py

@app.route('/api/sessions/create', methods=['POST'])
def create_session():
    try:
        data = request.get_json()
        
        # Validate input
        validate_session_config(data)
        
        # Create session
        session_id = training_manager.create_session(data)
        
        return jsonify({
            'session_id': session_id,
            'status': 'created'
        }), 201
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
    except Exception as e:
        logger.error(f"Failed to create session: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@socketio.on('start_training')
def handle_start_training(data):
    try:
        session_id = data['session_id']
        
        # Validate session exists
        if session_id not in sessions:
            emit('error', {
                'error_type': 'invalid_session',
                'message': 'Session not found'
            })
            return
        
        # Start training
        training_manager.start_training(session_id)
        
        emit('training_started', {
            'session_id': session_id,
            'timestamp': time.time()
        })
    
    except OutOfMemoryError as e:
        emit('error', {
            'session_id': session_id,
            'error_type': 'out_of_memory',
            'message': 'Input too large. Try reducing text size.'
        })
    
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        emit('error', {
            'session_id': session_id,
            'error_type': 'training_failed',
            'message': 'Training failed. Please try again.'
        })
```

#### Frontend Error Handling
```typescript
// hooks/useTrainingSession.ts

export function useTrainingSession(sessionId: string) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.IDLE);
  
  useEffect(() => {
    socket.on('error', (data: any) => {
      if (data.session_id === sessionId) {
        setError(data.message);
        setStatus(SessionStatus.ERROR);
        
        // Show error toast
        toast.error(data.message, {
          duration: 5000,
          position: 'top-right'
        });
      }
    });
    
    return () => {
      socket.off('error');
    };
  }, [sessionId]);
  
  const startTraining = async () => {
    try {
      setError(null);
      setStatus(SessionStatus.RUNNING);
      socket.emit('start_training', { session_id: sessionId });
    } catch (err) {
      setError('Failed to start training');
      setStatus(SessionStatus.ERROR);
    }
  };
  
  return { status, error, startTraining };
}
```

### 9.3 Error Types & Messages

#### User-Facing Error Messages

| Error Type | Message | Action |
|------------|---------|--------|
| `file_too_large` | "File too large. Max 10MB." | Show file size, suggest compression |
| `file_invalid_type` | "Unsupported file type. Use .txt or .docx" | Show supported formats |
| `text_too_short` | "Text too short. Min 50 characters required." | Show current count |
| `text_too_long` | "Text too long. Max 50,000 characters." | Offer to truncate |
| `out_of_memory` | "Input too large for training. Try < 1000 words." | Show word count |
| `session_not_found` | "Session expired. Please restart." | Clear state, return to idle |
| `training_failed` | "Training crashed. Please try again." | Offer to retry |
| `network_error` | "Connection lost. Reconnecting..." | Auto-reconnect WebSocket |

---

## 10. Appendices

### 10.1 Color Palette Reference

```css
/* Dark Theme Base */
--bg-primary: #0F172A;      /* slate-900 */
--bg-secondary: #1E293B;    /* slate-800 */
--bg-tertiary: #334155;     /* slate-700 */

/* Text Colors */
--text-primary: #F1F5F9;    /* slate-100 */
--text-secondary: #CBD5E1;  /* slate-300 */
--text-dim: #64748B;        /* slate-500 */

/* Primary Colors (Blues) */
--primary-blue: #3B82F6;    /* blue-500 */
--primary-light: #60A5FA;   /* blue-400 */
--primary-dark: #2563EB;    /* blue-600 */

/* Accent Colors */
--accent-cyan: #06B6D4;     /* cyan-500 */
--accent-purple: #8B5CF6;   /* violet-500 */
--accent-pink: #EC4899;     /* pink-500 */

/* Semantic Colors */
--success: #10B981;         /* green-500 */
--warning: #F59E0B;         /* amber-500 */
--error: #EF4444;           /* [NOT USED - no reds] */
--info: #3B82F6;            /* blue-500 */

/* Gradients */
--gradient-neural: linear-gradient(135deg, #3B82F6, #06B6D4);
--gradient-accent: linear-gradient(135deg, #8B5CF6, #EC4899);

/* Attention Heatmap */
--heatmap-low: #FFFFFF;     /* white */
--heatmap-mid: #60A5FA;     /* blue-400 */
--heatmap-high: #1E3A8A;    /* blue-900 */
```

### 10.2 Typography System

```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-6xl: 3.75rem;   /* 60px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 10.3 Spacing System (8px Grid)

```css
/* Spacing Scale (multiples of 8px) */
--space-1: 0.5rem;   /* 8px */
--space-2: 1rem;     /* 16px */
--space-3: 1.5rem;   /* 24px */
--space-4: 2rem;     /* 32px */
--space-5: 2.5rem;   /* 40px */
--space-6: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
--space-10: 5rem;    /* 80px */
--space-12: 6rem;    /* 96px */
```

### 10.4 Animation Timings

```typescript
// Framer Motion Variants

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const lossPointAnimation = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0, 1, 1]
  },
  transition: {
    duration: 0.6,
    ease: 'easeInOut',
    times: [0, 0.5, 1]
  }
};

export const heatmapCellTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};
```

### 10.5 Glossary

| Term | Definition |
|------|------------|
| **Attention** | Mechanism allowing model to focus on relevant parts of input |
| **Autoregressive** | Generating one token at a time, using previous tokens |
| **Block Size** | Maximum sequence length model can process |
| **Character-level** | Tokenization at character granularity (vs. word/subword) |
| **Cross-entropy Loss** | Loss function measuring prediction error |
| **Embedding** | Dense vector representation of token |
| **Head (Attention)** | One of multiple parallel attention mechanisms |
| **Layer Normalization** | Normalizing activations within a layer |
| **Perplexity** | Metric derived from loss; lower = better |
| **Residual Connection** | Skip connection adding input to layer output |
| **Softmax** | Function converting logits to probability distribution |
| **Temperature** | Parameter controlling randomness in sampling |
| **Transformer** | Neural network architecture using attention |
| **Weight Tying** | Sharing weights between embedding and output layers |

### 10.6 File Structure Reference

```
llmbreaker/
├── backend/
│   ├── app.py                    # Flask app entry point
│   ├── micro_gpt.py              # Model architecture
│   ├── training_manager.py       # Session management
│   ├── trainer.py                # Training loop
│   ├── dataset_loader.py         # Dataset handling
│   ├── metrics_emitter.py        # WebSocket emission
│   ├── requirements.txt          # Python dependencies
│   ├── datasets/
│   │   ├── shakespeare.txt
│   │   ├── poems.txt
│   │   └── childrens.txt
│   └── uploads/                  # User uploads (temp)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   │   ├── LandingPage.jsx
│   │   │   │   ├── AnimatedBackground.jsx
│   │   │   │   └── LaunchButton.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── TabBar.jsx
│   │   │   │   └── SessionStatus.jsx
│   │   │   ├── shared/
│   │   │   │   ├── TrainingControls.jsx
│   │   │   │   ├── LossCurveChart.jsx
│   │   │   │   ├── Tooltip.jsx
│   │   │   │   └── FileUploader.jsx
│   │   │   └── tabs/
│   │   │       ├── WatchItLearnTab.jsx
│   │   │       ├── AttentionCinemaTab.jsx
│   │   │       └── StyleTransferTab.jsx
│   │   ├── contexts/
│   │   │   ├── TrainingContext.jsx
│   │   │   ├── MetricsContext.jsx
│   │   │   └── UIContext.jsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useTrainingSession.ts
│   │   │   └── useAnimatedMetrics.ts
│   │   ├── utils/
│   │   │   ├── apiClient.ts
│   │   │   └── formatters.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md
└── setup.sh                      # Installation script (optional)
```

### 10.7 Setup & Launch Instructions

#### Prerequisites
- macOS 11+
- Python 3.9+
- Node.js 18+

#### Installation

```bash
# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --break-system-packages torch==2.1.0 torchvision torchaudio
pip install --break-system-packages flask==3.0.0 flask-socketio==5.3.0 flask-cors==4.0.0
pip install --break-system-packages eventlet==0.33.0 python-docx==1.1.0
pip install --break-system-packages numpy==1.26.0 python-dotenv==1.0.0

# Frontend setup
cd ../frontend
npm install
```

#### Launch (Two Terminals)

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python app.py
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Server starts on http://localhost:3000
```

**Access Application:**
Open browser to `http://localhost:3000`

---

**END OF DESIGN DOCUMENT**