# Guided Tutorial System - Implementation Plan

## Overview
Implement a spotlight-based guided tutorial system that teaches users about each tab in LLMBreaker with rich educational content and interactive elements.

**Design doc:** `docs/plans/2026-02-14-guided-tutorial-system-design.md`

---

## Phase 1: Core State Management (TutorialContext)

### 1.1 Create `src/contexts/TutorialContext.jsx`
**File:** `src/contexts/TutorialContext.jsx`

State shape:
```javascript
{
  active: boolean,           // Is tutorial currently running?
  chapterId: string | null,  // Current chapter: 'welcome' | 'watch_learn' | 'attention_cinema' | 'style_transfer'
  stepIndex: number,         // Current step within chapter
  completedChapters: Set<string>,  // Chapters user finished
  dismissedWelcome: boolean, // Has user seen first-visit overlay?
  spotlightTarget: {         // Currently highlighted element
    selector: string,
    position: 'top' | 'bottom' | 'left' | 'right',
  } | null
}
```

Actions:
- `START_TUTORIAL` - Start tutorial from beginning or specific chapter
- `NEXT_STEP` - Advance to next step
- `PREV_STEP` - Go back one step
- `END_TUTORIAL` - Exit tutorial
- `SET_CHAPTER` - Jump to specific chapter
- `DISMISS_WELCOME` - Mark welcome as seen

**Provider name:** `TutorialProvider`
**Export:** `TutorialContext`, `useTutorial()` hook

---

## Phase 2: Tutorial Data File

### 2.1 Create `src/data/tutorialChapters.js`
**File:** `src/data/tutorialChapters.js`

Export a `CHAPTERS` object with all chapter/step definitions.

Chapter structure:
```javascript
{
  id: 'watch_learn',
  tabId: 'watch_learn',
  title: 'Chapter 1: Watch It Learn',
  steps: [
    {
      target: '[data-tutorial="dataset-selector"]',
      position: 'bottom',
      title: 'Choose Your Training Data',
      content: 'The model learns by example. Pick a text corpus...',
      visual: 'dataset-diagram',
      action: 'click' // optional: require user to click element
    },
    // ... more steps
  ]
}
```

Required chapters:
1. **welcome** - First visit overlay (no target, centered)
2. **watch_learn** - 6-8 steps covering dataset, controls, progress, phases, samples
3. **attention_cinema** - 6-8 steps covering heatmap, layers/heads, evolution view
4. **style_transfer** - 5-6 steps covering text input, evolution view, completion

---

## Phase 3: Mini Visual Components

### 3.1 Create `src/components/tutorial/visuals/`
Create a directory for SVG diagram components.

**Files to create:**
- `DatasetDiagram.jsx` - Shows text → characters → model flow
- `ProgressDiagram.jsx` - Shows loss curve going down
- `AttentionDiagram.jsx` - Shows attention pattern grid
- `LayerDiagram.jsx` - Shows stacked layers concept
- `PhaseDiagram.jsx` - Shows learning phases timeline

Each component:
- Returns an inline SVG (viewBox="0 0 200 120")
- Uses stroke colors: `#60A5FA` (blue), `#06B6D4` (cyan)
- Simple, clean, educational style
- Exports default function

---

## Phase 4: TutorialSpotlight Component

### 4.1 Create `src/components/tutorial/TutorialSpotlight.jsx`
**File:** `src/components/tutorial/TutorialSpotlight.jsx`

Props received from context:
- `active`, `step`, `chapter`, `onNext`, `onPrev`, `onEnd`

Responsibilities:
1. **Backdrop** - Fixed overlay with `box-shadow` cutout technique
   - Use `getBoundingClientRect()` of target element
   - Create dynamic `box-shadow` with inset shadows around cutout
   - Animate position changes

2. **Teaching Card** - Floating panel with:
   - Step indicator: "Step 3 of 7"
   - Chapter title badge
   - Main content (rich text)
   - Mini visual (if applicable)
   - Action hint (if step requires user interaction)
   - Navigation buttons: "← Back", "Next →", "Exit"

3. **Positioning logic**:
   - Position card at `position` prop relative to cutout
   - Handle edge cases (card goes off-screen)
   - Support `center` position for welcome overlay

4. **Resize listener**:
   - Recalculate cutout on window resize
   - Handle target element no longer existing

---

## Phase 5: TutorialButton Component

### 5.1 Create `src/components/tutorial/TutorialButton.jsx`
**File:** `src/components/tutorial/TutorialButton.jsx`

Features:
- Icon: Graduation cap or book icon (SVG)
- Positioned in Header (right side, near ModelDropdown)
- Click opens chapter menu dropdown
- Chapter menu shows:
  - "Start Tutorial" (begin from welcome)
  - "Watch It Learn" (disabled if completed)
  - "Attention Cinema" (disabled if completed)
  - "Style Transfer" (disabled if completed)
  - Completion checkmarks for finished chapters
- Shows current chapter if tutorial is active

---

## Phase 6: TutorialWelcome Component

### 6.1 Create `src/components/tutorial/TutorialWelcome.jsx`
**File:** `src/components/tutorial/TutorialWelcome.jsx`

First-visit welcome overlay:
- Full-screen backdrop with blur
- Centered card with:
  - Logo "LLMBreaker"
  - "Welcome! Let's learn how LLMs work"
  - 3 feature highlights: Watch Training, Visualize Attention, Style Transfer
  - "Start Tutorial" (primary) and "Skip" (secondary) buttons
- Only shows if `!dismissedWelcome`
- Calls `DISMISS_WELCOME` on any button click

---

## Phase 7: Data Attribute Integration

### 7.1 Add `data-tutorial` attributes to tab components

**`src/components/tabs/WatchItLearnTab.jsx`:**
- DatasetSelector → `data-tutorial="dataset-selector"`
- TrainingControls → `data-tutorial="training-controls"`
- Progress bar area → `data-tutorial="progress-bar"`
- PhaseLabel → `data-tutorial="phase-label"`
- TokenStreamDisplay → `data-tutorial="token-stream"`

**`src/components/tabs/AttentionCinemaTab.jsx`:**
- DatasetSelector → `data-tutorial="attention-dataset"`
- TrainingControls → `data-tutorial="attention-controls"`
- ViewModeToggle → `data-tutorial="view-mode-toggle"`
- LayerHeadSelector → `data-tutorial="layer-head-selector"`
- AttentionHeatmapGrid → `data-tutorial="attention-grid"`

**`src/components/tabs/StyleTransferTab.jsx`:**
- TextInputPanel → `data-tutorial="style-input"`
- TrainingControls → `data-tutorial="style-controls"`
- StyleEvolutionDisplay → `data-tutorial="style-evolution"`

**`src/components/dashboard/Header.jsx`:**
- Logo area → `data-tutorial="logo"`
- Tutorial button → `data-tutorial="tutorial-btn"`

**`src/components/dashboard/TabBar.jsx`:**
- Tab buttons → `data-tutorial="tab-{watch_learn|attention_cinema|style_transfer}"`

---

## Phase 8: App Integration

### 8.1 Wrap App with TutorialProvider
**File:** `src/App.jsx`

Add provider around existing providers:
```jsx
<TutorialProvider>
  <TrainingProvider>
    <MetricsProvider>
      <ModelProvider>
        <UIProvider>
          {/* ... */}
        </UIProvider>
      </ModelProvider>
    </MetricsProvider>
  </TrainingProvider>
</TutorialProvider>
```

### 8.2 Add TutorialSpotlight to Dashboard
**File:** `src/components/dashboard/Dashboard.jsx`

Add `<TutorialSpotlight />` and `<TutorialWelcome />` at bottom of return, inside motion.div but after InfoDrawer.

### 8.3 Add TutorialButton to Header
**File:** `src/components/dashboard/Header.jsx`

Import and add `<TutorialButton />` to right side flex container, before or after ModelDropdown.

---

## Phase 9: Chapter Auto-Switch Logic

### 9.1 Implement tab switch detection
**In:** `src/components/dashboard/Dashboard.jsx` or via `UIContext`

When user switches tabs:
- Check if tutorial is active
- If current chapter doesn't match active tab, show prompt:
  - "You're leaving the Watch It Learn tutorial. Continue here or switch to the Attention Cinema chapter?"
  - Buttons: "Stay", "Switch to Attention Cinema"

Use `useEffect` on `ui.activeTab` to detect changes.

---

## Phase 10: Content Writing

### 10.1 Write all tutorial content
**In:** `src/data/tutorialChapters.js`

**Welcome Chapter:**
- Hook: "Ever wondered what's happening inside an AI as it learns?"
- Explain the 3 tabs briefly
- Offer to start with Watch It Learn

**Watch It Learn Chapter (7 steps):**
1. Dataset selection - explain training data concept
2. Training controls - play/pause/stop
3. Progress bar - loss curve visual
4. Phases - what the model learns at each stage
5. Live samples - see output improving
6. Model info - architecture details
7. Completion - encourage exploring other tabs

**Attention Cinema Chapter (7 steps):**
1. Overview - what attention patterns show
2. View modes - evolution vs grid vs detail
3. Heatmap grid - all heads at once
4. Layer/head selector - drilling down
5. 2D/3D toggle - different visualizations
6. Evolution view - seeing patterns form over time
7. Completion - move to Style Transfer

**Style Transfer Chapter (6 steps):**
1. Text input - paste your writing
2. Training controls - start learning
3. Loss curve - watching style transfer
4. Evolution view - samples improving
5. Completion - ready to explore

Each step should:
- Be 2-3 sentences max
- Use clear, simple language
- Teach ONE concept
- Reference the visible element

---

## Phase 11: Styling & Polish

### 11.1 Create `src/components/tutorial/tutorial.css`
**Or use Tailwind classes**

Styles needed:
- Spotlight backdrop transition (200ms)
- Card entrance animation (fade + slide)
- Button hover states
- Chapter menu dropdown styling
- Welcome overlay animations

### 11.2 Add responsive adjustments
- Mobile: Card position to bottom if no space
- Ensure cutout works on small screens
- Chapter menu may need to be full-width on mobile

---

## Phase 12: Testing & Fixes

### 12.1 Test each chapter
- Run through Watch It Learn completely
- Run through Attention Cinema completely
- Run through Style Transfer completely

### 12.2 Test edge cases
- Resize window during tutorial
- Switch tabs during tutorial
- Close/reopen tab during tutorial
- Click through rapidly
- Element doesn't exist (should skip or end gracefully)

### 12.3 Fix any issues found

---

## Execution Order

Execute phases 1-12 in order. Each phase builds on the previous.

**Estimated files to create:**
- `src/contexts/TutorialContext.jsx`
- `src/data/tutorialChapters.js`
- `src/components/tutorial/TutorialSpotlight.jsx`
- `src/components/tutorial/TutorialButton.jsx`
- `src/components/tutorial/TutorialWelcome.jsx`
- `src/components/tutorial/visuals/*.jsx` (5 visual components)

**Estimated files to modify:**
- `src/App.jsx`
- `src/components/dashboard/Dashboard.jsx`
- `src/components/dashboard/Header.jsx`
- `src/components/dashboard/TabBar.jsx`
- `src/components/tabs/WatchItLearnTab.jsx`
- `src/components/tabs/AttentionCinemaTab.jsx`
- `src/components/tabs/StyleTransferTab.jsx`

---

## Success Criteria

1. Tutorial launches on first visit (welcome overlay)
2. Tutorial button always accessible in header
3. Spotlight correctly highlights target elements
4. Teaching cards position correctly (don't overlap target)
5. Content is educational and clear
6. Progress saves to localStorage
7. User can exit and resume tutorials
8. Tab switching prompts chapter switch
9. All three tabs have complete tutorials
10. Mobile-responsive
