# Guided Tutorial System Design

**Goal:** Add a chapter-based guided tutorial that teaches users how LLMs work as they explore each tab, using spotlight highlights with rich teaching cards containing mini diagrams.

**Architecture:** A TutorialContext manages global tutorial state. A TutorialSpotlight overlay renders a dimmed backdrop with a cutout around the target element and a floating teaching card. Chapter/step data lives in a single data file. Elements are targeted via `data-tutorial` attributes.

**Tech Stack:** React context, Framer Motion, localStorage persistence, CSS clip-path for spotlight cutout, inline SVG mini-visuals.

---

## Architecture

### New Files

- `src/contexts/TutorialContext.jsx` — global state provider
- `src/components/tutorial/TutorialSpotlight.jsx` — overlay + teaching card
- `src/components/tutorial/TutorialButton.jsx` — header button with chapter menu
- `src/components/tutorial/TutorialWelcome.jsx` — first-visit welcome overlay
- `src/components/tutorial/visuals/` — directory of mini diagram components
- `src/data/tutorialChapters.js` — all chapter and step definitions

### State Shape (TutorialContext)

```js
{
  activeChapter: 'watch_learn' | 'attention_cinema' | 'style_transfer' | null,
  currentStep: number,
  completed: { watch_learn: false, attention_cinema: false, style_transfer: false },
  hasSeenWelcome: boolean,
}
```

All state is persisted to localStorage:
- `llmbreaker_tutorial_completed` — per-chapter completion
- `llmbreaker_tutorial_progress` — active chapter + step for resume
- `llmbreaker_tutorial_seen` — whether user has seen the welcome screen

### Integration Points

- `TutorialSpotlight` renders in Dashboard above all content (high z-index)
- `TutorialButton` renders in Header next to the Models dropdown
- Each tab component adds `data-tutorial="step-id"` attributes to key elements
- UIContext `SET_TAB` action is used when the tutorial needs to suggest tab navigation

---

## Tutorial Step Structure

Each step is a data object:

```js
{
  id: 'loss-curve',
  target: '[data-tutorial="loss-curve"]',
  position: 'bottom',                        // top | bottom | left | right | center
  title: 'The Loss Curve',
  content: [
    'Loss measures how wrong the model is. High loss = random guessing. Low loss = learning patterns.',
    'Watch it drop rapidly at first, then plateau as it tackles harder structures.',
  ],
  visual: 'loss-curve-sketch',              // key mapping to a mini visual component
  highlight: true,                          // whether to dim the rest of the page
}
```

The `visual` field maps to small purpose-built React components (~100-150px inline):

| Visual Key | Description |
|-----------|-------------|
| `loss-curve-sketch` | Animated SVG loss curve dropping from random to trained |
| `attention-matrix-demo` | Small 4x4 heatmap showing "The cat sat" self-attention |
| `token-flow` | Animated characters flowing into embeddings into predictions |
| `layer-stack` | Vertical stack diagram: input → layers → output |
| `embedding-space` | Mini 2D scatter showing words clustering by meaning |
| `gradient-descent` | Ball rolling down a curve toward minimum |
| `head-roles` | Side-by-side heads showing different attention patterns |
| `style-comparison` | Before/after text samples showing style convergence |

---

## Chapter Breakdown

### Chapter 1: How Models Learn (Watch It Learn tab, ~8-10 steps)

Teaches: tokens, character-level vocab, embeddings, forward pass, loss, gradient descent, text generation, training phases.

Steps spotlight: dataset selector, training controls, token stream, loss curve, text progression, probability tower, embedding star map, phase label, completion banner.

### Chapter 2: Inside the Black Box (Attention Cinema tab, ~6-8 steps)

Teaches: self-attention mechanism, what Q/K/V are intuitively, attention heads specializing, layers building on each other, how attention patterns evolve during training.

Steps spotlight: corpus selector, model info card, attention evolution view, attention grid, layer/head selector, detail heatmap, 3D view.

### Chapter 3: Teaching Your Style (Style Transfer tab, ~5-6 steps)

Teaches: fine-tuning concept, how a model adapts to a specific voice, overfitting vs generalization, style metrics, comparing input vs output.

Steps spotlight: text input panel, training controls, learning progress banner, loss curve, style evolution display, completion stats.

Each chapter ends with a completion card that directs the user to the next tab's chapter.

---

## Spotlight UI

### Backdrop
Full-screen `bg-black/60 backdrop-blur-sm` with a CSS box-shadow inset cutout around the target element. The target element appears to glow through the dim overlay.

### Teaching Card
~350-400px wide floating panel. Matches existing `.card` styling (dark slate background, subtle border, rounded corners).

Layout:
```
┌──────────────────────────────────────┐
│  Step 3 of 8               [×]      │
│                                      │
│  ── The Loss Curve ──               │
│                                      │
│  Explanation paragraph(s)            │
│                                      │
│  ┌──────────────────────────┐       │
│  │  mini visual component   │       │
│  └──────────────────────────┘       │
│                                      │
│  Additional explanation              │
│                                      │
│  [← Back]            [Next →]       │
│            Skip tutorial             │
└──────────────────────────────────────┘
```

### Positioning
Card checks available space around the target and picks the best side. Falls back to center-screen if target isn't visible or doesn't exist yet.

### Transitions
Framer Motion: card fades out → cutout morphs to new target → new card fades in.

---

## Header Button (TutorialButton)

Small "Guide" button in the Header with a book icon. On first visit, it pulses gently.

Clicking opens a dropdown menu:
- Chapter 1: How Models Learn ✓ (checkmark if completed)
- Chapter 2: Inside the Black Box
- Chapter 3: Teaching Your Style
- "Resume Chapter 2, Step 4" (if partially completed, shown at top)

---

## First-Visit Flow

1. User opens the app for the first time
2. Welcome overlay appears (centered, no spotlight):
   - "Welcome to LLMBreaker — learn how language models work by training one yourself."
   - Two buttons: **"Start the Guide"** / **"Skip, I'll explore"**
3. "Start the Guide" → switches to Watch It Learn tab, begins Chapter 1
4. "Skip" → dismisses, Guide button stays in header

## Returning Visit

- If mid-chapter, header button shows a subtle badge
- Clicking offers "Resume Chapter 2, Step 4" at the top of the menu
- Completed chapters show checkmarks

## Auto-Chapter Prompt

When user navigates to a new tab for the first time and that chapter hasn't started, a non-blocking toast appears: "New tab! Want to start the Attention Cinema guide?" with Yes/Dismiss.

---

## Data Attributes

Each tab adds `data-tutorial` attributes to spotlightable elements:

**Watch It Learn:**
- `data-tutorial="wil-dataset"` on DatasetSelector
- `data-tutorial="wil-controls"` on TrainingControls
- `data-tutorial="wil-token-stream"` on TokenStreamDisplay
- `data-tutorial="wil-loss-curve"` on LossCurveChart
- `data-tutorial="wil-text-progression"` on TextProgressionDisplay
- `data-tutorial="wil-probability"` on ProbabilityTower
- `data-tutorial="wil-embeddings"` on EmbeddingStarMap
- `data-tutorial="wil-phase"` on PhaseLabel

**Attention Cinema:**
- `data-tutorial="ac-corpus"` on corpus selector div
- `data-tutorial="ac-model-info"` on ModelInfoCard
- `data-tutorial="ac-controls"` on TrainingControls
- `data-tutorial="ac-evolution"` on AttentionEvolutionDisplay
- `data-tutorial="ac-grid"` on AttentionHeatmapGrid
- `data-tutorial="ac-detail"` on detail heatmap
- `data-tutorial="ac-layer-head"` on LayerHeadSelector

**Style Transfer:**
- `data-tutorial="st-text-input"` on TextInputPanel
- `data-tutorial="st-controls"` on TrainingControls
- `data-tutorial="st-progress"` on learning progress banner
- `data-tutorial="st-loss"` on LossCurveChart
- `data-tutorial="st-evolution"` on StyleEvolutionDisplay
