import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import InfoIcon from '../shared/InfoIcon'

const MAX_3D = 16  // first 16×16 tokens for 3D performance

export default function Heatmap3D({ matrix }) {
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

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    const W = canvas.parentElement?.clientWidth  || 500
    const H = 288
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

    // --- Orbit state ---
    let theta  = 30   // horizontal angle (degrees)
    let phi    = 50   // vertical angle
    let radius = N * STEP * 2.1

    function applyCamera() {
      const t = (theta * Math.PI) / 180
      const p = (phi   * Math.PI) / 180
      camera.position.set(
        radius * Math.sin(p) * Math.sin(t),
        radius * Math.cos(p),
        radius * Math.sin(p) * Math.cos(t),
      )
      camera.lookAt(0, MAX_H * 0.2, 0)
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
        if (obj.material) obj.material.dispose()
      })
      renderer.dispose()
    }
  }, [matrix])

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
        style={{ height: 288, display: 'block' }}
      />
      <p className="text-xs text-slate-600 mt-1 text-center">
        Drag to rotate · Scroll to zoom · Showing first {Math.min((matrix || []).length, MAX_3D)}×{Math.min((matrix || []).length, MAX_3D)} tokens
      </p>
    </div>
  )
}
