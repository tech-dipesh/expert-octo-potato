export interface Figure {
  label: string
  value: string
  note?: string
}

export function Figures({ items }: { items: Figure[] }) {
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-x-6 gap-y-6">
      {items.map((f) => (
        <div key={f.label} className="border-t-2 border-brand pt-3">
          <dt className="text-sm">{f.label}</dt>
          <dd className="text-2xl font-semibold tabular-nums text-ink">{f.value}</dd>
          {f.note && <dd className="text-sm">{f.note}</dd>}
        </div>
      ))}
    </dl>
  )
}
