import { useMeta } from "@/api/meta"
import type { DayForecast } from "@/api/types"
import { useApi } from "@/api/use-api"
import { Field, inputClass } from "@/components/field"
import { Figures } from "@/components/figures"
import { Empty, Gate } from "@/components/gate"
import { Panel } from "@/components/panel"
import { WindChart } from "@/components/wind-chart"
import { fmt, hhmm, longDay, maybe, maybeSigned, stamp } from "@/format"
import { useParam } from "@/use-param"

function Forecast({ data, hindsight }: { data: DayForecast; hindsight: boolean }) {
  const { coverage, points } = data
  if (!coverage.forecast) return <Empty title="No forecast yet at this time">Nothing had been published by {stamp(data.cutoff_at)}. Choose a later time to see the first forecast for {longDay(data.day)}.</Empty>
  const known = points.filter((p) => p.forecast !== null)
  const low = [...known].sort((a, b) => (a.forecast ?? 0) - (b.forecast ?? 0))[0]
  const rows = points.map((p) => ({ time: hhmm(p.start), forecast: p.forecast, actual: hindsight ? p.actual : null }))
  return (
    <>
      <Figures items={[
        { label: "Wind energy forecast for the day", value: `${fmt(data.total_forecast_mwh)} MWh` },
        { label: "Lowest forecast wind", value: `${fmt(low?.forecast ?? 0)} MW`, note: `at ${hhmm(low?.start ?? data.cutoff_at)}` },
        { label: "Newest forecast used", value: data.newest_publish ? stamp(data.newest_publish) : "none", note: data.oldest_publish ? `oldest ${stamp(data.oldest_publish)}` : undefined },
        { label: "Half-hours with a forecast", value: `${coverage.forecast} of ${coverage.slots}` },
      ]} />
      <Panel title="Forecast wind generation" note={`Megawatts averaged over each half-hour, in ${data.tz}. Each half-hour uses the newest forecast available at ${stamp(data.cutoff_at)}.`}>
        <WindChart rows={rows} hindsight={hindsight} />
      </Panel>
      <details className="border border-line bg-panel">
        <summary className="cursor-pointer px-4 py-3 text-ink hover:bg-brand-tint">Half-hour detail</summary>
        <div className="overflow-x-auto">
          <table className="w-full min-w-lg text-left text-md tabular-nums">
            <thead>
              <tr className="border-b border-line text-sm">
                <th scope="col" className="px-4 py-2 font-medium">Time</th>
                <th scope="col" className="px-4 py-2 font-medium">Forecast (MW)</th>
                <th scope="col" className="px-4 py-2 font-medium">Published</th>
                <th scope="col" className="px-4 py-2 font-medium">Hours ahead</th>
                {hindsight && <th scope="col" className="px-4 py-2 font-medium">Actual (MW)</th>}
                {hindsight && <th scope="col" className="px-4 py-2 font-medium">Error (MW)</th>}
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.start} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">{hhmm(p.start)}</td>
                  <td className="px-4 py-2 text-ink">{maybe(p.forecast)}</td>
                  <td className="px-4 py-2">{p.published ? stamp(p.published) : "none"}</td>
                  <td className="px-4 py-2">{p.horizon_h ?? "none"}</td>
                  {hindsight && <td className="px-4 py-2">{maybe(p.actual)}</td>}
                  {hindsight && <td className="px-4 py-2">{maybeSigned(p.error)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  )
}

export function Component() {
  const meta = useMeta()
  const [day, setDay] = useParam("day", meta.first_day)
  const [cutoff, setCutoff] = useParam("cutoff", meta.default_cutoff.slice(0, 5))
  const [hindsight, setHindsight] = useParam("hindsight", "0")
  const api = useApi<DayForecast>(`/v1/forecast?day=${day}&cutoff=${cutoff}`)
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold">Day-ahead wind forecast</h1>
        <p className="mt-2 max-w-prose">Choose the delivery day and the time you buy. The page shows the newest forecast that existed at that moment and nothing published later.</p>
      </header>
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Delivery day">
          <input type="date" className={inputClass} value={day} min={meta.first_day} max={meta.last_day} onChange={(e) => e.target.value && setDay(e.target.value)} />
        </Field>
        <Field label="Decide at (day before, UK time)">
          <input type="time" className={inputClass} value={cutoff} onChange={(e) => e.target.value && setCutoff(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 pb-2 text-md text-ink">
          <input type="checkbox" checked={hindsight === "1"} onChange={(e) => setHindsight(e.target.checked ? "1" : "0")} />
          Compare with what actually happened
        </label>
      </div>
      <Gate api={api}>{(data) => <Forecast data={data} hindsight={hindsight === "1"} />}</Gate>
    </div>
  )
}
