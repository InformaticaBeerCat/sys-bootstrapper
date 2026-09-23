import { useEffect, useRef, useState } from 'react'

interface TopLoadingBarProps {
  active: boolean
}

export function TopLoadingBar({ active }: TopLoadingBarProps) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const wasActive = useRef(false)

  useEffect(() => {
    if (active) {
      wasActive.current = true
      setVisible(true)
      setProgress(0)
      const raf = requestAnimationFrame(() => setProgress(25))
      const t1 = window.setTimeout(() => setProgress(55), 150)
      const t2 = window.setTimeout(() => setProgress(75), 500)
      const t3 = window.setTimeout(() => setProgress(88), 1100)
      return () => {
        cancelAnimationFrame(raf)
        window.clearTimeout(t1)
        window.clearTimeout(t2)
        window.clearTimeout(t3)
      }
    }

    if (!wasActive.current) return
    wasActive.current = false
    setProgress(100)
    const hide = window.setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 250)
    return () => window.clearTimeout(hide)
  }, [active])

  if (!visible) return null

  return (
    <div className="top-loading-bar" role="progressbar" aria-hidden="true">
      <div className="top-loading-bar-fill" style={{ width: `${progress}%` }} />
    </div>
  )
}
