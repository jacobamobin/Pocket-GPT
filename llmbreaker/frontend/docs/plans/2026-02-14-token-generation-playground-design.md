# Token Generation Playground - Design Document

**Date:** 2026-02-14
**Status:** Approved
**Author:** Claude + User

## Overview

Add an interactive token-by-token generation playground accessible from any tab. Users can input text and watch the model continue it character-by-character, seeing probability distributions for each predicted token. This is a proof-of-concept educational feature that demonstrates autoregressive generation.

## Goals

- Show how LLMs generate text token-by-token
- Visualize probability distributions for next-token prediction
- Allow interactive exploration (pause, step, choose different tokens)
- Demonstrate context window limitations (64 characters)
- Reuse existing UI patterns (playback controls, neural theme)

## Non-Goals

- Full chatbot with conversation history
- Multi-model comparison
- Fine-tuning or model editing
- Production-ready inference API

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Header (new button: "💬 Playground")   │
└─────────────────────────────────────────┘
                    ↓ opens
        ┌───────────────────────┐
        │  GenerationDrawer     │  ← Slide-out from right
        │  - Input text area    │
        │  - Playback controls  │
        │  - Generated output   │
        │  - Probability bars   │
        └───────────────────────┘
                    ↓ calls
        ┌───────────────────────┐
        │  Backend API          │
        │  POST /api/generate-  │
        │       next-token      │
        └───────────────────────┘
                    ↓ uses
        ┌───────────────────────┐
        │  Active Model         │
        │  (from current tab's  │
        │   training session)   │
        └───────────────────────┘
```

**Key Decisions:**
- Drawer slides in from right (doesn't block main content)
- Uses active model from current tab's training session
- If no active model, shows "Train a model first" message
- Playback state lives entirely in frontend (React state)
- Context window visualization uses CSS to dim out-of-context characters

---

## Backend API

### Endpoint

```
POST /api/generate-next-token
```

### Request Body

```json
{
  "session_id": "abc-123",
  "context": "Hello wor",
  "temperature": 1.0
}
```

### Response

```json
{
  "next_token": "l",
  "probabilities": [
    {"token": "l", "prob": 0.42},
    {"token": "d", "prob": 0.18},
    {"token": "k", "prob": 0.12},
    {"token": " ", "prob": 0.08},
    {"token": "t", "prob": 0.05}
  ],
  "context_used": "llo wor"
}
```

### Implementation Details

1. Lookup session using `session_id` from `TrainingManager`
2. Get model checkpoint from session
3. Convert context string to token indices using session's vocab
4. Call `model.generate(idx, max_new_tokens=1, temperature=T, return_last_logits=True)`
5. Extract logits, apply softmax to get probabilities
6. Sort probabilities descending, return top 10
7. Return next token + probabilities

### Error Cases

| Error | Status | Response |
|-------|--------|----------|
| Session not found | 404 | `{"error": "Session not found"}` |
| Model not initialized | 400 | `{"error": "Model not initialized"}` |
| Invalid characters | 400 | `{"error": "Unknown characters: ['😀']"}` |
| Generation fails | 500 | `{"error": "Generation failed: <reason>"}` |

---

## Frontend Components

### 1. GenerationDrawer.jsx (main container)

**Responsibilities:**
- Manages playback state (idle/playing/paused)
- Tracks generation history (user input + generated tokens)
- Handles keyboard navigation
- Orchestrates API calls

**State:**
```javascript
{
  userInput: string,
  generatedTokens: string[],
  isPlaying: boolean,
  speed: number,          // milliseconds between tokens
  currentProbabilities: Array<{token, prob}>,
  highlightedIndex: number,  // for arrow key navigation
  currentSessionId: string | null
}
```

### 2. GenerationInput.jsx

**Features:**
- Textarea for user's starting text
- Character counter: "45 / 64 in context"
- Visual styling: last 64 chars normal opacity, earlier chars dimmed to 40%
- "Clear" button to reset

**Example:**
```jsx
<span className="opacity-40">This text is outside the context window. </span>
<span>Only these last 64 characters are seen by the model!</span>
```

### 3. GenerationControls.jsx

**Buttons:**
- Play (▶): Start autoregressive generation
- Pause (⏸): Stop after current token
- Step (▶|): Generate exactly one token
- Regenerate (↻): Clear generated tokens, start fresh

**Speed Slider:**
- Range: 100ms (fast) to 2000ms (slow)
- Default: 500ms

### 4. ProbabilityBars.jsx

**Display:**
- Top 5-10 tokens with horizontal bars
- Shows character (escaped if special: `'\n'`, `' '`), percentage
- Highlight chosen token with checkmark (✓)
- Support keyboard navigation (arrow keys + enter)

**Example:**
```
✓ → (space) ████████████ 42%   ← Highlighted (cyan border)
    k      █████ 18%
    t      ████ 12%
    w      ██ 8%
    a      ██ 5%
```

### 5. Header.jsx (modification)

**Change:**
- Add "💬 Playground" button next to tutorial button
- Opens/closes `GenerationDrawer`

---

## Data Flow & Interaction Logic

### Playback Loop (when playing)

```javascript
useEffect(() => {
  if (!isPlaying) return;

  const timer = setTimeout(async () => {
    const response = await fetch('/api/generate-next-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: currentSessionId,
        context: userInput + generatedTokens.join(''),
        temperature: 1.0
      })
    });

    const { next_token, probabilities } = await response.json();

    setGeneratedTokens(prev => [...prev, next_token]);
    setCurrentProbabilities(probabilities);
    setHighlightedIndex(0); // Reset to top

    // Continue if still playing and under max length
    if (generatedTokens.length >= 500) {
      setIsPlaying(false); // Safety limit
    }
  }, speed);

  return () => clearTimeout(timer);
}, [isPlaying, generatedTokens, speed]);
```

### User Interactions

| Action | Behavior |
|--------|----------|
| Click Play | Check model exists → start playback loop |
| Click Pause | Set `isPlaying = false`, loop stops |
| Click Step | Generate exactly one token, stay paused |
| Modify input | Clear generated tokens, reset probabilities |
| Click Regenerate | Clear generated tokens, start fresh |
| Arrow Up/Down | Navigate through probability list |
| Press Enter | Accept highlighted token (manual mode) |
| Press Space | Toggle play/pause |
| Press ESC | Close drawer |

### Context Window Visualization

```javascript
const fullText = userInput + generatedTokens.join('');
const contextLength = 64;

const outOfContext = fullText.slice(0, -contextLength);
const inContext = fullText.slice(-contextLength);

// Render:
<span className="opacity-40">{outOfContext}</span>
<span>{inContext}</span>
```

---

## UI/UX Details

### Drawer Appearance

- Width: 480px
- Position: Slides in from right
- Background: Dark neural-card with border
- Animation: Framer Motion slide (x: 480 → 0, duration: 300ms)
- Close: Backdrop click or ESC key

### Layout Structure

```
┌──────────────────────────────────┐
│ Token Playground              × │  ← Header
├──────────────────────────────────┤
│ ⚠️ Using model: shakespeare      │  ← Model indicator
│    (15K params, step 2000)       │
├──────────────────────────────────┤
│ Input Text:                      │
│ ┌──────────────────────────────┐ │
│ │ Once upon a time...          │ │  ← User input
│ │                              │ │
│ └──────────────────────────────┘ │
│ 45 chars (45 in context)         │
├──────────────────────────────────┤
│ [▶] [⏸] [▶|] [↻]  Speed: ━━━━━  │  ← Controls
├──────────────────────────────────┤
│ Generated Output:                │
│ ┌──────────────────────────────┐ │
│ │ Once upon a time there       │ │  ← Output
│ │ was a█                       │ │     (cursor blinks)
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ Next Token Probabilities:        │
│ → (space) ████████ 42%           │  ← Probability bars
│   k      ████ 18%                │     (arrow indicates
│   t      ███ 12%                 │      highlighted)
│   w      ██ 8%                   │
└──────────────────────────────────┘
```

### Animations

- New token: fade-in (200ms)
- Probability bars: animate width on update
- Cursor: blinks at end of generated text when playing
- Drawer: smooth slide (300ms ease-out)
- Highlight: smooth transition between probability options

### Keyboard Navigation

**Interactive Probability Selection:**

1. **Auto-play mode:** Top probability always chosen
2. **Manual mode (paused):**
   - Highlight shows current selection (default: top)
   - Arrow keys move highlight up/down
   - Enter accepts highlighted token
   - Step button also accepts highlighted token

**Use Case:**
"What if I explore a different path?" → Pause, arrow to "k" instead of " ", press Enter. Model continues from "timek" instead of "time ".

### Empty States

| State | Message |
|-------|---------|
| No model | "⚠️ No model trained. Train a model in any tab first." |
| No input | "Type something to get started..." |
| Generation complete | "✓ Generation complete. Modify input to continue." |
| Max length reached | "✓ Reached max length (500 tokens)" |

---

## Error Handling & Edge Cases

### Backend Errors

| Scenario | Response | Frontend Action |
|----------|----------|-----------------|
| No active session | 400 | Show "⚠️ Train a model first" |
| Model not initialized | 400 | Show "⚠️ Model initializing, try again" |
| Invalid characters | 400 | Highlight invalid chars in red |
| Generation fails | 500 | Toast + stop playback |

### Frontend Edge Cases

**1. User switches tabs while generating:**
- Drawer stays open but pauses
- Show: "⚠️ Switch back to [Tab Name] to continue"

**2. Training stops while drawer open:**
- Detect via session state
- Pause and show: "⚠️ Training session ended"

**3. Context exceeds 64 chars:**
- Dim older chars visually
- Show: "150 chars (last 64 in context)"
- Tooltip: "Model only sees the last 64 characters"

**4. Empty input:**
- Disable play/step buttons
- Show placeholder

**5. Max generation length (500 tokens):**
- Auto-stop to prevent infinite loops
- Show completion message

**6. Network timeout (5 seconds):**
- Abort request
- Toast: "Request timed out"
- Auto-pause

### Graceful Degradation

- Invalid session → clear error message instead of crash
- All errors log to console for debugging
- Playback automatically pauses on any error

---

## Implementation Approach

**Phase 1: Backend (1-2 hours)**
- Add `/api/generate-next-token` endpoint
- Implement token generation logic
- Test with existing models

**Phase 2: Frontend Core (2-3 hours)**
- Create `GenerationDrawer` component
- Add input, controls, output display
- Implement playback loop

**Phase 3: Probability Visualization (1-2 hours)**
- Create `ProbabilityBars` component
- Add keyboard navigation
- Implement manual token selection

**Phase 4: Polish (1 hour)**
- Context window visualization
- Error handling
- Animations and transitions

**Total Estimate:** 5-8 hours

---

## Success Criteria

- ✅ Users can open drawer from header
- ✅ Users can input text and generate tokens
- ✅ Playback controls work (play/pause/step)
- ✅ Top 5-10 probabilities display with bars
- ✅ Keyboard navigation works (arrow keys + enter)
- ✅ Context window visualization shows what model sees
- ✅ Graceful error handling when no model exists
- ✅ Smooth animations and responsive UI

---

## Future Enhancements (Out of Scope)

- Temperature slider
- Top-k/top-p sampling controls
- Save/load generation history
- Multiple model comparison
- Attention visualization during generation
- Export generated text
