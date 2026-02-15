import { useEffect, useRef } from 'react'

const NODE_COUNT  = 55
const MAX_DIST    = 160   // px — max distance for a connection to form
const NODE_SPEED  = 0.4   // px per frame
const NODE_RADIUS = 2.5

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

function initNodes(w, h) {
  return Array.from({ length: NODE_COUNT }, () => ({
    x:   Math.random() * w,
    y:   Math.random() * h,
    vx:  (Math.random() - 0.5) * NODE_SPEED * 2,
    vy:  (Math.random() - 0.5) * NODE_SPEED * 2,
    // Each node pulses its own glow independently
    phase: Math.random() * Math.PI * 2,
  }))
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let nodes = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      nodes = initNodes(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    let frame = 0

    const draw = () => {
      const { width: W, height: H } = canvas
      frame++

      ctx.clearRect(0, 0, W, H)

      // Move nodes, bounce off walls
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        n.phase += 0.02
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > MAX_DIST) continue

          const fade = 1 - dist / MAX_DIST
          // Pulse the connection opacity
          const pulse = 0.2 + 0.4 * Math.abs(Math.sin(frame * 0.008 + a.phase))
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(167,139,113,${(fade * pulse * 0.6).toFixed(3)})`
          ctx.lineWidth = fade * 1.2
          ctx.stroke()
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const glow = 0.6 + 0.4 * Math.sin(n.phase)

        // Outer glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, NODE_RADIUS * 4)
        grad.addColorStop(0, `rgba(167,139,113,${(glow * 0.35).toFixed(3)})`)
        grad.addColorStop(1, 'rgba(167,139,113,0)')
        ctx.beginPath()
        ctx.arc(n.x, n.y, NODE_RADIUS * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,184,160,${(0.7 + glow * 0.3).toFixed(3)})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
