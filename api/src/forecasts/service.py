from bisect import bisect_right
from datetime import UTC, date, datetime, time, timedelta
from src.elexon.snapshot import Snapshot
from src.forecasts.schema import Coverage, DayForecast, Point

STEP = 1800
TZ = "UK time (GMT in January)"

def ts(moment: datetime) -> int: return int(moment.timestamp())

def at(seconds: int) -> datetime: return datetime.fromtimestamp(seconds, UTC)

def day_starts(day: date) -> list[int]:
    base = ts(datetime.combine(day, time(), UTC))
    return [base + i * STEP for i in range(48)]

def cutoff_at(day: date, cutoff: time) -> datetime: return datetime.combine(day - timedelta(days=1), cutoff, UTC)

def latest_before(snap: Snapshot, start: int, limit: int) -> tuple[int, float] | None:
    pubs, gens = snap.forecasts.get(start, ([], []))
    i = bisect_right(pubs, limit)
    return (pubs[i - 1], gens[i - 1]) if i else None

def point(snap: Snapshot, start: int, limit: int) -> Point:
    pick = latest_before(snap, start, limit)
    pub, fc = pick if pick else (None, None)
    actual = snap.actual.get(start)
    return Point(start=at(start), forecast=fc, published=at(pub) if pub is not None else None, horizon_h=round((start - pub) / 3600, 1) if pub is not None else None, actual=actual, error=round(fc - actual, 1) if fc is not None and actual is not None else None)

def day_forecast(snap: Snapshot, day: date, cutoff: time) -> DayForecast:
    when = cutoff_at(day, cutoff)
    points = [point(snap, s, ts(when)) for s in day_starts(day)]
    made = [p.published for p in points if p.published]
    values = [p.forecast for p in points if p.forecast is not None]
    coverage = Coverage(slots=len(points), forecast=len(values), actual=sum(p.actual is not None for p in points))
    return DayForecast(day=day, cutoff_at=when, tz=TZ, coverage=coverage, newest_publish=max(made, default=None), oldest_publish=min(made, default=None), total_forecast_mwh=round(sum(values) * 0.5, 1), points=points)
