type Cell = string | number | null

export const toCsv = (head: string[], rows: Cell[][]) => [head, ...rows].map((row) => row.map((c) => c ?? "").join(",")).join("\n")

export function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
