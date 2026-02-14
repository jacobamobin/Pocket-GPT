import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import InfoIcon from '../shared/InfoIcon'

const MAX_3D = 16  // first 16×16 tokens for 3D performance

function displayTok(tok) {
  if (tok === ' ')  return '\u00B7'  // middle dot
  if (tok === '\n') return '\u21B5'  // return symbol
  if (tok === '\t') return '\u21E5'
  return tok
}

/**
 * Create a text sprite that always faces the camera.
 */
function makeTextSprite(text, { color = '#64748b', fontSize = 48, scale = 0.4 } = {}) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 64
  canvas.height = 64
  ctx.clearRect(0, 0, 64, 64)
  ctx.font = `bold ${fontSize}px monospace`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 32, 32)

  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(scale, scale, 1)
  return sprite
}

/**
 * Create axis title label (larger, oriented).
 */
function makeAxisLabel(text, { color = '#94a3b8' } = {}) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 256
  canvas.height = 64
  ctx.clearRect(0, 0, 256, 64)
  ctx.font = 'bold 28px monospace'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 32)

  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(1.6, 0.4, 1)
  return sprite
}

export default function Heatmap3D({ matrix, tokens = [] }) {
  const canvasRef  = useRef(null)
  const cleanupRef = useRef(null)

  useEffect(() => {
    // Clean up previous scene
    cleanupRef.current?.()
    cleanupRef.current = null

    const canvas = canvasRef.current
    if (!canvas || !matrix || matrix.length === 0) return

    // WebGL availability check
    const testCtx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!testCtx) return

    const N = Math.min(matrix.length, MAX_3D)
    const toks = tokens.slice(0, N)

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    const W = canvas.parentElement?.clientWidth  || 500
    const H = 320
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // --- Scene ---
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a1628)

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const sun = new THREE.DirectionalLight(0x93c5fd, 1.2)
    sun.position.set(N, N * 2, N * 1.5)
    scene.add(sun)

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 300)

    // --- Build bars ---
    const CELL   = 0.8
    const STEP   = 1.0
    const MAX_H  = N * 0.6
    const center = ((N - 1) * STEP) / 2
    const lowColor  = new THREE.Color(0xdbeafe)  // blue-100
    const highColor = new THREE.Color(0x1e3a8a)  // blue-900

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const val = matrix[r]?.[c] ?? 0
        const h   = Math.max(0.03, val * MAX_H)
        const color = new THREE.Color().lerpColors(lowColor, highColor, val)
        const geo  = new THREE.BoxGeometry(CELL, h, CELL)
        const mat  = new THREE.MeshPhongMaterial({ color })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(c * STEP - center, h / 2, r * STEP - center)
        scene.add(mesh)
      }
    }

    // Grid floor
    const grid = new THREE.GridHelper((N + 1) * STEP, N + 1, 0x1e3a5f, 0x1e3a5f)
    grid.position.y = -0.01
    scene.add(grid)

    // --- Axis token labels ---
    const labelOffset = 0.8  // distance from the grid edge

    // X-axis labels (columns = key tokens) — along the front edge (positive Z)
    for (let c = 0; c < N; c++) {
      const label = toks[c] != null ? displayTok(toks[c]) : String(c)
      const sprite = makeTextSprite(label, { color: '#60a5fa' })
      sprite.position.set(c * STEP - center, -0.15, center + labelOffset)
      scene.add(sprite)
    }

    // Z-axis labels (rows = query tokens) — along the left edge (negative X)
    for (let r = 0; r < N; r++) {
      const label = toks[r] != null ? displayTok(toks[r]) : String(r)
      const sprite = makeTextSprite(label, { color: '#34d399' })
      sprite.position.set(-center - labelOffset, -0.15, r * STEP - center)
      scene.add(sprite)
    }

    // Axis title labels
    const xTitle = makeAxisLabel('Key (attends to)', { color: '#60a5fa' })
    xTitle.position.set(0, -0.5, center + labelOffset + 0.7)
    scene.add(xTitle)

    const zTitle = makeAxisLabel('Query (from)', { color: '#34d399' })
    zTitle.position.set(-center - labelOffset - 0.7, -0.5, 0)
    scene.add(zTitle)

    // Y-axis title (height = attention weight)
    const yTitle = makeAxisLabel('Attention Weight', { color: '#94a3b8' })
    yTitle.position.set(-center - labelOffset - 0.5, MAX_H * 0.5, -center - labelOffset - 0.5)
    scene.add(yTitle)

    // --- Orbit state ---
    let theta  = 30   // horizontal angle (degrees)
    let phi    = 50   // vertical angle
    let radius = N * STEP * 2.4

    function applyCamera() {
      const t = (theta * Math.PI) / 180
      const p = (phi   * Math.PI) / 180
      camera.position.set(
        radius * Math.sin(p) * Math.sin(t),
        radius * Math.cos(p),
        radius * Math.sin(p) * Math.cos(t),
      )
      camera.lookAt(0, MAX_H * 0.15, 0)
    }
    applyCamera()

    // --- Pointer controls ---
    let isDown = false, prevX = 0, prevY = 0

    const onDown  = (e) => { isDown = true;  prevX = e.clientX; prevY = e.clientY; canvas.setPointerCapture(e.pointerId) }
    const onMove  = (e) => {
      if (!isDown) return
      theta -= (e.clientX - prevX) * 0.45
      phi    = Math.max(12, Math.min(80, phi - (e.clientY - prevY) * 0.3))
      prevX  = e.clientX
      prevY  = e.clientY
      applyCamera()
    }
    const onUp    = () => { isDown = false }
    const onWheel = (e) => {
      radius = Math.max(N * 0.8, Math.min(N * STEP * 5, radius + e.deltaY * 0.05))
      applyCamera()
      e.preventDefault()
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup',   onUp)
    canvas.addEventListener('wheel',       onWheel, { passive: false })

    // --- Render loop ---
    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    cleanupRef.current = () => {
      cancelAnimationFrame(frameId)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup',   onUp)
      canvas.removeEventListener('wheel',       onWheel)
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose()
          obj.material.dispose()
        }
      })
      renderer.dispose()
    }
  }, [matrix, tokens])

  useEffect(() => () => cleanupRef.current?.(), [])

  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-600 text-sm">
        No attention data yet
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="text-xs text-slate-500 font-mono">3D Attention View</span>
        <InfoIcon topicId="attention-3d" />
      </div>
      <canvas
        ref={canvasRef}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height: 320, display: 'block' }}
      />
      <div className="flex items-center justify-between mt-1 px-1">
        <p className="text-xs text-slate-600">
          Drag to rotate · Scroll to zoom · Showing first {Math.min((matrix || []).length, MAX_3D)}×{Math.min((matrix || []).length, MAX_3D)} tokens
        </p>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Key</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Query</span>
        </div>
      </div>
    </div>
  )
}
