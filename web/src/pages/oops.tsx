import { Link, isRouteErrorResponse, useRouteError } from "react-router"

export function Oops({ missing }: { missing?: boolean }) {
  const error = useRouteError()
  const gone = missing || (isRouteErrorResponse(error) && error.status === 404)
  return (
    <div className="border border-line bg-panel p-6">
      <h1 className="text-2xl font-semibold">{gone ? "That page does not exist" : "This page failed to load"}</h1>
      <p className="mt-1">{gone ? "Check the address or go back to the forecast." : "Reload the page. If it keeps failing, go back to the forecast."}</p>
      <Link to="/" className="mt-4 inline-block rounded-md border border-ink px-3 py-1.5 text-md text-ink hover:bg-ink hover:text-white active:bg-night">Go to the forecast</Link>
    </div>
  )
}
