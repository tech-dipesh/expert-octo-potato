export interface Meta {
  first_day: string
  last_day: string
  default_cutoff: string
  tz: string
  snapshot_built: string
  actual_rows: number
  forecast_rows: number
}

export interface Point {
  start: string
  forecast: number | null
  published: string | null
  horizon_h: number | null
  actual: number | null
  error: number | null
}

export interface DayForecast {
  day: string
  cutoff_at: string
  tz: string
  coverage: { slots: number; forecast: number; actual: number }
  newest_publish: string | null
  oldest_publish: string | null
  total_forecast_mwh: number
  points: Point[]
}

export interface Stats {
  n: number
  mae: number | null
  rmse: number | null
  bias: number | null
  p10: number | null
  p50: number | null
  p90: number | null
  abs_p90: number | null
  mean_actual: number | null
  mae_pct: number | null
}

export interface Group {
  label: string
  stats: Stats
}

export interface Summary {
  cutoff: string
  slots: number
  coverage_pct: number
  stats: Stats
}

export interface Margin {
  day: string
  cutoff: string
  margin_mw: number | null
  days_used: number
  samples: number
}
