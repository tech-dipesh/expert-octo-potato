import { NavLink, Outlet } from "react-router"
import type { Meta } from "@/api/types"
import { useApi } from "@/api/use-api"
import { Gate } from "@/components/gate"
import { shortDay } from "@/format"

const link = ({ isActive }: { isActive: boolean }) => `border-b-2 px-1 py-4 text-md ${isActive ? "border-brand text-white" : "border-transparent text-white/70 hover:text-white"}`

export function App() {
  const meta = useApi<Meta>("/v1/meta")
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-night">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-8 px-4 sm:px-6">
          <span className="py-4 text-lg font-semibold text-white">Wind Change Prediction</span>
          <nav aria-label="Main" className="flex gap-6">
            <NavLink to="/" end className={link}>Forecast</NavLink>
            <NavLink to="/accuracy" className={link}>Accuracy</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Gate api={meta}>{(data) => <Outlet context={data} />}</Gate>
      </main>
      <footer className="border-t border-line py-4 text-sm">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          {meta.data ? `All times in ${meta.data.tz}. Data from Elexon BMRS, snapshot built ${shortDay(meta.data.snapshot_built)}.` : "Data from Elexon BMRS."}
        </div>
      </footer>
    </div>
  )
}
