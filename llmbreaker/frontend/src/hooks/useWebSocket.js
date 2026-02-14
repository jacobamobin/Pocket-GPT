import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const WS_URL = 'http://localhost:5000'

/**
 * Manages a single Socket.IO connection shared across the app.
 *
 * Returns { socket, connected }
 * The socket instance is stable (same ref) across re-renders.
 */
export function useWebSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.warn('[WS] connect error:', err.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return { socket: socketRef.current, connected }
}
