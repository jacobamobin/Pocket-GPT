import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const WS_URL = 'http://localhost:5000'

// Module-level singleton — one socket shared across all hook callers
let _socket = null
const _listeners = new Set()

function getSocket() {
  if (!_socket) {
    _socket = io(WS_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
    _socket.on('connect',    () => _listeners.forEach(fn => fn(true)))
    _socket.on('disconnect', () => _listeners.forEach(fn => fn(false)))
    _socket.on('connect_error', err => console.warn('[WS] connect error:', err.message))
  }
  return _socket
}

/**
 * Returns { socket, connected }.
 * All callers share the same Socket.IO connection.
 */
export function useWebSocket() {
  const [connected, setConnected] = useState(_socket?.connected ?? false)
  const socketRef = useRef(getSocket())

  useEffect(() => {
    const socket = socketRef.current
    const onStatus = (v) => setConnected(v)
    _listeners.add(onStatus)
    // Sync current state
    setConnected(socket.connected)
    return () => { _listeners.delete(onStatus) }
  }, [])

  return { socket: socketRef.current, connected }
}
