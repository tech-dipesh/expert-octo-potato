import { useEffect, useState } from "react"
import { getJson } from "@/api/client"

export interface Api<T> {
  data?: T
  error?: string
  reload: () => void
}

interface Result<T> {
  key: string
  data?: T
  error?: string
}

export function useApi<T>(path: string): Api<T> {
  const [tries, setTries] = useState(0)
  const [result, setResult] = useState<Result<T>>()
  const key = `${path}#${tries}`
  useEffect(() => {
    const ctrl = new AbortController()
    const run = async () => {
      try {
        setResult({ key, data: await getJson<T>(path, ctrl.signal) })
      } catch (err) {
        if (!ctrl.signal.aborted) setResult({ key, error: err instanceof Error ? err.message : "Something went wrong." })
      }
    }
    run()
    return () => ctrl.abort()
  }, [key, path])
  const current = result?.key === key ? result : undefined
  return { data: current?.data, error: current?.error, reload: () => setTries((t) => t + 1) }
}
