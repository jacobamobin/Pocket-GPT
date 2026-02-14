# Embedding Space Redesign — Design Document

**Goal:** Replace the near-empty dark canvas (tiny invisible dots) with a beautiful, interactive 3D visualization of character embeddings with connections, hover info, and fullscreen support.

**Problem with current implementation:**
- `THREE.Points` with size 0.08 renders dots too small to see
- No labels or hover interaction
- Only horizontal drag — no zoom, no vertical orbit
- Background stars nearly invisible (color too dark)
- No connections between related nodes

---

## Architecture

Pure Three.js rewrite of `EmbeddingStarMap.jsx`. No new npm dependencies. Backend data pipeline unchanged — backend already sends `coords: [[x,y,z], ...]` and `labels: [char, ...]` per eval step via WebSocket `embedding_snapshot` event.

---

## Components

### Nodes
- 65 individual `THREE.Mesh` with `SphereGeometry(0.06, 8, 8)` — one per vocab character
- `MeshPhongMaterial` with color per group (vowels=blue, consonants=emerald, digits=amber, punctuation=pink, whitespace=slate, other=violet)
- Additive blending sprite glow: a large `THREE.Sprite` (scale 0.3) with `AdditiveBlending` behind each sphere for the halo effect
- Hover state: scale lerps to 1.8x, emissive brightness increases

### Connections
- For each node, find 4 nearest neighbors by Euclidean distance in current 3D coords
- Draw `THREE.Line` between each pair (deduplicated)
- `LineBasicMaterial` with `opacity = clamp(1 - dist/2.5, 0.05, 0.6)`, `transparent: true`
- Color = lerp between the two endpoint group colors
- Lines animate in (opacity 0 → target) over 300ms when embeddings update

### Hover Panel
- `pointermove` raycaster against all sphere meshes
- On hit: show CSS-positioned HTML overlay `<div>` (not Three.js — just a React state-driven div overlaid on the canvas)
- Panel contents:
  - Character (large, group-colored, monospace)
  - Group name (e.g. "Vowel")
  - Top 5 nearest neighbors with cosine similarity % each
  - Character code point (e.g. `U+0061`)

### Orbit Controls
- Manual implementation (no OrbitControls dep)
- Mouse drag → rotate theta (horizontal) + phi (vertical, clamped ±70°)
- Scroll wheel → zoom (camera distance 1.5–8.0)
- Touch: single finger drag = orbit, pinch = zoom

### Fullscreen
- Button (⛶ icon) top-right of card header
- Click: canvas wrapper div gets `position:fixed inset-0 z-50 bg-neural-bg`, `ResizeObserver` triggers `renderer.setSize()`
- ESC key or button again exits fullscreen
- In fullscreen mode canvas height fills viewport

### Background
- Star field: 400 points, color `0x334155` (visible but subtle)
- Soft `AmbientLight(0x1e293b, 2)` + `PointLight(0x60a5fa, 1, 8)` at origin for depth

---

## Data Flow

```
WebSocket 'embedding_snapshot' → MetricsContext → WatchItLearnTab
  → embeddingSnapshots prop → EmbeddingStarMap
    → latest.coords (65×3 PCA-reduced, normalised [-1,1])
    → latest.labels (65 chars)
    → latest.step (training step number)
```

On each new snapshot:
1. Lerp all sphere positions toward new coords over ~25 frames
2. Recompute K-nearest neighbors
3. Rebuild connection lines with new distances
4. Update connection opacities

---

## File Changes

- **Modify:** `src/components/tabs/EmbeddingStarMap.jsx` — full rewrite
- **No backend changes** — data pipeline already correct

---

## Visual Design

- Dark background `#0a1628` (unchanged)
- Group colors unchanged (consistent with legend)
- Glow sprites use same hue as node, white core
- Connection lines slightly desaturated so nodes remain focal point
- Hover panel: `bg-neural-card border border-neural-border rounded-lg shadow-xl` at fixed position near cursor
