import { Link } from "react-router"
import { useMeta } from "@/api/meta"
import type { Group, Summary } from "@/api/types"
import { useApi } from "@/api/use-api"
import { Field, inputClass } from "@/components/field"
import { Figures } from "@/components/figures"
import { Empty, Gate } from "@/components/gate"
import { Panel } from "@/components/panel"
import { Bars } from "@/components/bars"
import { fmt, longDay, maybe, maybeSigned, shortDay } from "@/format"
import { useParam } from "@/use-param"

function Headline({ data }: { data: Summary }) {
  const { stats } = data
  if (!stats.n) return <Empty title="Nothing to score yet">No half-hour had both a forecast and an actual at this time. Try a later decision time.</Empty>
  const margin = stats.p90 !== null && stats.p90 > 0 ? `In 9 of 10 half-hours the forecast was no more than ${fmt(stats.p90)} MW above the wind that arrived.` : "In 9 of 10 half-hours the forecast was at or below the wind that arrived."
  const lean = stats.bias !== null && stats.bias > 0 ? "high" : "low"
  return (
    <>
      <p className="max-w-3xl text-2xl text-ink">{margin}</p>
      <p className="max-w-prose">On average it missed by {maybe(stats.mae)} MW ({stats.mae_pct}% of average wind) and leaned {lean} by {fmt(Math.abs(stats.bias ?? 0))} MW.</p>
      <Figures items={[
        { label: "Average miss (MAE)", value: `${maybe(stats.mae)} MW`, note: `${stats.mae_pct}% of average wind` },
        { label: "Large-miss measure (RMSE)", value: `${maybe(stats.rmse)} MW`, note: "counts big misses more" },
        { label: "Lean (bias)", value: `${maybeSigned(stats.bias)} MW`, note: "plus means forecast too high" },
        { label: "Over-forecast margin (P90)", value: `${maybeSigned(stats.p90)} MW`, note: "9 in 10 half-hours stay below" },
        { label: "Half-hours scored", value: `${stats.n} of ${data.slots}`, note: `${data.coverage_pct}% coverage` },
      ]} />
    </>
  )
}

export function Component() {
  const meta = useMeta()
  const [cutoff, setCutoff] = useParam("cutoff", meta.default_cutoff.slice(0, 5))
  const summary = useApi<Summary>(`/v1/accuracy/summary?cutoff=${cutoff}`)
  const horizon = useApi<Group[]>("/v1/accuracy/by-horizon")
  const hour = useApi<Group[]>(`/v1/accuracy/by-hour?cutoff=${cutoff}`)
  const day = useApi<Group[]>(`/v1/accuracy/by-day?cutoff=${cutoff}`)
  const level = useApi<Group[]>(`/v1/accuracy/by-level?cutoff=${cutoff}`)
  const worst = useApi<Group[]>(`/v1/accuracy/worst?cutoff=${cutoff}&limit=5`)
  const miss = [{ key: "mae", name: "Average miss", fill: "var(--color-brand)" }, { key: "big", name: "Large miss (9 in 10 stay below)", fill: "var(--color-ink)" }]
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold">How wrong the forecast has been</h1>
        <p className="mt-2 max-w-prose">Every half-hour of {meta.first_day} to {meta.last_day}, scored against the wind that really arrived. Use these numbers as the safety margin when you buy.</p>
      </header>
      <Field label="Decide at (day before, UK time)">
        <input type="time" className={`${inputClass} w-fit`} value={cutoff} onChange={(e) => e.target.value && setCutoff(e.target.value)} />
      </Field>
      <Gate api={summary}>{(data) => <Headline data={data} />}</Gate>
      <Panel title="Forecasts get better as delivery gets closer" note="Error by how many hours before the half-hour the forecast was published. This uses every forecast, not only the one at your decision time.">
        <Gate api={horizon}>{(groups) => <Bars data={groups.map((g) => ({ label: g.label, mae: g.stats.mae ?? 0, big: g.stats.abs_p90 ?? 0 }))} bars={miss} />}</Gate>
      </Panel>
      <Panel title="Which half-hours are hardest" note="Average miss by time of day at your decision time. Taller bars need a bigger buffer.">
        <Gate api={hour}>{(groups) => <Bars data={groups.map((g) => ({ label: g.label, mae: g.stats.mae ?? 0 }))} bars={[miss[0]]} />}</Gate>
      </Panel>
      <Panel title="Which days were over-promised" note="Average lean per delivery day. Dark bars above zero mean the forecast promised more wind than arrived, which is the costly direction.">
        <Gate api={day}>{(groups) => <Bars split data={groups.map((g) => ({ label: shortDay(g.label), bias: g.stats.bias ?? 0 }))} bars={[{ key: "bias", name: "Lean", fill: "var(--color-brand)" }]} />}</Gate>
      </Panel>
      <Panel title="Accuracy by wind level" note="Average miss grouped by how much wind actually blew, in MW. Shows whether the forecast struggles more in light or strong wind.">
        <Gate api={level}>{(groups) => <Bars data={groups.map((g) => ({ label: g.label, mae: g.stats.mae ?? 0 }))} bars={[miss[0]]} />}</Gate>
      </Panel>
      <Panel title="The five hardest days" note="Days with the largest average miss at your decision time. Open one to see the forecast next to what happened.">
        <Gate api={worst}>{(groups) => (
          <ol className="flex flex-col divide-y divide-line">
            {groups.map((g) => (
              <li key={g.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                <Link to={`/?day=${g.label}&cutoff=${cutoff}&hindsight=1`} className="text-lg font-medium text-ink underline decoration-brand underline-offset-4 hover:bg-brand-tint">{longDay(g.label)}</Link>
                <span className="tabular-nums">{(g.stats.bias ?? 0) > 0 ? `Promised ${fmt(g.stats.bias ?? 0)} MW too much wind` : `Undersold wind by ${fmt(Math.abs(g.stats.bias ?? 0))} MW`} on average, average miss {maybe(g.stats.mae)} MW</span>
              </li>
            ))}
          </ol>
        )}</Gate>
      </Panel>
    </div>
  )
}
