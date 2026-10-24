import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { fmt } from "@/format"

export interface BarSeries {
  key: string
  name: string
  fill: string
}

const tick = { fill: "var(--color-muted)", fontSize: 12 }

export function Bars({ data, bars, split }: { data: Record<string, string | number>[]; bars: BarSeries[]; split?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="label" tick={tick} stroke="var(--color-line)" />
        <YAxis width={56} tick={tick} tickFormatter={fmt} stroke="var(--color-line)" />
        <Tooltip formatter={(v) => (typeof v === "number" ? `${fmt(v)} MW` : "none")} cursor={{ fill: "var(--color-brand-tint)" }} />
        {bars.length > 1 && <Legend position="top" height={32} />}
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.fill}>
            {split && data.map((row) => <Cell key={row.label} fill={Number(row[b.key]) > 0 ? "var(--color-ink)" : "var(--color-brand)"} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
