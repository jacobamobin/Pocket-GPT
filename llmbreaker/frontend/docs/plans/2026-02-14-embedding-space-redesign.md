# Embedding Space 3D Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite `EmbeddingStarMap.jsx` to render glowing 3D sphere nodes with K-nearest-neighbor connection lines, full orbit+zoom controls, a hover info panel, and a fullscreen mode.

**Architecture:** Single-file rewrite of `src/components/tabs/EmbeddingStarMap.jsx` using existing Three.js dependency. Backend already sends correct data (`coords`, `labels`, `step`) — no backend changes needed. React state drives hover panel and fullscreen; Three.js handles all 3D rendering.

**Tech Stack:** Three.js (already installed), React hooks, CSS positioning for hover overlay.

---

### Task 1: Scaffold helpers — char groups, colors, and math utilities

**Files:**
- Modify: `src/components/tabs/EmbeddingStarMap.jsx` (replace entire file)

This task writes only the constants and pure helper functions at the top of the file. No rendering yet.

**Step 1: Replace file with helpers only**

```jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import InfoIcon from '../shared/InfoIcon'

// ── Char group classification ─────────────────────────────────────────────────
const CHAR_GROUPS = {
  vowels:      new Set('aeiouAEIOU'),
  consonants:  new Set('bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ'),
  digits:      new Set('0123456789'),
  punctuation: new Set('.,;:!?\'"()-'),
  whitespace:  new Set(' \t\n\r'),
}

const GROUP_META = {
  vowels:      { label: 'Vowel',       hex: 0x60a5fa, css: '#60a5fa' },
  consonants:  { label: 'Consonant',   hex: 0x34d399, css: '#34d399' },
  digits:      { label: 'Digit',       hex: 0xfbbf24, css: '#fbbf24' },
  punctuation: { label: 'Punctuation', hex: 0xf472b6, css: '#f472b6' },
  whitespace:  { label: 'Whitespace',  hex: 0x94a3b8, css: '#94a3b8' },
  other:       { label: 'Other',       hex: 0xa78bfa, css: '#a78bfa' },
}

function getGroup(ch) {
  if (CHAR_GROUPS.vowels.has(ch))      return 'vowels'
  if (CHAR_GROUPS.consonants.has(ch))  return 'consonants'
  if (CHAR_GROUPS.digits.has(ch))      return 'digits'
  if (CHAR_GROUPS.punctuation.has(ch)) return 'punctuation'
  if (CHAR_GROUPS.whitespace.has(ch))  return 'whitespace'
  return 'other'
}

// ── Math helpers ──────────────────────────────────────────────────────────────
function dist3(a, b) {
  const dx = a[0]-b[0], dy = a[1]-b[1], dz = a[2]-b[2]
  return Math.sqrt(dx*dx + dy*dy + dz*dz)
}

function cosineSim(a, b) {
  let dot = 0, ma = 0, mb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; ma += a[i]*a[i]; mb += b[i]*b[i] }
  const denom = Math.sqrt(ma) * Math.sqrt(mb)
  return denom === 0 ? 0 : dot / denom
}

// K nearest neighbours by Euclidean distance in coords array
function knn(idx, coords, k = 4) {
  const base = coords[idx]
  return coords
    .map((c, i) => ({ i, d: i === idx ? Infinity : dist3(base, c) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map(x => x.i)
}

// Clamp
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

export default function EmbeddingStarMap({ embeddingSnapshots = [], vocabInfo }) {
  return <div className="card"><p className="text-slate-500 text-xs">scaffold only</p></div>
}
```

**Step 2: Verify it renders without crashing**

Open http://localhost:5173, go to Watch It Learn tab, confirm the card shows "scaffold only" without errors in the console.

**Step 3: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): scaffold helpers and char group utilities"
```

---

### Task 2: Three.js scene initialization — renderer, camera, lights, star field, sphere nodes

**Files:**
- Modify: `src/components/tabs/EmbeddingStarMap.jsx`

**Step 1: Replace the export default function with full scene init**

The component manages all Three.js objects via refs. Scene is built once on mount.

```jsx
export default function EmbeddingStarMap({ embeddingSnapshots = [], vocabInfo }) {
  const wrapperRef  = useRef(null)
  const canvasRef   = useRef(null)
  const sceneRef    = useRef(null)   // { renderer, scene, camera, meshes, glows, lines, animId, theta, phi, radius }
  const coordsRef   = useRef([])     // latest coords array
  const labelsRef   = useRef([])     // latest labels array

  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [hoverPos,   setHoverPos]   = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  const latest = embeddingSnapshots.length > 0
    ? embeddingSnapshots[embeddingSnapshots.length - 1]
    : null

  const labels = latest?.labels ?? vocabInfo?.vocab ?? []

  // ── Build scene once labels are available ───────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || labels.length === 0 || sceneRef.current) return

    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    const W = wrapper.clientWidth  || 600
    const H = isFullscreen ? window.innerHeight : 360

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0a1628)

    // Scene
    const scene = new THREE.Scene()

    // Lights
    scene.add(new THREE.AmbientLight(0x1e293b, 3))
    const centerLight = new THREE.PointLight(0x60a5fa, 2, 10)
    centerLight.position.set(0, 0, 0)
    scene.add(centerLight)

    // Camera
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.set(0, 0, 5)

    // Star field
    const starPositions = new Float32Array(400 * 3)
    for (let i = 0; i < 400; i++) {
      starPositions[i*3]   = (Math.random() - 0.5) * 12
      starPositions[i*3+1] = (Math.random() - 0.5) * 12
      starPositions[i*3+2] = (Math.random() - 0.5) * 12
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x334155, size: 0.03 })))

    // Sphere nodes — start at random positions, will lerp when data arrives
    const sphereGeo  = new THREE.SphereGeometry(0.06, 10, 10)
    const meshes  = []
    const glows   = []

    // Glow sprite texture (radial gradient drawn on canvas)
    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = glowCanvas.height = 64
    const ctx = glowCanvas.getContext('2d')
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0,   'rgba(255,255,255,1)')
    grad.addColorStop(0.3, 'rgba(255,255,255,0.4)')
    grad.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
    const glowTex = new THREE.CanvasTexture(glowCanvas)

    labels.forEach((ch, i) => {
      const group = getGroup(ch)
      const meta  = GROUP_META[group]

      // Sphere
      const mat  = new THREE.MeshPhongMaterial({ color: meta.hex, emissive: meta.hex, emissiveIntensity: 0.3, shininess: 80 })
      const mesh = new THREE.Mesh(sphereGeo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
      )
      mesh.userData = { idx: i, ch, group, meta }
      scene.add(mesh)
      meshes.push(mesh)

      // Glow sprite
      const spriteMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: meta.hex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.scale.set(0.35, 0.35, 1)
      sprite.position.copy(mesh.position)
      scene.add(sprite)
      glows.push(sprite)
    })

    // Render loop
    let theta = 0, phi = 0.2, radius = 5
    const animate = () => {
      const id = requestAnimationFrame(animate)
      sceneRef.current.animId = id
      theta += 0.004
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
      camera.position.y = radius * Math.cos(phi)
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    animate()

    sceneRef.current = { renderer, scene, camera, meshes, glows, lines: [], animId: null, theta, phi, radius, sphereGeo, glowTex }
    labelsRef.current = labels
  }, [labels.length])

  // Cleanup on unmount
  useEffect(() => () => {
    if (!sceneRef.current) return
    const { renderer, animId, sphereGeo, glowTex } = sceneRef.current
    cancelAnimationFrame(animId)
    sphereGeo.dispose()
    glowTex.dispose()
    renderer.dispose()
  }, [])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Embedding Space</h3>
          <InfoIcon topicId="watch-it-learn" />
        </div>
        {latest && <span className="text-xs text-slate-500 font-mono">step {latest.step}</span>}
      </div>

      <div ref={wrapperRef} className="relative rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full cursor-grab active:cursor-grabbing" style={{ height: 360, display: 'block' }} />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
        {Object.entries(GROUP_META).map(([key, { label, css }]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: css }} />
            <span className="text-slate-500">{label}s</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-2">
        {!latest ? 'Start training to watch embeddings form.' : 'Drag to orbit · Scroll to zoom · Hover a node for details'}
      </p>
    </div>
  )
}
```

**Step 2: Verify in browser**

Start training (or use a completed session). Confirm:
- Glowing colored spheres visible in a 3D scatter
- Scene auto-rotates
- No console errors about Three.js

**Step 3: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): 3D sphere nodes with glow sprites and auto-rotation"
```

---

### Task 3: Embed position updates — lerp spheres to PCA coords on each snapshot

**Files:**
- Modify: `src/components/tabs/EmbeddingStarMap.jsx` — add useEffect that watches `latest`

**Step 1: Add position lerp effect inside the component (after scene init useEffect)**

```jsx
  // ── Lerp spheres to new coords when snapshot arrives ────────────────────────
  useEffect(() => {
    if (!latest || !sceneRef.current) return
    const { meshes, glows } = sceneRef.current
    const coords = latest.coords
    const count  = Math.min(meshes.length, coords.length)

    // Capture start positions
    const starts = meshes.slice(0, count).map(m => m.position.clone())

    let t = 0
    let frame
    const lerp = () => {
      t = Math.min(t + 0.05, 1)
      for (let i = 0; i < count; i++) {
        const tx = coords[i][0] * 2.2
        const ty = coords[i][1] * 2.2
        const tz = coords[i][2] * 2.2
        meshes[i].position.lerpVectors(starts[i], new THREE.Vector3(tx, ty, tz), t)
        glows[i].position.copy(meshes[i].position)
      }
      coordsRef.current = coords
      if (t < 1) frame = requestAnimationFrame(lerp)
    }
    lerp()
    return () => cancelAnimationFrame(frame)
  }, [latest])
```

**Step 2: Verify**

Train a model, watch nodes fly from random scatter to clustered positions after the first eval step. Vowels should cluster together, consonants together, etc.

**Step 3: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): lerp sphere positions to PCA coords on snapshot update"
```

---

### Task 4: Connection lines between K-nearest neighbors

**Files:**
- Modify: `src/components/tabs/EmbeddingStarMap.jsx` — add `buildLines` helper + call after lerp

**Step 1: Add `buildLines` function (above the component) and integrate**

Add this helper above the component:

```jsx
function buildConnectionLines(scene, existingLines, meshes, coords, labels) {
  // Remove old lines
  existingLines.forEach(l => { scene.remove(l); l.geometry.dispose(); l.material.dispose() })
  const newLines = []

  if (coords.length === 0) return newLines

  const seen = new Set()
  coords.forEach((_, i) => {
    const neighbors = knn(i, coords, 4)
    neighbors.forEach(j => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) return
      seen.add(key)

      const d = dist3(coords[i], coords[j])
      const opacity = clamp(1 - d / 2.5, 0.04, 0.55)

      const colorA = new THREE.Color(GROUP_META[getGroup(labels[i] || '')].hex)
      const colorB = new THREE.Color(GROUP_META[getGroup(labels[j] || '')].hex)
      colorA.lerp(colorB, 0.5)

      const geo = new THREE.BufferGeometry().setFromPoints([
        meshes[i].position.clone(),
        meshes[j].position.clone(),
      ])
      const mat = new THREE.LineBasicMaterial({ color: colorA, transparent: true, opacity, depthWrite: false })
      const line = new THREE.Line(geo, mat)
      scene.add(line)
      newLines.push(line)
    })
  })
  return newLines
}
```

Then in the lerp useEffect, after `if (t < 1) frame = requestAnimationFrame(lerp)`, add a `else` branch to rebuild lines when lerp finishes:

```jsx
      if (t < 1) {
        frame = requestAnimationFrame(lerp)
      } else {
        // Rebuild connection lines once positions settle
        const s = sceneRef.current
        s.lines = buildConnectionLines(s.scene, s.lines, meshes, coords, labelsRef.current)
      }
```

**Step 2: Verify**

After first eval step, colored lines should appear connecting nearby nodes. Lines should be more opaque between very close nodes and fade for distant ones.

**Step 3: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): KNN connection lines with distance-based opacity"
```

---

### Task 5: Orbit controls — full mouse drag (theta+phi) + scroll zoom

**Files:**
- Modify: `src/components/tabs/EmbeddingStarMap.jsx` — replace the simple pointer handler in scene init

**Step 1: Replace pointer handlers in the scene init useEffect**

Remove the old `let isDown = false, prevX = 0` block and replace with:

```jsx
    // Full orbit controls
    let isDragging = false
    let prevX = 0, prevY = 0

    const onPointerDown = (e) => {
      isDragging = true
      prevX = e.clientX
      prevY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e) => {
      if (!isDragging) return
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      prevX = e.clientX
      prevY = e.clientY
      sceneRef.current.theta -= dx * 0.006
      sceneRef.current.phi    = clamp(sceneRef.current.phi + dy * 0.006, 0.15, Math.PI - 0.15)
    }
    const onPointerUp = () => { isDragging = false }
    const onWheel = (e) => {
      e.preventDefault()
      sceneRef.current.radius = clamp(sceneRef.current.radius + e.deltaY * 0.005, 1.5, 8)
    }

    canvas.addEventListener('pointerdown',  onPointerDown)
    canvas.addEventListener('pointermove',  onPointerMove)
    canvas.addEventListener('pointerup',    onPointerUp)
    canvas.addEventListener('wheel',        onWheel, { passive: false })
```

Also store theta/phi/radius on sceneRef so the animate loop reads from it:

In the animate loop, change:
```jsx
      const { theta, phi, radius } = sceneRef.current  // read from ref each frame
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
      camera.position.y = radius * Math.cos(phi)
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta)
      camera.lookAt(0, 0, 0)
      sceneRef.current.theta += 0.004  // auto-rotate only when not dragging
```

And in cleanup:
```jsx
      canvas.removeEventListener('pointerdown',  onPointerDown)
      canvas.removeEventListener('pointermove',  onPointerMove)
      canvas.removeEventListener('pointerup',    onPointerUp)
      canvas.removeEventListener('wheel',        onWheel)
```

**Step 2: Verify**

- Mouse drag left/right rotates horizontally
- Mouse drag up/down tilts vertically (polar angle)
- Scroll wheel zooms in and out
- Camera never flips upside down (phi clamped)

**Step 3: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): full orbit controls — theta+phi drag and scroll zoom"
```

---

### Task 6: Raycaster hover — highlight node + show info panel

**Files:**
- Modify: `src/components/tabs/EmbeddingStarMap.jsx` — add raycaster pointermove handler + HoverPanel component

**Step 1: Add HoverPanel component above EmbeddingStarMap**

```jsx
function HoverPanel({ idx, labels, coords, pos }) {
  if (idx === null || !labels[idx]) return null
  const ch    = labels[idx]
  const group = getGroup(ch)
  const meta  = GROUP_META[group]
  const cp    = `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}`

  // Top 5 nearest by cosine sim (using coords as proxy)
  const base = coords[idx] || []
  const neighbors = coords
    .map((c, i) => ({ i, sim: i === idx ? -Infinity : cosineSim(base, c) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 5)

  const displayChar = ch === ' ' ? '(space)' : ch === '\n' ? '(newline)' : ch === '\t' ? '(tab)' : ch

  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[160px] bg-neural-card border border-neural-border rounded-lg shadow-xl p-3 text-xs"
      style={{ left: pos.x + 12, top: pos.y - 20 }}
    >
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-mono font-bold" style={{ color: meta.css }}>{displayChar}</span>
        <div>
          <div className="text-slate-300 font-medium">{meta.label}</div>
          <div className="text-slate-500 font-mono">{cp}</div>
        </div>
      </div>
      <div className="border-t border-neural-border pt-2">
        <div className="text-slate-500 mb-1">Nearest neighbors</div>
        {neighbors.map(({ i, sim }) => {
          const nc = labels[i]
          if (!nc) return null
          const nd = nc === ' ' ? '(space)' : nc === '\n' ? '(newline)' : nc
          const pct = Math.round(clamp(sim, 0, 1) * 100)
          return (
            <div key={i} className="flex items-center justify-between gap-3 py-0.5">
              <span className="font-mono text-slate-300" style={{ color: GROUP_META[getGroup(nc)].css }}>{nd}</span>
              <div className="flex items-center gap-1.5 flex-1">
                <div className="flex-1 h-1 bg-neural-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-slate-500 w-7 text-right">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Add raycaster to canvas pointermove inside scene init useEffect**

```jsx
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()

    const onHover = (e) => {
      if (!sceneRef.current) return
      const rect = canvas.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)   / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, sceneRef.current.camera)
      const hits = raycaster.intersectObjects(sceneRef.current.meshes)
      if (hits.length > 0) {
        const idx = hits[0].object.userData.idx
        setHoveredIdx(idx)
        setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        // Scale up hovered sphere
        sceneRef.current.meshes.forEach((m, i) => {
          m.scale.setScalar(i === idx ? 1.8 : 1.0)
          m.material.emissiveIntensity = i === idx ? 0.9 : 0.3
        })
      } else {
        setHoveredIdx(null)
        sceneRef.current.meshes.forEach(m => {
          m.scale.setScalar(1.0)
          m.material.emissiveIntensity = 0.3
        })
      }
    }

    canvas.addEventListener('pointermove', onHover)
    // add to cleanup: canvas.removeEventListener('pointermove', onHover)
```

**Step 3: Render HoverPanel inside the wrapper div**

```jsx
      <div ref={wrapperRef} className="relative rounded-lg overflow-hidden">
        <canvas ... />
        <HoverPanel
          idx={hoveredIdx}
          labels={labelsRef.current}
          coords={coordsRef.current}
          pos={hoverPos}
        />
      </div>
```

**Step 4: Verify**

Hover over a glowing sphere → it scales up and a panel appears with: the character (large, colored), group, code point, and 5 nearest neighbors with cosine-similarity bars.

**Step 5: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): raycaster hover — node highlight and info panel"
```

---

### Task 7: Fullscreen mode + ResizeObserver

**Files:**
- Modify: `src/components/tabs/EmbeddingStarMap.jsx` — add fullscreen toggle and resize handling

**Step 1: Add fullscreen toggle button in the header**

```jsx
        <div className="flex items-center gap-3">
          {latest && <span className="text-xs text-slate-500 font-mono">step {latest.step}</span>}
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className="text-slate-500 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
```

**Step 2: Apply fullscreen class to outer wrapper**

```jsx
  return (
    <div className={isFullscreen
      ? 'fixed inset-0 z-50 bg-neural-bg flex flex-col p-4'
      : 'card'
    }>
```

The canvas wrapper should fill available space in fullscreen:

```jsx
      <div ref={wrapperRef} className={`relative rounded-lg overflow-hidden ${isFullscreen ? 'flex-1' : ''}`}>
        <canvas
          ref={canvasRef}
          className="w-full cursor-grab active:cursor-grabbing"
          style={{ height: isFullscreen ? '100%' : 360, display: 'block' }}
        />
```

**Step 3: Add ResizeObserver to update renderer when wrapper size changes**

Add inside the scene init useEffect, after renderer setup:

```jsx
    const ro = new ResizeObserver(() => {
      if (!sceneRef.current) return
      const W = wrapper.clientWidth
      const H = wrapper.clientHeight || (isFullscreen ? window.innerHeight : 360)
      renderer.setSize(W, H)
      camera.aspect = W / H
      camera.updateProjectionMatrix()
    })
    ro.observe(wrapper)
    // add to cleanup: ro.disconnect()
```

**Step 4: Add ESC key handler**

```jsx
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])
```

**Step 5: Verify**

- Click the expand icon → canvas fills the screen with a dark background
- Scene continues rendering and rotating
- Hover panel still works
- ESC or click icon again → returns to card layout
- Dragging the window to resize updates the renderer

**Step 6: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): fullscreen mode with ResizeObserver and ESC to exit"
```

---

### Task 8: Final polish — auto-stop rotation while dragging, connection line position sync

**Files:**
- Modify: `src/components/tabs/EmbeddingStarMap.jsx`

**Step 1: Stop auto-rotation while user is dragging**

In the animate loop, only increment theta when not dragging:

```jsx
      if (!sceneRef.current.isDragging) {
        sceneRef.current.theta += 0.004
      }
```

Add `isDragging: false` to `sceneRef.current` object. Set `sceneRef.current.isDragging = true` in `onPointerDown` and `false` in `onPointerUp`.

**Step 2: Update connection line geometry positions during lerp**

In the lerp useEffect, update line positions each frame so lines follow spheres as they animate (instead of rebuilding only at the end):

```jsx
      // Update line endpoints every frame during lerp
      const { lines, meshes: ms } = sceneRef.current
      lines.forEach(line => {
        // Lines store references to mesh indices in userData
        const { a, b } = line.userData
        if (a !== undefined && b !== undefined) {
          const pos = line.geometry.attributes.position
          pos.setXYZ(0, ms[a].position.x, ms[a].position.y, ms[a].position.z)
          pos.setXYZ(1, ms[b].position.x, ms[b].position.y, ms[b].position.z)
          pos.needsUpdate = true
        }
      })
```

For this to work, store `userData.a` and `userData.b` on each line in `buildConnectionLines`:

```jsx
      line.userData = { a: i, b: j }
```

**Step 3: Verify**

- Dragging pauses auto-rotation, releasing resumes it
- Connection lines smoothly follow nodes as they animate to new positions

**Step 4: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): stop auto-rotation during drag, live line position sync"
```

---

### Task 9: Final visual verification

**Step 1: Full end-to-end test**

1. Go to Watch It Learn tab
2. Select Shakespeare dataset, start training with Medium model
3. After first eval step (step 100), confirm:
   - Spheres fly from random positions to PCA clusters
   - Vowels cluster together (blue spheres near each other)
   - Connection lines appear between nearby nodes
   - Hover over a sphere → info panel shows character, group, code point, 5 neighbors with similarity bars
   - Drag → orbits horizontally and vertically
   - Scroll → zooms in/out
   - Fullscreen button → fills screen
   - ESC → exits fullscreen

**Step 2: Commit**

```bash
git add src/components/tabs/EmbeddingStarMap.jsx
git commit -m "feat(embedding): complete 3D embedding space redesign"
```
