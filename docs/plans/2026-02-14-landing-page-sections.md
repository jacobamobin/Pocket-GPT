# Landing Page Sections Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand LandingPage.jsx with 5 educational scroll sections, make the app header logo navigate back to `/`, and add attribution to `micro_gpt.py`.

**Architecture:** The existing hero (100vh) stays untouched. New sections are appended below it inside the same `LandingPage` component — no canvas background, solid `#0a0a0a`. Framer-motion `whileInView` triggers fade-in-up animations. The three feature cards map 1:1 to tutorial chapters. Header logo gets `useNavigate('/')`.

**Tech Stack:** React 19, framer-motion, react-icons (Fi prefix), Tailwind CSS with existing design tokens from `index.css` (`.card`, `.btn-primary`, `bg-neural-bg`, gold palette `#a78b71`).

---

### Task 1: Add attribution header to micro_gpt.py

**Files:**
- Modify: `llmbreaker/backend/micro_gpt.py:1`

**Step 1: Add comment block at the very top of the file, before the existing docstring**

Replace the opening of `micro_gpt.py` so lines 1-16 become:

```python
# Architecture based on bdunaganGPT by Brian Dunagan
# https://github.com/bdunagan/bdunaganGPT
# MIT License
# Which is itself based on Andrej Karpathy's "Zero to Hero" series:
# https://karpathy.ai/zero-to-hero.html
"""
MicroGPT — ~7,900 parameter character-level transformer.
... (rest of existing docstring unchanged)
"""
```

**Step 2: Verify**

Open the file and confirm the attribution lines appear before the `"""` docstring.

**Step 3: Commit**

```bash
git add llmbreaker/backend/micro_gpt.py
git commit -m "chore: add bdunaganGPT and Karpathy attribution to micro_gpt.py"
```

---

### Task 2: Make header logo navigate to landing page

**Files:**
- Modify: `llmbreaker/frontend/src/components/dashboard/Header.jsx`

**Step 1: Add useNavigate import**

At the top of `Header.jsx`, add to the existing React import line (or add separately):

```js
import { useNavigate } from 'react-router-dom'
```

**Step 2: Instantiate navigate inside the component**

Inside `export default function Header({ connected })`, after the existing hooks, add:

```js
const navigate = useNavigate()
```

**Step 3: Make the logo a button**

Replace the existing `<span>` logo element:

```jsx
// OLD:
<span
  className="text-2xl font-serif italic font-bold text-white select-none"
  data-tutorial="logo"
>
  LLMBreaker
</span>

// NEW:
<button
  onClick={() => navigate('/')}
  className="text-2xl font-serif italic font-bold text-white select-none hover:text-gold-light transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
  data-tutorial="logo"
  aria-label="Go to home page"
>
  LLMBreaker
</button>
```

**Step 4: Verify in browser**

Navigate to `/app`, click "LLMBreaker" in the top-left — should route back to `/`.

**Step 5: Commit**

```bash
git add llmbreaker/frontend/src/components/dashboard/Header.jsx
git commit -m "feat: clicking header logo navigates back to landing page"
```

---

### Task 3: Add scroll indicator to existing hero

**Files:**
- Modify: `llmbreaker/frontend/src/components/landing/LandingPage.jsx`

**Step 1: Add FiChevronDown to the existing icon import**

```js
import { FiArrowRight, FiChevronDown } from 'react-icons/fi'
```

**Step 2: Add scroll indicator inside the hero div, after the launch button motion.button**

Place this after the closing `</motion.button>` and before the closing `</motion.div>` of the content block:

```jsx
{/* Scroll indicator */}
<motion.div
  className="mt-16 flex flex-col items-center gap-2 text-white/30"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1.0, duration: 0.6 }}
>
  <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
  <motion.div
    animate={{ y: [0, 6, 0] }}
    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
  >
    <FiChevronDown className="w-5 h-5" />
  </motion.div>
</motion.div>
```

**Step 3: Make the hero wrapper scrollable**

The hero `<div>` currently has `min-h-screen`. Change it to `min-h-screen` but ensure the parent can scroll. The outer wrapper should become:

```jsx
<div className="bg-neural-bg bg-dots">
  {/* Hero section */}
  <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
    <AnimatedBackground />
    {/* ... existing hero content unchanged ... */}
  </div>

  {/* Scroll sections go here in later tasks */}
</div>
```

Wrap the entire return in a non-`overflow-hidden` outer div, and move `overflow-hidden` to only the hero inner div.

**Step 4: Verify**

Hero still looks identical. Scroll indicator animates below the Launch button. Scrolling down shows the page can scroll (blank for now).

**Step 5: Commit**

```bash
git add llmbreaker/frontend/src/components/landing/LandingPage.jsx
git commit -m "feat: add scroll indicator to hero and make landing page scrollable"
```

---

### Task 4: Section 1 — The Problem

**Files:**
- Modify: `llmbreaker/frontend/src/components/landing/LandingPage.jsx`

**Step 1: Add the section after the hero div (inside the outer wrapper from Task 3)**

```jsx
{/* ── Section 1: The Problem ─────────────────────────────── */}
<section className="relative px-6 py-24 max-w-6xl mx-auto">
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6 }}
    className="text-center mb-16"
  >
    <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">The Problem</p>
    <h2
      className="font-serif italic font-bold text-white mb-6"
      style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
    >
      LLMs are black boxes.<br />
      <span className="text-white/40">They don't have to be.</span>
    </h2>
    <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
      Every day, millions of developers send text to GPT-4, Claude, and Gemini and get answers back.
      But what's happening inside? Tokens, attention heads, embeddings, backpropagation — invisible
      behind a single API call. <strong className="text-white/70">Pocket GPT changes that.</strong>
    </p>
  </motion.div>

  {/* Two-column comparison */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Left — old way */}
    <motion.div
      className="card p-8"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">The usual way</p>
      <div className="font-mono text-sm text-white/50 bg-white/[0.03] rounded-xl p-4 mb-4 leading-relaxed">
        <span className="text-white/30">POST</span> /v1/chat/completions<br />
        <span className="text-white/20">→ ??? (magic) →</span><br />
        <span className="text-white/50">"Here is your answer."</span>
      </div>
      <p className="text-white/40 text-sm leading-relaxed">
        You send text. Text comes back. No idea what happened in between.
        What did the model attend to? How did it decide? You'll never know.
      </p>
    </motion.div>

    {/* Right — Pocket GPT way */}
    <motion.div
      className="card p-8 border-gold-muted/40"
      style={{ background: 'rgba(167,139,113,0.04)' }}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">With Pocket GPT</p>
      <ul className="space-y-2 mb-4">
        {[
          'Watch every token prediction in real time',
          'See attention heatmaps across all layers & heads',
          'Inspect embeddings as they organize in 3D space',
          'Follow emergent learning phases as they happen',
          'Train on your own data, see your style captured',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/60">
            <span className="text-gold-light mt-0.5">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="text-white/40 text-sm">Zero black boxes. All on device. No API key required.</p>
    </motion.div>
  </div>

  {/* Stat strip */}
  <motion.div
    className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    {[
      { value: '~15K–250K', label: 'Parameters you can see' },
      { value: '3', label: 'Interactive visualizations' },
      { value: '20+', label: 'Guided tutorial steps' },
      { value: '100%', label: 'On-device, no API key' },
    ].map((stat, i) => (
      <div key={i} className="card text-center py-5">
        <p className="font-mono text-gold-light text-xl font-bold">{stat.value}</p>
        <p className="text-white/40 text-xs mt-1">{stat.label}</p>
      </div>
    ))}
  </motion.div>
</section>

{/* Section divider */}
<div className="border-t border-white/[0.06] max-w-6xl mx-auto" />
```

**Step 2: Verify in browser**

Scroll below hero — The Problem section should fade in. Two columns visible, stat strip at bottom.

**Step 3: Commit**

```bash
git add llmbreaker/frontend/src/components/landing/LandingPage.jsx
git commit -m "feat: add 'The Problem' section to landing page"
```

---

### Task 5: Section 2 — Three Feature Cards

**Files:**
- Modify: `llmbreaker/frontend/src/components/landing/LandingPage.jsx`

**Step 1: Add the three-cards section after the Section 1 divider**

```jsx
{/* ── Section 2: Three Windows ────────────────────────────── */}
<section className="relative px-6 py-24 max-w-6xl mx-auto">
  <motion.div
    className="text-center mb-16"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6 }}
  >
    <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">Features</p>
    <h2
      className="font-serif italic font-bold text-white"
      style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
    >
      Three windows into your model
    </h2>
  </motion.div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      {
        chapter: 'Chapter 1',
        title: 'Watch It Learn',
        description:
          'Train a GPT-style transformer from scratch and watch it learn in real time. Live loss curve, character-by-character token stream, 3D embedding star map, and emergent phase detection — from random noise to coherent text.',
        bullets: ['Live loss curve', '3D embedding star map', 'Token stream', 'Emergent phase labels'],
        icon: '⚡',
        delay: 0.1,
      },
      {
        chapter: 'Chapter 2',
        title: 'Attention Cinema',
        description:
          'Visualize the breakthrough mechanism behind every modern LLM: self-attention. See exactly which tokens attend to which across every layer and head, in 2D heatmaps or immersive 3D views.',
        bullets: ['2D & 3D heatmaps', 'All layers & heads', 'Evolution over training', 'Causal mask visible'],
        icon: '👁',
        delay: 0.2,
      },
      {
        chapter: 'Chapter 3',
        title: 'Style Transfer',
        description:
          'Paste your own writing and watch the model learn your voice. Fine-tune on your text and compare outputs step by step — word choice, sentence rhythm, tone — all captured and visualized.',
        bullets: ['Paste your own text', 'Side-by-side comparison', 'Style evolution timeline', 'Overfitting detection'],
        icon: '✍️',
        delay: 0.3,
      },
    ].map((feature, i) => (
      <motion.div
        key={i}
        className="card p-8 flex flex-col"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, delay: feature.delay }}
      >
        <div className="text-3xl mb-4">{feature.icon}</div>
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-2">
          {feature.chapter}
        </span>
        <h3 className="text-xl font-serif italic font-bold text-white mb-3">{feature.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1">{feature.description}</p>
        <ul className="space-y-1.5">
          {feature.bullets.map((b, j) => (
            <li key={j} className="flex items-center gap-2 text-xs text-white/40">
              <span className="w-1 h-1 rounded-full bg-gold-muted flex-shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </motion.div>
    ))}
  </div>
</section>

<div className="border-t border-white/[0.06] max-w-6xl mx-auto" />
```

**Step 2: Verify in browser**

Three cards animate in on scroll. Mobile: stacked. Desktop: side by side.

**Step 3: Commit**

```bash
git add llmbreaker/frontend/src/components/landing/LandingPage.jsx
git commit -m "feat: add feature cards section to landing page"
```

---

### Task 6: Section 3 — The Guided Tutorial

**Files:**
- Modify: `llmbreaker/frontend/src/components/landing/LandingPage.jsx`

**Step 1: Add the tutorial section after the Section 2 divider**

```jsx
{/* ── Section 3: The Guided Tutorial ─────────────────────── */}
<section className="relative px-6 py-24 max-w-6xl mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

    {/* Left: text */}
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">Education First</p>
      <h2
        className="font-serif italic font-bold text-white mb-6"
        style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
      >
        A guided tutorial that actually teaches you how LLMs work
      </h2>
      <p className="text-white/50 text-base leading-relaxed mb-8">
        Most LLM "explainers" stop at analogies. Pocket GPT goes further — a 3-chapter,
        20+ step interactive tutorial built into the app. Every concept is tied to a live
        visualization you're looking at right now.
      </p>

      <div className="space-y-4">
        {[
          {
            num: '01',
            title: 'Tokens, Embeddings & Loss',
            desc: 'Understand the atomic units of language models, how they get mapped to vectors, and what the loss curve actually means.',
          },
          {
            num: '02',
            title: 'Self-Attention & Multi-Head Architecture',
            desc: 'See the Q·Kᵀ math come to life. Watch heads specialize in syntax vs. semantics. Understand why depth gives transformers their power.',
          },
          {
            num: '03',
            title: 'Fine-Tuning & Style Transfer',
            desc: 'Learn the difference between pre-training and fine-tuning. Adapt the model to your voice and observe overfitting in real time.',
          },
        ].map((chapter, i) => (
          <motion.div
            key={i}
            className="flex gap-4"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <span className="font-mono text-gold-light/40 text-sm mt-0.5 flex-shrink-0 w-6">{chapter.num}</span>
            <div>
              <p className="text-white/80 text-sm font-semibold mb-0.5">{chapter.title}</p>
              <p className="text-white/40 text-sm leading-relaxed">{chapter.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Right: spotlight mockup card */}
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="card p-8"
      style={{ background: 'rgba(167,139,113,0.03)' }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-gold-light animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">Tutorial — Welcome</span>
      </div>
      <h3 className="text-lg font-serif italic font-bold text-white mb-3">
        Ever wondered what's inside an AI as it learns?
      </h3>
      <p className="text-white/50 text-sm leading-relaxed mb-6">
        LLMBreaker lets you <strong className="text-white/70">build, train, and dissect</strong> a real transformer —
        the same architecture powering GPT-4, Claude, and Gemini. It's tiny
        (~15K–250K parameters vs GPT-4's ~1.8 trillion), but the principles are identical.
        This isn't a simulation. You'll see real embeddings, real attention weights, real backpropagation.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">Step 1 of 20+</span>
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-gold-light' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  </div>
</section>

<div className="border-t border-white/[0.06] max-w-6xl mx-auto" />
```

**Step 2: Verify in browser**

Two-column tutorial section visible. Left column has 3 chapters with descriptions. Right shows a mock spotlight card.

**Step 3: Commit**

```bash
git add llmbreaker/frontend/src/components/landing/LandingPage.jsx
git commit -m "feat: add tutorial education section to landing page"
```

---

### Task 7: Section 4 — How It Works Pipeline

**Files:**
- Modify: `llmbreaker/frontend/src/components/landing/LandingPage.jsx`

**Step 1: Add the pipeline section after the Section 3 divider**

```jsx
{/* ── Section 4: How It Works ─────────────────────────────── */}
<section className="relative px-6 py-24 max-w-6xl mx-auto">
  <motion.div
    className="text-center mb-16"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6 }}
  >
    <p className="text-xs font-semibold uppercase tracking-widest text-gold-light mb-4">Under the Hood</p>
    <h2
      className="font-serif italic font-bold text-white"
      style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
    >
      How it works
    </h2>
  </motion.div>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[
      {
        num: '1',
        title: 'Load Dataset',
        desc: 'Choose from Shakespeare, Tiny Stories, or paste your own text. The model tokenizes it at the character level.',
      },
      {
        num: '2',
        title: 'Configure Architecture',
        desc: 'Set layers, attention heads, embedding size, learning rate, batch size, and context length.',
      },
      {
        num: '3',
        title: 'Train Live',
        desc: 'Real PyTorch running in a local Python process. Real backpropagation. Streaming metrics via WebSocket.',
      },
      {
        num: '4',
        title: 'Inspect Internals',
        desc: 'Loss curves, attention heatmaps, embedding maps, token probabilities — captured at every step.',
      },
    ].map((step, i) => (
      <motion.div
        key={i}
        className="card p-6 relative"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.4, delay: i * 0.1 }}
      >
        {/* Connector line (all but last) */}
        {i < 3 && (
          <div className="hidden md:block absolute top-10 -right-2 w-4 h-px bg-gold-muted/30 z-10" />
        )}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono mb-4 flex-shrink-0"
          style={{ background: 'rgba(167,139,113,0.15)', color: '#a78b71', border: '1px solid rgba(167,139,113,0.3)' }}
        >
          {step.num}
        </div>
        <h3 className="text-white font-semibold mb-2 text-sm">{step.title}</h3>
        <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>
      </motion.div>
    ))}
  </div>
</section>

<div className="border-t border-white/[0.06] max-w-6xl mx-auto" />
```

**Step 2: Verify in browser**

Four pipeline steps visible with numbered gold circles. On desktop: horizontal row with connector dashes.

**Step 3: Commit**

```bash
git add llmbreaker/frontend/src/components/landing/LandingPage.jsx
git commit -m "feat: add how-it-works pipeline section to landing page"
```

---

### Task 8: Section 5 — CTA + Credits (bottom of page)

**Files:**
- Modify: `llmbreaker/frontend/src/components/landing/LandingPage.jsx`

**Step 1: Add imports needed**

Ensure `useNavigate` is imported at the top:

```js
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiChevronDown } from 'react-icons/fi'
import AnimatedBackground from './AnimatedBackground'
```

**Step 2: Add CTA section after Section 4 divider**

```jsx
{/* ── Section 5: CTA + Credits ────────────────────────────── */}
<section className="relative px-6 py-32 max-w-6xl mx-auto text-center">
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6 }}
  >
    <h2
      className="font-serif italic font-bold text-white mb-4"
      style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
    >
      Ready to see inside?
    </h2>
    <p className="text-white/40 mb-10 max-w-md mx-auto text-base leading-relaxed">
      No API key. No cloud. Train a real GPT on your machine and watch every weight update happen.
    </p>
    <motion.button
      onClick={() => navigate('/app')}
      className="relative inline-flex items-center gap-2 font-semibold text-black rounded-full px-10 py-4 text-lg
                 bg-white hover:bg-gold-hover shadow-lg transition-all duration-300"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      Launch Pocket GPT
      <FiArrowRight className="w-5 h-5" />
    </motion.button>
  </motion.div>

  {/* Credits */}
  <motion.div
    className="mt-24 pt-8 border-t border-white/[0.06] space-y-2"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <p className="text-white/20 text-xs tracking-wide">
      Built at CTRL HACK DEL 2.0 by Jacob Mobin &amp; Ethan Cha
    </p>
    <p className="text-white/20 text-xs tracking-wide">
      Transformer architecture based on{' '}
      <a
        href="https://github.com/bdunagan/bdunaganGPT"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/50 transition-colors"
      >
        bdunaganGPT
      </a>{' '}
      by Brian Dunagan (MIT License)
    </p>
    <p className="text-white/20 text-xs tracking-wide">
      Inspired by{' '}
      <a
        href="https://karpathy.ai/zero-to-hero.html"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/50 transition-colors"
      >
        Andrej Karpathy's Zero to Hero
      </a>
    </p>
  </motion.div>
</section>
```

**Step 3: Verify full page in browser**

Scroll through all 5 sections. CTA button routes to `/app`. Attribution links open correctly.

**Step 4: Remove the old footer `<motion.p>` from the hero section**

The existing `<motion.p className="absolute bottom-5 ...">Made for CTRL HACK DEL...</motion.p>` inside the hero should be deleted since credits now live in Section 5.

**Step 5: Commit**

```bash
git add llmbreaker/frontend/src/components/landing/LandingPage.jsx
git commit -m "feat: add CTA and credits section, complete landing page expansion"
```

---

## Verification Checklist

After all tasks:
- [ ] Hero: full 100vh, animated canvas, scroll indicator bounces
- [ ] Section 1: The Problem — two columns + stat strip
- [ ] Section 2: Three feature cards with chapter labels
- [ ] Section 3: Tutorial education section with mock spotlight card
- [ ] Section 4: Four pipeline steps
- [ ] Section 5: CTA + attribution links
- [ ] Header logo click → navigates to `/`
- [ ] `micro_gpt.py` has attribution comment before docstring
- [ ] All `whileInView` animations trigger correctly on scroll
- [ ] Mobile layout: sections stack single-column
