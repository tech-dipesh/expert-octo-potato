import type { ReactNode } from "react"

export function Panel({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="border border-line bg-panel p-4 sm:p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mb-4 mt-1 max-w-prose">{note}</p>
      {children}
    </section>
  )
}
