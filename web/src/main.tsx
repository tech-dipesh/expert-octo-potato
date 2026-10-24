import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import "@/index.css"
import { App } from "@/App"
import { Oops } from "@/pages/oops"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        errorElement: <Oops />,
        children: [
          { index: true, lazy: () => import("@/pages/decision") },
          { path: "accuracy", lazy: () => import("@/pages/accuracy") },
          { path: "*", element: <Oops missing /> },
        ],
      },
    ],
  },
])

const root = document.getElementById("root")
if (root) createRoot(root).render(<StrictMode><RouterProvider router={router} /></StrictMode>)
