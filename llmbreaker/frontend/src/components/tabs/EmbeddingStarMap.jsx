import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import InfoIcon from '../shared/InfoIcon'

/**
 * Embedding Space Star Map — 3D galaxy of dots representing token embeddings.
 *
 * Dots start scattered (random initial weights) and cluster as training progresses.
 * Similar tokens (like letters, digits, punctuation) fly toward each other.
 */

// Highlight groups for colour coding
const CHAR_GROUPS = {
  vowels:      new Set('aeiouAEIOU'),
  consonants:  new Set('bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ'),
  digits:      new Set('0123456789'),
  punctuation: new Set('.,;:!?\'"()-'),
  whitespace:  new Set(' \t\n\r'),
}

function groupColor(ch) {
  if (CHAR_GROUPS.vowels.has(ch))      return 0x60a5fa // blue
  if (CHAR_GROUPS.consonants.has(ch))  return 0x34d399 // emerald
  if (CHAR_GROUPS.digits.has(ch))      return 0xfbbf24 // amber
  if (CHAR_GROUPS.punctuation.has(ch)) return 0xf472b6 // pink
  if (CHAR_GROUPS.whitespace.has(ch))  return 0x94a3b8 // slate
  return 0xa78bfa // violet (other)
}

export default function EmbeddingStarMap({ embeddingSnapshots = [], vocabInfo }) {
  const canvasRef  = useRef(null)
  const cleanupRef = useRef(null)
  const pointsRef  = useRef(null)
  const labelsRef  = useRef([])

  const latest = embeddingSnapshots.length > 0
    ? embeddingSnapshots[embeddingSnapshots.length - 1]
    : null

  const labels = latest?.labels ?? vocabInfo?.vocab ?? []

  // Build or update the 3D scene
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Only initialise the scene once
    if (cleanupRef.current) {
      // Scene already exists — just update points below
      return
    }

    const W = canvas.parentElement?.clientWidth || 500
    const H = 320

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a1628)

    // Subtle stars background
    const starGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i++) {
      starPositions[i * 3]     = (Math.random() - 0.5) * 10
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 10
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({ color: 0x1e3a5f, size: 0.02 })
    scene.add(new THREE.Points(starGeo, starMat))

    // Camera
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.set(0, 0, 3.5)

    // Token points — initialise at random positions
    const count = Math.max(labels.length, 1)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 2.5
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5
      const col = new THREE.Color(groupColor(labels[i] || '?'))
      colors[i * 3]     = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    })

    const points = new THREE.Points(geom, mat)
    scene.add(points)
    pointsRef.current = points
    labelsRef.current = labels

    // Orbit
    let theta = 0

    // Render loop with slow auto-rotation
    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      theta += 0.003
      camera.position.x = 3.5 * Math.sin(theta)
      camera.position.z = 3.5 * Math.cos(theta)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    animate()

    // Pointer orbit
    let isDown = false, prevX = 0
    const onDown = (e) => { isDown = true; prevX = e.clientX; canvas.setPointerCapture(e.pointerId) }
    const onMove = (e) => { if (isDown) { theta -= (e.clientX - prevX) * 0.005; prevX = e.clientX } }
    const onUp   = () => { isDown = false }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup',   onUp)

    cleanupRef.current = () => {
      cancelAnimationFrame(frameId)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup',   onUp)
      geom.dispose()
      mat.dispose()
      starGeo.dispose()
      starMat.dispose()
      renderer.dispose()
    }
  }, [labels.length])

  // Smoothly animate points toward new positions when embeddings update
  useEffect(() => {
    if (!latest || !pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position
    const coords = latest.coords
    const count = Math.min(positions.count, coords.length)

    // Lerp current positions toward target
    let frame
    let t = 0
    const startPositions = new Float32Array(positions.array)

    const lerpFrame = () => {
      t += 0.04
      if (t >= 1) t = 1
      for (let i = 0; i < count; i++) {
        const tx = coords[i][0] * 1.8
        const ty = coords[i][1] * 1.8
        const tz = coords[i][2] * 1.8
        positions.array[i * 3]     = startPositions[i * 3]     + (tx - startPositions[i * 3])     * t
        positions.array[i * 3 + 1] = startPositions[i * 3 + 1] + (ty - startPositions[i * 3 + 1]) * t
        positions.array[i * 3 + 2] = startPositions[i * 3 + 2] + (tz - startPositions[i * 3 + 2]) * t
      }
      positions.needsUpdate = true
      if (t < 1) frame = requestAnimationFrame(lerpFrame)
    }
    lerpFrame()

    return () => cancelAnimationFrame(frame)
  }, [latest])

  // Cleanup on unmount
  useEffect(() => () => cleanupRef.current?.(), [])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Embedding Space
          </h3>
          <InfoIcon topicId="watch-it-learn" />
        </div>
        {latest && (
          <span className="text-xs text-slate-500 font-mono">
            step {latest.step}
          </span>
        )}
      </div>

      <div className="rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full cursor-grab active:cursor-grabbing"
          style={{ height: 320, display: 'block' }}
        />
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
        {[
          { label: 'Vowels', color: '#60a5fa' },
          { label: 'Consonants', color: '#34d399' },
          { label: 'Digits', color: '#fbbf24' },
          { label: 'Punctuation', color: '#f472b6' },
          { label: 'Whitespace', color: '#94a3b8' },
          { label: 'Other', color: '#a78bfa' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-2">
        {!latest
          ? 'Start training to watch embeddings form. Dots will cluster as the model learns which characters appear in similar contexts.'
          : 'The model is learning that these characters share similar meanings based on their context. Watch them cluster!'}
      </p>
    </div>
  )
}
