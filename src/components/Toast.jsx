import { useEffect, useRef } from 'react'
import './Toast.css'

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ'
}

export default function Toast({ message, type = 'success', onDismiss, duration = 2500 }) {
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, duration)
    return () => clearTimeout(timerRef.current)
  }, [onDismiss, duration])

  return (
    <div
      className={`toast toast--${type}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onClick={onDismiss}
    >
      <span className="toast__icon" aria-hidden="true">{ICONS[type]}</span>
      <span className="toast__message">{message}</span>
    </div>
  )
}
