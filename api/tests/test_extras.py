import gzip
import json

import pytest
from fastapi.testclient import TestClient

from src.elexon import snapshot
from src.main import app
from tests.conftest import clear, ts

DAYS = range(2, 8)

@pytest.fixture
def history(tmp_path, monkeypatch):
    file = tmp_path / "wind.json.gz"
    starts = {d: [ts(f"2026-01-{d:02d}T00:00:00Z") + i * 1800 for i in range(48)] for d in DAYS}
    miss = lambda d: 500 if d == 3 else 100
    forecast = [[ts(f"2026-01-{d - 1:02d}T08:00:00Z"), s, 1000 + miss(d)] for d in DAYS for s in starts[d][::2]]
    actual = [[s, 1000] for d in DAYS for s in starts[d]]
    with gzip.open(file, "wt") as f: json.dump({"built": "test", "actual": actual, "forecast": forecast}, f)
    monkeypatch.setattr(snapshot, "FILE", file)
    clear()
    yield TestClient(app)
    clear()

def test_margin_uses_only_older_days(history):
    body = history.get("/v1/accuracy/margin", params={"day": "2026-01-07"}).json()
    assert body["days_used"] == 4 and body["samples"] == 192
    assert body["margin_mw"] == 500

def test_margin_needs_history(history):
    body = history.get("/v1/accuracy/margin", params={"day": "2026-01-04"}).json()
    assert body["margin_mw"] is None and body["days_used"] == 1

def test_margin_outside_window(history): assert history.get("/v1/accuracy/margin", params={"day": "2026-03-01"}).status_code == 404

def test_worst_sorted_and_limited(history):
    groups = history.get("/v1/accuracy/worst", params={"limit": 2}).json()
    assert len(groups) == 2 and groups[0]["label"] == "2026-01-03"
    assert groups[0]["stats"]["mae"] == 500

def test_worst_limit_validated(history): assert history.get("/v1/accuracy/worst", params={"limit": 0}).status_code == 422

def test_by_level(history):
    groups = history.get("/v1/accuracy/by-level").json()
    assert [g["label"] for g in groups] == ["0-3,000"]
    assert groups[0]["stats"]["n"] == 288
