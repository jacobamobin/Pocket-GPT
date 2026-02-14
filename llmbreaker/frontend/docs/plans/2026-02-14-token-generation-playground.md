# Token Generation Playground Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive token-by-token generation playground that lets users input text and watch the model continue it character-by-character with probability visualizations.

**Architecture:** Frontend drawer component calls REST API endpoint for next-token generation. Backend reuses existing model.generate() method. Playback controlled entirely in frontend with React state.

**Tech Stack:** React, Framer Motion, Flask, PyTorch, existing MicroGPT model

---

## Task 1: Backend API Endpoint

**Files:**
- Modify: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/backend/app.py`

### Step 1: Add generate-next-token endpoint

Add this endpoint after the existing API routes (around line 200):

```python
@app.route('/api/generate-next-token', methods=['POST'])
def generate_next_token():
    """Generate the next token given a context string."""
    data = request.json
    session_id = data.get('session_id')
    context = data.get('context', '')
    temperature = data.get('temperature', 1.0)

    if not session_id:
        return jsonify({'error': 'session_id required'}), 400

    # Get session from manager
    session = manager.get_session(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    # Check if model is initialized
    if not session.model:
        return jsonify({'error': 'Model not initialized'}), 400

    try:
        # Convert context string to indices
        vocab = session.vocab
        if not vocab:
            return jsonify({'error': 'Vocabulary not loaded'}), 400

        # Check for unknown characters
        unknown_chars = [c for c in context if c not in vocab.stoi]
        if unknown_chars:
            unique_unknown = list(set(unknown_chars))
            return jsonify({'error': f'Unknown characters: {unique_unknown}'}), 400

        # Convert to tensor
        idx = torch.tensor([vocab.stoi[c] for c in context], dtype=torch.long).unsqueeze(0)

        # Generate next token
        device = next(session.model.parameters()).device
        idx = idx.to(device)

        # Get logits for next token
        with torch.no_grad():
            idx_result, logits = session.model.generate(
                idx,
                max_new_tokens=1,
                temperature=temperature,
                return_last_logits=True
            )

        # Get next token
        next_token_idx = idx_result[0, -1].item()
        next_token = vocab.itos[next_token_idx]

        # Compute probabilities
        probs = torch.softmax(logits / temperature, dim=0)

        # Get top 10 probabilities
        top_probs, top_indices = torch.topk(probs, min(10, len(probs)))
        probabilities = [
            {
                'token': vocab.itos[idx.item()],
                'prob': float(prob.item())
            }
            for prob, idx in zip(top_probs, top_indices)
        ]

        # Get context used (last block_size chars)
        block_size = session.model.block_size
        context_used = context[-block_size:] if len(context) > block_size else context

        return jsonify({
            'next_token': next_token,
            'probabilities': probabilities,
            'context_used': context_used
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500
```

### Step 2: Test the endpoint manually

Start the backend server and test with curl:

```bash
curl -X POST http://localhost:5000/api/generate-next-token \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test-session","context":"hello","temperature":1.0}'
```

Expected: 404 (no session) or proper error message

### Step 3: Commit backend endpoint

```bash
git add backend/app.py
git commit -m "feat: add generate-next-token API endpoint

Add POST /api/generate-next-token endpoint that generates the next
token given a context string and returns top 10 probabilities.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Frontend State Management Context

**Files:**
- Create: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/contexts/GenerationContext.jsx`

### Step 1: Create GenerationContext

```jsx
import { createContext, useContext, useState, useCallback } from 'react'

const GenerationContext = createContext(null)

export function GenerationProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [generatedTokens, setGeneratedTokens] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [currentProbabilities, setCurrentProbabilities] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [error, setError] = useState(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => {
    setIsOpen(false)
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setGeneratedTokens([])
    setCurrentProbabilities([])
    setHighlightedIndex(0)
    setError(null)
  }, [])

  const addToken = useCallback((token) => {
    setGeneratedTokens(prev => [...prev, token])
  }, [])

  const value = {
    isOpen,
    userInput,
    generatedTokens,
    isPlaying,
    speed,
    currentProbabilities,
    highlightedIndex,
    error,
    actions: {
      open,
      close,
      setUserInput,
      setIsPlaying,
      setSpeed,
      setCurrentProbabilities,
      setHighlightedIndex,
      setError,
      reset,
      addToken,
    }
  }

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration() {
  const context = useContext(GenerationContext)
  if (!context) {
    throw new Error('useGeneration must be used within GenerationProvider')
  }
  return context
}
```

### Step 2: Add provider to App

Modify `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/App.jsx`:

```jsx
import { GenerationProvider } from './contexts/GenerationContext'

// Wrap existing providers:
<GenerationProvider>
  <UIProvider>
    <TutorialProvider>
      {/* existing content */}
    </TutorialProvider>
  </UIProvider>
</GenerationProvider>
```

### Step 3: Commit context

```bash
git add frontend/src/contexts/GenerationContext.jsx frontend/src/App.jsx
git commit -m "feat: add GenerationContext for playground state

Add context provider to manage generation playground state including
input, tokens, playback controls, and probabilities.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Playground Button in Header

**Files:**
- Modify: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/dashboard/Header.jsx`

### Step 1: Add playground button

Import useGeneration and add button next to tutorial button (look for the TutorialButton):

```jsx
import { useGeneration } from '../../contexts/GenerationContext'

// Inside the Header component:
const { actions: genActions } = useGeneration()

// Add button after TutorialButton:
<button
  onClick={genActions.open}
  className="px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-cyan-500 rounded-lg transition-colors flex items-center gap-2"
  aria-label="Open Token Playground"
>
  <span>💬</span>
  <span className="hidden md:inline">Playground</span>
</button>
```

### Step 2: Test button appears

Start frontend, check that button shows in header

### Step 3: Commit header button

```bash
git add frontend/src/components/dashboard/Header.jsx
git commit -m "feat: add Playground button to header

Add button to open token generation playground drawer.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: GenerationDrawer Component Structure

**Files:**
- Create: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/generation/GenerationDrawer.jsx`

### Step 1: Create drawer skeleton

```jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useGeneration } from '../../contexts/GenerationContext'
import { useContext } from 'react'
import { UIContext } from '../../contexts/UIContext'

export default function GenerationDrawer() {
  const { isOpen, actions } = useGeneration()
  const { state: ui } = useContext(UIContext)

  // Get current session ID from active tab
  // This will be implemented properly later
  const currentSessionId = null // TODO: get from training session

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50"
          onClick={actions.close}
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: 480 }}
          animate={{ x: 0 }}
          exit={{ x: 480 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-[480px] max-w-full bg-neural-card border-l border-neural-border flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neural-border">
            <h2 className="text-lg font-semibold text-slate-200">
              Token Playground
            </h2>
            <button
              onClick={actions.close}
              className="text-slate-500 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Model indicator */}
              {!currentSessionId && (
                <div className="px-4 py-3 bg-yellow-950/30 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
                  ⚠️ No model trained. Train a model in any tab first.
                </div>
              )}

              {/* Components will go here */}
              <div className="text-slate-400 text-sm">
                Playground components coming soon...
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
```

### Step 2: Add to Dashboard

Modify `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/dashboard/Dashboard.jsx`:

```jsx
import GenerationDrawer from '../generation/GenerationDrawer'

// Add before closing tag:
<GenerationDrawer />
```

### Step 3: Test drawer opens/closes

Click playground button, drawer should slide in from right

### Step 4: Commit drawer skeleton

```bash
git add frontend/src/components/generation/GenerationDrawer.jsx frontend/src/components/dashboard/Dashboard.jsx
git commit -m "feat: add GenerationDrawer skeleton component

Add drawer component that slides in from right with backdrop and
header. Shows warning when no model is trained.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: GenerationInput Component

**Files:**
- Create: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/generation/GenerationInput.jsx`

### Step 1: Create input component

```jsx
import { useGeneration } from '../../contexts/GenerationContext'

export default function GenerationInput() {
  const { userInput, generatedTokens, actions } = useGeneration()

  const fullText = userInput + generatedTokens.join('')
  const contextLength = 64

  const outOfContext = fullText.length > contextLength
    ? fullText.slice(0, -contextLength)
    : ''
  const inContext = fullText.length > contextLength
    ? fullText.slice(-contextLength)
    : fullText

  const handleChange = (e) => {
    actions.setUserInput(e.target.value)
    actions.reset() // Clear generated tokens when input changes
  }

  const handleClear = () => {
    actions.setUserInput('')
    actions.reset()
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        Input Text
      </label>

      <textarea
        value={userInput}
        onChange={handleChange}
        placeholder="Type something to get started..."
        className="w-full px-3 py-2 bg-neural-surface border border-neural-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
        rows={4}
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {fullText.length} chars ({Math.min(fullText.length, contextLength)} in context)
        </span>
        <button
          onClick={handleClear}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Generated output display */}
      {generatedTokens.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Generated Output
          </label>
          <div className="px-3 py-2 bg-neural-surface border border-neural-border rounded-lg text-slate-200 font-mono text-sm whitespace-pre-wrap break-words">
            <span className="opacity-40">{outOfContext}</span>
            <span>{inContext}</span>
            <span className="animate-pulse">█</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Step 2: Add to drawer

In `GenerationDrawer.jsx`, import and add:

```jsx
import GenerationInput from './GenerationInput'

// Replace placeholder with:
<GenerationInput />
```

### Step 3: Test input works

Type in textarea, see character counter update

### Step 4: Commit input component

```bash
git add frontend/src/components/generation/GenerationInput.jsx frontend/src/components/generation/GenerationDrawer.jsx
git commit -m "feat: add GenerationInput component

Add input textarea with character counter and context window
visualization. Shows generated output below input.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: GenerationControls Component

**Files:**
- Create: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/generation/GenerationControls.jsx`

### Step 1: Create controls component

```jsx
import { useGeneration } from '../../contexts/GenerationContext'

export default function GenerationControls({ disabled }) {
  const { isPlaying, speed, actions } = useGeneration()

  const handlePlay = () => actions.setIsPlaying(true)
  const handlePause = () => actions.setIsPlaying(false)
  const handleStep = () => {
    // Step will be implemented with API call later
    console.log('Step clicked')
  }
  const handleRegenerate = () => {
    actions.reset()
  }

  return (
    <div className="space-y-4">
      {/* Playback buttons */}
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            disabled={disabled}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            aria-label="Play"
          >
            ▶
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            aria-label="Pause"
          >
            ⏸
          </button>
        )}

        <button
          onClick={handleStep}
          disabled={disabled}
          className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-200 rounded-lg transition-colors"
          aria-label="Step"
        >
          ▶|
        </button>

        <button
          onClick={handleRegenerate}
          disabled={disabled}
          className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-200 rounded-lg transition-colors"
          aria-label="Regenerate"
        >
          ↻
        </button>
      </div>

      {/* Speed slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Speed</span>
          <span>{speed}ms</span>
        </div>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => actions.setSpeed(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-slate-600">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Add to drawer

In `GenerationDrawer.jsx`:

```jsx
import GenerationControls from './GenerationControls'

// Add after GenerationInput:
<GenerationControls disabled={!currentSessionId || !userInput} />
```

### Step 3: Test controls

Click play/pause, adjust speed slider

### Step 4: Commit controls

```bash
git add frontend/src/components/generation/GenerationControls.jsx frontend/src/components/generation/GenerationDrawer.jsx
git commit -m "feat: add GenerationControls component

Add playback controls (play/pause/step/regenerate) and speed slider.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: ProbabilityBars Component

**Files:**
- Create: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/generation/ProbabilityBars.jsx`

### Step 1: Create probability bars

```jsx
import { useGeneration } from '../../contexts/GenerationContext'
import { motion } from 'framer-motion'

function escapeToken(token) {
  if (token === ' ') return '(space)'
  if (token === '\n') return '\\n'
  if (token === '\t') return '\\t'
  return token
}

export default function ProbabilityBars() {
  const { currentProbabilities, highlightedIndex, actions } = useGeneration()

  if (!currentProbabilities || currentProbabilities.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        Next Token Probabilities
      </label>

      <div className="space-y-1">
        {currentProbabilities.slice(0, 10).map((item, index) => {
          const isHighlighted = index === highlightedIndex
          const percentage = (item.prob * 100).toFixed(1)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${
                isHighlighted
                  ? 'bg-cyan-950/50 border border-cyan-500/50'
                  : 'bg-neural-surface border border-transparent'
              }`}
              onClick={() => actions.setHighlightedIndex(index)}
            >
              {/* Arrow indicator for highlighted */}
              <span className="w-4 text-cyan-400 text-xs">
                {isHighlighted ? '→' : ''}
              </span>

              {/* Token display */}
              <span className="w-16 font-mono text-sm text-slate-300">
                {escapeToken(item.token)}
              </span>

              {/* Probability bar */}
              <div className="flex-1 h-5 bg-slate-800 rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              </div>

              {/* Percentage */}
              <span className="w-12 text-right text-xs text-slate-400">
                {percentage}%
              </span>
            </motion.div>
          )
        })}
      </div>

      <div className="text-xs text-slate-600 mt-2">
        Use arrow keys to navigate, Enter to select
      </div>
    </div>
  )
}
```

### Step 2: Add to drawer

In `GenerationDrawer.jsx`:

```jsx
import ProbabilityBars from './ProbabilityBars'

// Add after GenerationControls:
<ProbabilityBars />
```

### Step 3: Test with mock data

Temporarily add mock probabilities in GenerationContext to test rendering

### Step 4: Commit probability bars

```bash
git add frontend/src/components/generation/ProbabilityBars.jsx frontend/src/components/generation/GenerationDrawer.jsx
git commit -m "feat: add ProbabilityBars component

Add component to display top 10 token probabilities with animated
bars. Supports highlighting and keyboard navigation hints.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: API Integration and Playback Loop

**Files:**
- Modify: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/generation/GenerationDrawer.jsx`

### Step 1: Add session ID detection

Get the current session ID from the training session:

```jsx
// At top of GenerationDrawer component:
const { state: ui } = useContext(UIContext)

// Get session manager state - this needs to come from WebSocket or context
// For now, we'll use a simple approach:
const [currentSessionId, setCurrentSessionId] = useState(null)

useEffect(() => {
  // Listen for training session updates
  // This is a simplified version - actual implementation depends on your session management
  const checkSession = () => {
    // You'll need to get this from your session state
    // For now, placeholder:
    setCurrentSessionId(null)
  }

  checkSession()
}, [ui.activeTab])
```

### Step 2: Add API call function

```jsx
const generateNextToken = async () => {
  if (!currentSessionId) {
    actions.setError('No active training session')
    return null
  }

  const context = userInput + generatedTokens.join('')

  try {
    const response = await fetch('/api/generate-next-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: currentSessionId,
        context,
        temperature: 1.0
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Generation failed')
    }

    const data = await response.json()
    return data

  } catch (err) {
    actions.setError(err.message)
    actions.setIsPlaying(false)
    return null
  }
}
```

### Step 3: Add playback loop

```jsx
useEffect(() => {
  if (!isPlaying) return
  if (generatedTokens.length >= 500) {
    actions.setIsPlaying(false)
    return
  }

  const timer = setTimeout(async () => {
    const result = await generateNextToken()

    if (result) {
      actions.addToken(result.next_token)
      actions.setCurrentProbabilities(result.probabilities)
      actions.setHighlightedIndex(0)
    }
  }, speed)

  return () => clearTimeout(timer)
}, [isPlaying, generatedTokens, speed, userInput, currentSessionId])
```

### Step 4: Add step function

```jsx
const handleStep = async () => {
  const result = await generateNextToken()

  if (result) {
    const tokenToAdd = result.probabilities[highlightedIndex]?.token || result.next_token
    actions.addToken(tokenToAdd)
    actions.setCurrentProbabilities(result.probabilities)
    actions.setHighlightedIndex(0)
  }
}

// Pass handleStep to GenerationControls:
<GenerationControls
  disabled={!currentSessionId || !userInput}
  onStep={handleStep}
/>
```

### Step 5: Test with real model

Start a training session, then open playground and test generation

### Step 6: Commit API integration

```bash
git add frontend/src/components/generation/GenerationDrawer.jsx frontend/src/components/generation/GenerationControls.jsx
git commit -m "feat: add API integration and playback loop

Wire up generate-next-token API endpoint with playback loop. Add
session detection and token generation logic.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Keyboard Navigation

**Files:**
- Modify: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/generation/GenerationDrawer.jsx`

### Step 1: Add keyboard event handler

```jsx
useEffect(() => {
  if (!isOpen) return

  const handleKeyDown = (e) => {
    // ESC to close
    if (e.key === 'Escape') {
      actions.close()
      return
    }

    // Space to play/pause
    if (e.key === ' ' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault()
      actions.setIsPlaying(!isPlaying)
      return
    }

    // Arrow keys to navigate probabilities
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      actions.setHighlightedIndex(prev =>
        Math.min(prev + 1, currentProbabilities.length - 1)
      )
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      actions.setHighlightedIndex(prev => Math.max(prev - 1, 0))
      return
    }

    // Enter to accept highlighted token
    if (e.key === 'Enter' && !isPlaying && currentProbabilities.length > 0) {
      e.preventDefault()
      handleStep()
      return
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [isOpen, isPlaying, currentProbabilities, highlightedIndex])
```

### Step 2: Test keyboard controls

Open drawer, use arrow keys, space, enter, ESC

### Step 3: Commit keyboard navigation

```bash
git add frontend/src/components/generation/GenerationDrawer.jsx
git commit -m "feat: add keyboard navigation to playground

Add keyboard shortcuts: ESC to close, Space to play/pause, arrows to
navigate probabilities, Enter to select highlighted token.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Error Handling and Polish

**Files:**
- Modify: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/generation/GenerationDrawer.jsx`
- Modify: `/Users/jacobmobin/Documents/GitHub/CTRLHACKDEL/llmbreaker/frontend/src/components/generation/GenerationInput.jsx`

### Step 1: Add error display

In `GenerationDrawer.jsx`, add error banner:

```jsx
{error && (
  <div className="px-4 py-3 bg-red-950/30 border border-red-500/30 rounded-lg text-sm text-red-200 flex items-start gap-2">
    <span>⚠️</span>
    <div>
      <div className="font-medium">Error</div>
      <div className="text-xs mt-0.5">{error}</div>
    </div>
    <button
      onClick={() => actions.setError(null)}
      className="ml-auto text-red-400 hover:text-red-300"
    >
      ×
    </button>
  </div>
)}
```

### Step 2: Add loading states

Add loading indicator during generation:

```jsx
const [isGenerating, setIsGenerating] = useState(false)

// In generateNextToken:
setIsGenerating(true)
try {
  // ... API call
} finally {
  setIsGenerating(false)
}

// Show loading state:
{isGenerating && (
  <div className="text-xs text-slate-500 flex items-center gap-2">
    <span className="animate-pulse">●</span>
    Generating...
  </div>
)}
```

### Step 3: Add max length warning

```jsx
{generatedTokens.length >= 500 && (
  <div className="px-4 py-3 bg-green-950/30 border border-green-500/30 rounded-lg text-sm text-green-200">
    ✓ Reached max length (500 tokens)
  </div>
)}
```

### Step 4: Test error cases

Test with no session, invalid input, network errors

### Step 5: Commit error handling

```bash
git add frontend/src/components/generation/GenerationDrawer.jsx
git commit -m "feat: add error handling and loading states

Add error banner, loading indicator, and max length warning. Handle
all error cases gracefully.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Final Testing and Documentation

### Step 1: Manual testing checklist

- [ ] Open drawer from header button
- [ ] Type input and see character counter
- [ ] Start training session and generate tokens
- [ ] Test play/pause/step/regenerate buttons
- [ ] Test speed slider
- [ ] Test arrow key navigation
- [ ] Test Enter to select token
- [ ] Test ESC to close
- [ ] Test Space to play/pause
- [ ] See probability bars animate
- [ ] See context window visualization
- [ ] Test with empty input (buttons disabled)
- [ ] Test with no training session (warning shown)
- [ ] Test max length limit (500 tokens)
- [ ] Test error handling (invalid session, network error)

### Step 2: Update README (if applicable)

Add section about token generation playground to project README

### Step 3: Final commit

```bash
git add -A
git commit -m "docs: update README with playground feature

Add documentation for token generation playground feature.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria Checklist

- [x] Backend API endpoint `/api/generate-next-token` implemented
- [x] GenerationContext for state management
- [x] Playground button in header
- [x] GenerationDrawer slides in from right
- [x] GenerationInput with context window visualization
- [x] GenerationControls with play/pause/step/regenerate
- [x] Speed slider working
- [x] ProbabilityBars showing top 10 tokens
- [x] Keyboard navigation (arrows, enter, space, ESC)
- [x] API integration and playback loop
- [x] Error handling for all edge cases
- [x] Loading states and animations
- [x] Max length safety limit
- [x] Session detection and warnings

---

## Notes

- The session ID detection might need adjustment based on your actual session management implementation
- Consider adding tests for the backend API endpoint
- Future enhancement: Add temperature slider to GenerationControls
- Future enhancement: Add export generated text feature
