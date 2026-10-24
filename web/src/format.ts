const utc = { timeZone: "UTC" } as const

export const fmt = (n: number) => Math.round(n).toLocaleString("en-GB")
export const signed = (n: number) => `${n > 0 ? "+" : ""}${fmt(n)}`
export const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { ...utc, hour: "2-digit", minute: "2-digit" })
export const shortDay = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { ...utc, day: "numeric", month: "short" })
export const longDay = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { ...utc, weekday: "long", day: "numeric", month: "long" })
export const stamp = (iso: string) => `${shortDay(iso)} ${hhmm(iso)}`
export const maybe = (n: number | null) => (n === null ? "none" : fmt(n))
export const maybeSigned = (n: number | null) => (n === null ? "none" : signed(n))
