import { useCallback, useEffect, useState } from 'react'

export function useCopyToClipboard(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false)
  const copy = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {
        // portapapeles no disponible (permisos/plataforma) - el botón simplemente no hace nada
      })
  }, [])
  return [copied, copy]
}

/** navigator.onLine en vivo: Chromium emite online/offline cuando cambia el estado de la red. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return online
}

/** Network Information API de Chromium (no está en los tipos DOM estándar de TypeScript). */
interface NetworkInformationLike extends EventTarget {
  effectiveType?: string
  downlink?: number
  rtt?: number
}

export interface ConnectionEstimate {
  effectiveType: string
  downlink: number
  rtt: number
}

function readConnection(connection: NetworkInformationLike | undefined): ConnectionEstimate | null {
  if (!connection?.effectiveType || connection.downlink === undefined || connection.rtt === undefined) return null
  return { effectiveType: connection.effectiveType, downlink: connection.downlink, rtt: connection.rtt }
}

/**
 * Estimación de calidad de enlace que calcula Chromium con el tráfico reciente. Por privacidad
 * redondea el RTT a 25 ms y topa el downlink en 10 Mbps, así que sirve de referencia, no de medición.
 */
export function useConnectionEstimate(): ConnectionEstimate | null {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  const [estimate, setEstimate] = useState(() => readConnection(connection))
  useEffect(() => {
    if (!connection) return
    const update = () => setEstimate(readConnection(connection))
    connection.addEventListener('change', update)
    return () => connection.removeEventListener('change', update)
  }, [connection])
  return estimate
}
