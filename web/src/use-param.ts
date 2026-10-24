import { useSearchParams } from "react-router"

export function useParam(key: string, fallback: string) {
  const [params, setParams] = useSearchParams()
  const set = (value: string) => setParams((prev) => {
    const next = new URLSearchParams(prev)
    next.set(key, value)
    return next
  }, { replace: true })
  return [params.get(key) ?? fallback, set] as const
}
