import type { ReactNode } from "react"

export const inputClass = "rounded-md border border-line bg-panel px-3 py-2 text-md text-ink hover:border-brand"

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink">
      {label}
      {children}
    </label>
  )
}
