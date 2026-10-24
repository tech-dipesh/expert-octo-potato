import type { ReactNode } from "react"
import type { Api } from "@/api/use-api"

export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-line bg-panel p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 max-w-prose">{children}</p>
    </div>
  )
}

export function Gate<T>({ api, children }: { api: Api<T>; children: (data: T) => ReactNode }) {
  if (api.error) return (
    <div role="alert" className="border-l-4 border-ink bg-panel p-4">
      <p className="text-ink">{api.error}</p>
      <button onClick={api.reload} className="cursor-pointer mt-3 rounded-md border border-ink px-3 py-1.5 text-md text-ink hover:bg-ink hover:text-white active:bg-night">Try again</button>
    </div>
  )
  if (api.data === undefined) return <p role="status" aria-busy="true" className="py-10">Loading</p>
  return <>{children(api.data)}</>
}
