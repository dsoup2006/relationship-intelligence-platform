import { useEffect, useState } from 'react'
import {
  checkApiHealth,
  type ApiHealthResponse,
} from '../services/api'

export type ApiStatus =
  | 'checking'
  | 'connected'
  | 'disconnected'

export function useApiHealth() {
  const [status, setStatus] =
    useState<ApiStatus>('checking')

  const [health, setHealth] =
    useState<ApiHealthResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const result = await checkApiHealth()

        if (!cancelled) {
          setHealth(result)
          setStatus('connected')
        }
      } catch {
        if (!cancelled) {
          setHealth(null)
          setStatus('disconnected')
        }
      }
    }

    void check()

    const interval = window.setInterval(() => {
      void check()
    }, 15000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  return {
    status,
    health,
  }
}
