import { useOutletContext } from "react-router"
import type { Meta } from "@/api/types"

export const useMeta = () => useOutletContext<Meta>()
