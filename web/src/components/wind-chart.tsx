import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { fmt } from "@/format"

export interface WindRow {
  time: string
  forecast: number | null
  actual: number | null
  band: [number, number] | null
}

const tick = { fill: "var(--color-muted)", fontSize: 12 }

const show = (v: unknown) => (typeof v === "number" ? `${fmt(v)} MW` : Array.isArray(v) ? `${fmt(Number(v[0]))} to ${fmt(Number(v[1]))} MW` : "none")

export function WindChart({ rows, hindsight }: { rows: WindRow[]; hindsight: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="time" tick={tick} stroke="var(--color-line)" />
        <YAxis width={56} tick={tick} tickFormatter={fmt} stroke="var(--color-line)" />
        <Tooltip formatter={show} />
        <Legend verticalAlign="top" height={32} />
        {rows.some((r) => r.band) && <Area dataKey="band" name="Safe range" stroke="none" fill="var(--color-brand-tint)" fillOpacity={1} />}
        <Line dataKey="forecast" name="Forecast" stroke="var(--color-brand)" strokeWidth={2.5} dot={false} />
        {hindsight && <Line dataKey="actual" name="Actual" stroke="var(--color-ink)" strokeWidth={2} strokeDasharray="5 4" dot={false} />}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
