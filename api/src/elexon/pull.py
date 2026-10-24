import gzip
import json
import sys
import time
from datetime import UTC, date, datetime, timedelta

import httpx

from src.elexon.snapshot import FILE
from src.infra.window import DAYS, FIRST_DAY, LAST_DAY, LOOKBACK

BASE = "https://data.elexon.co.uk/bmrs/api/v1/datasets"

def ts(text: str) -> int: return int(datetime.fromisoformat(text).timestamp())

def span(first: date, last: date): return [first + timedelta(days=i) for i in range((last - first).days + 1)]

def clean_actual(rows: list[dict]) -> list[list[float]]:
    latest: dict[int, tuple[str, float]] = {}
    for r in rows:
        if r.get("fuelType", "WIND") != "WIND" or r.get("generation") is None or not r.get("startTime"): continue
        start = ts(r["startTime"])
        pub = r.get("publishTime", "")
        if start not in latest or pub > latest[start][0]: latest[start] = (pub, r["generation"])
    return sorted([s, g] for s, (_, g) in latest.items())

def clean_forecast(rows: list[dict]) -> list[list[float]]:
    seen = {(ts(r["publishTime"]), ts(r["startTime"])): r["generation"] for r in rows if r.get("generation") is not None and r.get("startTime") and r.get("publishTime")}
    return sorted([p, s, g] for (p, s), g in seen.items())

def get(client: httpx.Client, name: str, params: dict) -> list[dict]:
    for attempt in range(6):
        try: res = client.get(f"{BASE}/{name}/stream", params=params, headers={"Accept": "application/json"})
        except httpx.TransportError:
            time.sleep(2 ** attempt)
            continue
        if res.status_code in (429, 500, 502, 503, 504):
            time.sleep(2 ** attempt)
            continue
        res.raise_for_status()
        body = res.json()
        print(".", end="", flush=True)
        time.sleep(0.3)
        return body["data"] if isinstance(body, dict) else body
    sys.exit(f"\nelexon kept failing on {name} {params}")

def save():
    with httpx.Client(timeout=60) as client:
        actual_rows = [r for d in span(FIRST_DAY, LAST_DAY) for r in get(client, "FUELHH", {"settlementDateFrom": d.isoformat(), "settlementDateTo": d.isoformat(), "fuelType": "WIND"})]
        forecast_rows = [r for d in span(LOOKBACK, LAST_DAY) for r in get(client, "WINDFOR", {"publishDateTimeFrom": f"{d}T00:00:00Z", "publishDateTimeTo": f"{d + timedelta(days=1)}T00:00:00Z"})]
    actual = clean_actual(actual_rows)
    lo = ts(f"{FIRST_DAY}T00:00:00Z")
    hi = ts(f"{LAST_DAY + timedelta(days=1)}T00:00:00Z")
    forecast = [row for row in clean_forecast(forecast_rows) if lo <= row[1] < hi]
    if not actual or not forecast: sys.exit("\nno rows came back, snapshot not written")
    FILE.parent.mkdir(exist_ok=True)
    payload = {"built": datetime.now(UTC).isoformat(timespec="seconds"), "actual": actual, "forecast": forecast}
    with gzip.open(FILE, "wt") as f: json.dump(payload, f, separators=(",", ":"))
    print(f"\nactual {len(actual)}/{DAYS * 48} forecast {len(forecast)} -> {FILE.name} {FILE.stat().st_size // 1024}kb")

def main():
    try: save()
    except httpx.HTTPStatusError as err: sys.exit(f"\nelexon said {err.response.status_code}: {err.response.text[:200]}")
