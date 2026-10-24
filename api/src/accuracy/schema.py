from datetime import date, time

from pydantic import BaseModel


class Stats(BaseModel):
    n: int
    mae: float | None = None
    rmse: float | None = None
    bias: float | None = None
    p10: float | None = None
    p50: float | None = None
    p90: float | None = None
    abs_p90: float | None = None
    mean_actual: float | None = None
    mae_pct: float | None = None

class Group(BaseModel):
    label: str
    stats: Stats

class Summary(BaseModel):
    cutoff: time
    slots: int
    coverage_pct: float
    stats: Stats

class Margin(BaseModel):
    day: date
    cutoff: time
    margin_mw: float | None
    days_used: int
    samples: int
