import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { fmt } from "@/format"

export interface WindRow {
  time: string
  forecast: number | null
  actual: number | null
}

const tick = { fill: "var(--color-muted)", fontSize: 12 }

export function WindChart({ rows, hindsight }: { rows: WindRow[]; hindsight: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="time" tick={tick} stroke="var(--color-line)" />
        <YAxis width={56} tick={tick} tickFormatter={fmt} stroke="var(--color-line)" />
        <Tooltip formatter={(v) => (typeof v === "number" ? `${fmt(v)} MW` : "none")} />
        <Legend verticalAlign="top" height={32} />
        <Line dataKey="forecast" name="Forecast" stroke="var(--color-brand)" strokeWidth={2.5} dot={false} />
        {hindsight && <Line dataKey="actual" name="Actual" stroke="var(--color-ink)" strokeWidth={2} strokeDasharray="5 4" dot={false} />}
      </LineChart>
    </ResponsiveContainer>
  )
}
