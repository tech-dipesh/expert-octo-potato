from datetime import date, datetime, time
from pydantic import BaseModel

class Point(BaseModel):
    start: datetime
    forecast: float | None
    published: datetime | None
    horizon_h: float | None
    actual: float | None
    error: float | None

class Coverage(BaseModel):
    slots: int
    forecast: int
    actual: int

class DayForecast(BaseModel):
    day: date
    cutoff_at: datetime
    tz: str
    coverage: Coverage
    newest_publish: datetime | None
    oldest_publish: datetime | None
    total_forecast_mwh: float
    points: list[Point]

class Meta(BaseModel):
    first_day: date
    last_day: date
    default_cutoff: time
    tz: str
    snapshot_built: str
    actual_rows: int
    forecast_rows: int
