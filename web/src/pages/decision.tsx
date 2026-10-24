import { useMeta } from "@/api/meta"
import type { DayForecast } from "@/api/types"
import { useApi } from "@/api/use-api"
export function Component() {
  const meta = useMeta()
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold">Day-ahead wind forecast</h1>
        <p className="mt-2 max-w-prose">Choose the delivery day and the time you buy. The page shows the newest forecast that existed at that moment and nothing published later.</p>
      </header>
      <div className="flex flex-wrap items-end gap-4">
                <label className="flex items-center gap-2 pb-2 text-md text-ink">
          <input type="checkbox" checked={hindsight === "1"} onChange={(e) => setHindsight(e.target.checked ? "1" : "0")} />
          Compare with what actually happened
        </label>
      </div>
      <Gate api={api}>{(data) => <Forecast data={data} hindsight={hindsight === "1"} />}</Gate>
    </div>
  )
}
