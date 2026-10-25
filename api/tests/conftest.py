import gzip
import json
from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from src.accuracy import service
from src.elexon import snapshot
from src.main import app


def ts(text: str) -> int: return int(datetime.fromisoformat(text).timestamp())

STARTS = [ts("2026-01-02T00:00:00Z") + i * 1800 for i in range(48)]

def clear():
    snapshot.load.cache_clear()
    service.decision_rows.cache_clear()
    service.horizon_items.cache_clear()

@pytest.fixture
def client(tmp_path, monkeypatch):
    file = tmp_path / "wind.json.gz"
    forecast = [[ts(f"2026-01-01T{hm}:00Z"), s, g] for s in STARTS[::2] for hm, g in (("08:00", 100), ("09:00", 120), ("10:00", 200))]
    with gzip.open(file, "wt") as f: json.dump({"built": "test", "actual": [[s, 150] for s in STARTS], "forecast": forecast}, f)
    monkeypatch.setattr(snapshot, "FILE", file)
    clear()
    yield TestClient(app)
    clear()

@pytest.fixture
def empty(tmp_path, monkeypatch):
    monkeypatch.setattr(snapshot, "FILE", tmp_path / "nope.json.gz")
    clear()
    yield TestClient(app)
    clear()
