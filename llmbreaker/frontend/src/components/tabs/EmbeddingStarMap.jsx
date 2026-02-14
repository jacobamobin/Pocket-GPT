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
    const H = 360

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

    // Pointer orbit (horizontal only)
    let isDragging = false, prevX = 0
    const onPointerDown = (e) => { isDragging = true; prevX = e.clientX; canvas.setPointerCapture(e.pointerId) }
    const onPointerMove = (e) => {
      if (!isDragging || !sceneRef.current) return
      sceneRef.current.theta -= (e.clientX - prevX) * 0.006
      prevX = e.clientX
    }
    const onPointerUp   = () => { isDragging = false }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup',   onPointerUp)

    // Set sceneRef BEFORE animate so the render loop reads/writes it directly
    sceneRef.current = {
      renderer, scene, camera, meshes, glows, lines: [],
      sphereGeo, glowTex, starGeo,
      theta: 0, phi: 1.2, radius: 5, isDragging: false, animId: null,
    }

    const animate = () => {
      sceneRef.current.animId = requestAnimationFrame(animate)
      sceneRef.current.theta += 0.004
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
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup',   onPointerUp)
      meshes.forEach(m => m.material.dispose())
      glows.forEach(g => g.material.dispose())
      sphereGeo.dispose()
      glowTex.dispose()
      starGeo.dispose()
      renderer.dispose()
      sceneRef.current = null
    }
  }, [labels.length])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Embedding Space</h3>
          <InfoIcon topicId="watch-it-learn" />
        </div>
        <div className="flex items-center gap-3">
          {latest && <span className="text-xs text-slate-500 font-mono">step {latest.step}</span>}
        </div>
      </div>

      <div ref={wrapperRef} className="relative rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full cursor-grab active:cursor-grabbing"
          style={{ height: 360, display: 'block' }}
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
