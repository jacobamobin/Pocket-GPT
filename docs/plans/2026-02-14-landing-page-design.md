# Landing Page Expansion — Design Doc
**Date:** 2026-02-14
**Project:** Pocket GPT / LLMBreaker
**Scope:** Expand `LandingPage.jsx` with educational scroll sections + header back-nav

---

## Goals

- Communicate that LLMs are not black boxes — Pocket GPT makes them transparent and learnable
- Showcase the three feature tabs with educational framing
- Explain the in-app guided tutorial system
- Credit bdunagan/bdunaganGPT and Andrej Karpathy
- Add a "back to landing" nav from the app header

---

## Layout

### Hero (existing, untouched — 100vh)
- Full-viewport, animated neural-network canvas background
- "Pocket GPT" serif title, tagline, Launch button
- Scroll indicator arrow (`FiChevronDown`) animates to invite scrolling

### Section 1 — The Problem (solid `#0a0a0a` bg, no canvas)
Two-column layout:
- **Left column:** "The Black Box Problem" — developers use GPT APIs every day but have no idea what is happening inside; tokens, attention, training — all invisible behind `curl` calls
- **Right column:** Gold-accented "What Pocket GPT shows you" — same process, now fully visible
- Stat row: "~15K parameters you can actually see · Real backpropagation · Real attention weights · 0 black boxes"

### Section 2 — Three Windows Into Your Model (feature cards)
Three glassmorphism `.card` tiles side-by-side (stacked on mobile):

| Card | Title | Description |
|------|-------|-------------|
| 1 | Watch It Learn | Train a GPT from scratch. Live loss curve, token stream, 3D embedding star map, emergent learning phase labels |
| 2 | Attention Cinema | Visualize self-attention heatmaps (2D + 3D) across every layer and head as training evolves |
| 3 | Style Transfer | Paste your own writing, fine-tune the model, watch it learn your voice in real time |

Each card has a gold pill label ("Chapter 1 / 2 / 3") tying it to the tutorial chapters.

### Section 3 — The Guided Tutorial
Full-width dark section with a spotlight graphic on the left, text on the right:
- Explain the interactive tutorial: 3 chapters, 20+ steps, spotlight-guided, no setup required
- Chapter list with descriptions pulled directly from `tutorialChapters.js`:
  - Chapter 1: Tokens, embeddings, loss, emergent phases
  - Chapter 2: Self-attention, multi-head attention, layer hierarchy
  - Chapter 3: Fine-tuning, style transfer, domain adaptation
- CTA: "Start Tutorial inside the app →"

### Section 4 — How It Works (pipeline steps)
Four numbered steps with gold circles + connecting line:
1. Load Dataset (Shakespeare, Tiny Stories, or your own text)
2. Configure Architecture (layers, heads, embedding size, learning rate)
3. Train Live (real PyTorch, real backprop, running in the browser via WebSocket)
4. Inspect Internals (loss curves, attention heatmaps, embedding maps, token probabilities)

### Section 5 — CTA + Credits
- "Ready to see inside?" heading + Launch button (same `.btn-primary` style as hero)
- Attribution row:
  `Built at CTRL HACK DEL 2.0 by Jacob Mobin & Ethan Cha`
  `Architecture based on bdunaganGPT by Brian Dunagan (MIT License)`
  `Inspired by Andrej Karpathy's "Zero to Hero" series`

---

## Header Change

In `Header.jsx`, wrap the `LLMBreaker` logo `<span>` in a `<button>` (or use `useNavigate`) that calls `navigate('/')` on click. Apply `cursor-pointer` and a subtle hover gold color.

---

## micro_gpt.py Attribution

Add a module-level comment block at the top of `micro_gpt.py`:

```
# Architecture based on bdunaganGPT by Brian Dunagan
# https://github.com/bdunagan/bdunaganGPT
# MIT License
# Which is itself based on Andrej Karpathy's "Zero to Hero" series
# https://karpathy.ai/zero-to-hero.html
```

---

## Design Tokens (from design system)

- Background: `#0a0a0a` / `bg-neural-bg`
- Gold: `#a78b71` / `text-gold-light`
- Cards: `.card` class (glassmorphism)
- Buttons: `.btn-primary`, `.btn-secondary`
- Typography: serif italic for headings, Inter for body
- Section separators: `border-white/10` 1px horizontal rule
- Animations: framer-motion `fadeInUp` on scroll (use `whileInView`)

---

## Files to Change

1. `llmbreaker/frontend/src/components/landing/LandingPage.jsx` — replace with expanded version
2. `llmbreaker/frontend/src/components/dashboard/Header.jsx` — make logo navigate to `/`
3. `llmbreaker/backend/micro_gpt.py` — add attribution comment at top
