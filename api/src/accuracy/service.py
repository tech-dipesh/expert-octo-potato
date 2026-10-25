from collections import defaultdict
from collections.abc import Callable, Iterable
from datetime import UTC, date, datetime, time, timedelta
from functools import lru_cache
from math import sqrt

from src.accuracy.schema import Group, Margin, Stats, Summary
from src.elexon.snapshot import load
from src.forecasts.service import STEP, at, cutoff_at, day_starts, latest_before, ts
from src.infra.window import DAYS, FIRST_DAY


def percentile(sorted_vals: list[float], q: float) -> float:
    k = (len(sorted_vals) - 1) * q
    lo = int(k)
    hi = min(lo + 1, len(sorted_vals) - 1)
    return sorted_vals[lo] + (sorted_vals[hi] - sorted_vals[lo]) * (k - lo)

def stats(pairs: list[tuple[float, float]]) -> Stats:
    n = len(pairs)
    if not n: return Stats(n=0)
    errs = sorted(f - a for f, a in pairs)
    abs_errs = sorted(abs(e) for e in errs)
    mean_actual = sum(a for _, a in pairs) / n
    mae = sum(abs_errs) / n
    vals = {"mae": mae, "rmse": sqrt(sum(e * e for e in errs) / n), "bias": sum(errs) / n, "p10": percentile(errs, 0.1), "p50": percentile(errs, 0.5), "p90": percentile(errs, 0.9), "abs_p90": percentile(abs_errs, 0.9), "mean_actual": mean_actual}
    return Stats(n=n, **{k: round(v, 1) for k, v in vals.items()}, mae_pct=round(mae / mean_actual * 100, 1) if mean_actual else None)

def grouped[K: (int, str)](items: Iterable[tuple[K, float, float]], name: Callable[[K], str] = str) -> list[Group]:
    buckets: dict[K, list[tuple[float, float]]] = defaultdict(list)
    for key, f, a in items: buckets[key].append((f, a))
    return [Group(label=name(k), stats=stats(v)) for k, v in sorted(buckets.items())]

@lru_cache(maxsize=128)
def decision_rows(cutoff: time) -> tuple[tuple[int, float, float], ...]:
    snap = load()
    days = [FIRST_DAY + timedelta(days=i) for i in range(DAYS)]
    picks = [(s, latest_before(snap, s, ts(cutoff_at(d, cutoff))), snap.actual.get(s)) for d in days for s in day_starts(d)]
    return tuple((s, pick[1], a) for s, pick, a in picks if pick and a is not None)

@lru_cache(maxsize=8)
def horizon_items(size: int) -> tuple[tuple[int, float, float], ...]:
    snap = load()
    return tuple((int(h // size) * size, g, snap.actual[t]) for s, (pubs, gens) in snap.forecasts.items() for t in (s, s + STEP) if t in snap.actual for p, g in zip(pubs, gens) if (h := (t - p) / 3600) >= 0)

def summary(cutoff: time) -> Summary:
    rows = decision_rows(cutoff)
    slots = DAYS * 48
    return Summary(cutoff=cutoff, slots=slots, coverage_pct=round(len(rows) / slots * 100, 1), stats=stats([(f, a) for _, f, a in rows]))

def slot_name(slot: int) -> str: return f"{slot // 2:02d}:{slot % 2 * 30:02d}"

def by_hour(cutoff: time) -> list[Group]: return grouped([((s % 86400) // STEP, f, a) for s, f, a in decision_rows(cutoff)], slot_name)

def by_day(cutoff: time) -> list[Group]: return grouped((at(s).date().isoformat(), f, a) for s, f, a in decision_rows(cutoff))

def by_horizon(size: int) -> list[Group]: return grouped(horizon_items(size), lambda lo: f"{lo}-{lo + size}h")

MIN_SAMPLES = 144

def margin(day: date, cutoff: time) -> Margin:
    limit = ts(datetime.combine(day, time(), UTC)) - 86400
    rows = [r for r in decision_rows(cutoff) if r[0] < limit]
    errs = sorted(f - a for _, f, a in rows)
    value = round(max(percentile(errs, 0.9), 0), 1) if len(errs) >= MIN_SAMPLES else None
    return Margin(day=day, cutoff=cutoff, margin_mw=value, days_used=len({s // 86400 for s, _, _ in rows}), samples=len(errs))

def worst(cutoff: time, limit: int) -> list[Group]: return sorted(by_day(cutoff), key=lambda g: g.stats.mae or 0, reverse=True)[:limit]

def by_level(cutoff: time, size: int) -> list[Group]: return grouped([(int(a // size) * size, f, a) for _, f, a in decision_rows(cutoff)], lambda lo: f"{lo:,}-{lo + size:,}")
