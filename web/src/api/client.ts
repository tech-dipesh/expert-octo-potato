const base = import.meta.env.VITE_API ?? "http://localhost:8000"

async function reason(res: Response) {
  try {
    const body: { error?: string } = await res.json()
    return body.error ?? res.statusText
  } catch {
    return res.statusText
  }
}

export async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${base}${path}`, { signal })
  } catch (err) {
    if (signal.aborted) throw err
    throw new Error(`Cannot reach the API at ${base}. Check that it is running.`, { cause: err })
  }
  if (!res.ok) throw new Error(await reason(res))
  return res.json()
}
