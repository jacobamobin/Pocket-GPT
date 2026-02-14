import { useEffect, useRef, useState } from 'react'
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

function knn(idx, coords, k = 4) {
  const base = coords[idx]
  return coords
    .map((c, i) => ({ i, d: i === idx ? Infinity : dist3(base, c) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map(x => x.i)
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function buildConnectionLines(scene, existingLines, meshes, coords, labels) {
  // Remove old lines
  existingLines.forEach(l => {
    scene.remove(l)
    l.geometry.dispose()
    l.material.dispose()
  })

  if (coords.length === 0) return []

  const newLines = []
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
      const mat = new THREE.LineBasicMaterial({
        color: colorA,
        transparent: true,
        opacity,
        depthWrite: false,
      })
      const line = new THREE.Line(geo, mat)
      line.userData = { a: i, b: j }
      scene.add(line)
      newLines.push(line)
    })
  })

  return newLines
}

// ── HoverPanel ────────────────────────────────────────────────────────────────
function HoverPanel({ idx, labels, coords, pos }) {
  if (idx === null || idx === undefined || !labels[idx]) return null
  const ch    = labels[idx]
  const group = getGroup(ch)
  const meta  = GROUP_META[group]
  const cp    = `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`

  const base = coords[idx] || []
  const neighbors = coords
    .map((c, i) => ({ i, sim: i === idx ? -Infinity : cosineSim(base, c) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 5)

  const displayChar = ch === ' ' ? '(space)' : ch === '\n' ? '(newline)' : ch === '\t' ? '(tab)' : ch

  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[160px] bg-neural-card border border-neural-border rounded-lg shadow-xl p-3 text-xs"
      style={{ left: pos.x + 12, top: Math.max(0, pos.y - 20) }}
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
          const nd = nc === ' ' ? '(space)' : nc === '\n' ? '(newline)' : nc === '\t' ? '(tab)' : nc
          const pct = Math.round(clamp(sim, 0, 1) * 100)
          return (
            <div key={i} className="flex items-center justify-between gap-3 py-0.5">
              <span className="font-mono w-12 text-slate-300" style={{ color: GROUP_META[getGroup(nc)].css }}>{nd}</span>
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

// ── Full Three.js component ───────────────────────────────────────────────────
export default function EmbeddingStarMap({ embeddingSnapshots = [], vocabInfo }) {
  const wrapperRef = useRef(null)
  const canvasRef  = useRef(null)
  const sceneRef   = useRef(null)
  const coordsRef  = useRef(null)
  const labelsRef  = useRef(null)

  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [hoverPos,   setHoverPos]   = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  const latest = embeddingSnapshots.length > 0 ? embeddingSnapshots[embeddingSnapshots.length - 1] : null
  const labels = latest?.labels ?? vocabInfo?.vocab ?? []

  // Scene init
  useEffect(() => {
    if (!canvasRef.current || labels.length === 0 || sceneRef.current) return

    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    const W = wrapper.clientWidth || 600
    const H = wrapper.clientHeight || 360

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0a1628)

    // Scene + lights
    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0x1e293b, 3))
    const centerLight = new THREE.PointLight(0x60a5fa, 2, 10)
    centerLight.position.set(0, 0, 0)
    scene.add(centerLight)

    // Camera
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.set(0, 0, 5)

    // Star field (400 points)
    const starPositions = new Float32Array(400 * 3)
    for (let i = 0; i < 400; i++) {
      starPositions[i*3]   = (Math.random() - 0.5) * 12
      starPositions[i*3+1] = (Math.random() - 0.5) * 12
      starPositions[i*3+2] = (Math.random() - 0.5) * 12
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starPoints = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x334155, size: 0.03 }))
    scene.add(starPoints)

    // Glow sprite texture (radial gradient)
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

    // Sphere nodes
    const sphereGeo = new THREE.SphereGeometry(0.06, 10, 10)
    const meshes = []
    const glows  = []

    labels.forEach((ch, i) => {
      const group = getGroup(ch)
      const meta  = GROUP_META[group]

      const mat  = new THREE.MeshPhongMaterial({
        color: meta.hex, emissive: meta.hex, emissiveIntensity: 0.3, shininess: 80,
      })
      const mesh = new THREE.Mesh(sphereGeo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
      )
      mesh.userData = { idx: i, ch, group, meta }
      scene.add(mesh)
      meshes.push(mesh)

      const spriteMat = new THREE.SpriteMaterial({
        map: glowTex, color: meta.hex,
        blending: THREE.AdditiveBlending,
        transparent: true, opacity: 0.5, depthWrite: false,
      })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.scale.set(0.35, 0.35, 1)
      sprite.position.copy(mesh.position)
      scene.add(sprite)
      glows.push(sprite)
    })

    // ResizeObserver
    const ro = new ResizeObserver(() => {
      if (!sceneRef.current) return
      const W = wrapper.clientWidth
      const H = wrapper.clientHeight || 360
      renderer.setSize(W, H)
      camera.aspect = W / H
      camera.updateProjectionMatrix()
    })
    ro.observe(wrapper)

    // Full orbit + zoom controls
    let isDragging = false, prevX = 0, prevY = 0

    const onPointerDown = (e) => {
      isDragging = true
      sceneRef.current.isDragging = true
      prevX = e.clientX
      prevY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e) => {
      if (!isDragging || !sceneRef.current) return
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      prevX = e.clientX
      prevY = e.clientY
      sceneRef.current.theta -= dx * 0.006
      sceneRef.current.phi    = clamp(sceneRef.current.phi + dy * 0.006, 0.15, Math.PI - 0.15)
    }
    const onPointerUp = () => {
      isDragging = false
      if (sceneRef.current) sceneRef.current.isDragging = false
    }
    const onWheel = (e) => {
      e.preventDefault()
      if (!sceneRef.current) return
      sceneRef.current.radius = clamp(sceneRef.current.radius + e.deltaY * 0.005, 1.5, 8)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup',   onPointerUp)
    canvas.addEventListener('wheel',       onWheel, { passive: false })

    // Raycaster hover
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()

    const onHover = (e) => {
      if (!sceneRef.current) return
      const rect = canvas.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, sceneRef.current.camera)
      const hits = raycaster.intersectObjects(sceneRef.current.meshes)
      if (hits.length > 0) {
        const idx = hits[0].object.userData.idx
        setHoveredIdx(idx)
        setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
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

    // Set sceneRef BEFORE animate so the render loop reads/writes it directly
    sceneRef.current = {
      renderer, scene, camera, meshes, glows, lines: [],
      sphereGeo, glowTex, starGeo,
      theta: 0, phi: 1.2, radius: 5, isDragging: false, animId: null,
    }

    const animate = () => {
      sceneRef.current.animId = requestAnimationFrame(animate)
      if (!sceneRef.current.isDragging) sceneRef.current.theta += 0.004
      const s = sceneRef.current
      camera.position.x = s.radius * Math.sin(s.phi) * Math.sin(s.theta)
      camera.position.y = s.radius * Math.cos(s.phi)
      camera.position.z = s.radius * Math.sin(s.phi) * Math.cos(s.theta)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    animate()

    labelsRef.current = labels

    return () => {
      cancelAnimationFrame(sceneRef.current?.animId)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup',   onPointerUp)
      canvas.removeEventListener('wheel',       onWheel)
      canvas.removeEventListener('pointermove', onHover)
      meshes.forEach(m => m.material.dispose())
      glows.forEach(g => g.material.dispose())
      sphereGeo.dispose()
      glowTex.dispose()
      starGeo.dispose()
      renderer.dispose()
      sceneRef.current?.lines?.forEach(l => { l.geometry.dispose(); l.material.dispose() })
      sceneRef.current = null
    }
  }, [labels.length])

  // ── Lerp spheres to new PCA coords on each snapshot ───────────────────────────
  useEffect(() => {
    if (!latest || !sceneRef.current) return
    const { meshes, glows } = sceneRef.current
    const coords = latest.coords
    if (!coords || coords.length === 0) return
    const count = Math.min(meshes.length, coords.length)

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

        // Update connection line endpoints during animation
        const { lines: currentLines } = sceneRef.current
        currentLines.forEach(line => {
          const { a, b } = line.userData
          if (a === undefined || b === undefined) return
          const pos = line.geometry.attributes.position
          if (!pos) return
          const ma = meshes[a], mb = meshes[b]
          if (!ma || !mb) return
          pos.setXYZ(0, ma.position.x, ma.position.y, ma.position.z)
          pos.setXYZ(1, mb.position.x, mb.position.y, mb.position.z)
          pos.needsUpdate = true
        })
      }
      coordsRef.current = coords
      if (t < 1) {
        frame = requestAnimationFrame(lerp)
      } else {
        // Rebuild connection lines once positions settle
        const s = sceneRef.current
        if (s) s.lines = buildConnectionLines(s.scene, s.lines, meshes, coords, labelsRef.current)
      }
    }
    lerp()
    return () => cancelAnimationFrame(frame)
  }, [latest])

  useEffect(() => {
    labelsRef.current = labels
  }, [labels])

  // ESC key handler
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsFullscreen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={isFullscreen
      ? 'fixed inset-0 z-50 bg-neural-bg flex flex-col p-4'
      : 'card'
    }>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Embedding Space</h3>
          <InfoIcon topicId="watch-it-learn" />
        </div>
        <div className="flex items-center gap-3">
          {latest && <span className="text-xs text-slate-500 font-mono">step {latest.step}</span>}
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className="text-slate-500 hover:text-white transition-colors p-1"
            title={isFullscreen ? 'Exit fullscreen (ESC)' : 'Fullscreen'}
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
      </div>

      <div ref={wrapperRef} className={`relative rounded-lg overflow-hidden ${isFullscreen ? 'flex-1' : ''}`}>
        <canvas
          ref={canvasRef}
          className="w-full cursor-grab active:cursor-grabbing"
          style={{ height: isFullscreen ? '100%' : 360, display: 'block' }}
        />
        <HoverPanel
          idx={hoveredIdx}
          labels={labelsRef.current || []}
          coords={coordsRef.current || []}
          pos={hoverPos}
        />
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
        {!latest
          ? 'Start training to watch embeddings form.'
          : 'Drag to orbit · Scroll to zoom · Hover a node for details'}
      </p>
    </div>
  )
}
