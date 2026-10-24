def test_health(client): assert client.get("/health").json()["ok"] is True

def test_day_outside_window(client):
    res = client.get("/v1/forecast", params={"day": "2026-02-02"})
    assert res.status_code == 404 and "between" in res.json()["error"]

def test_bad_cutoff(client):
    res = client.get("/v1/forecast", params={"day": "2026-01-02", "cutoff": "25:99"})
    assert res.status_code == 422 and res.json()["fields"][0]["field"] == "cutoff"

def test_missing_snapshot(empty):
    res = empty.get("/v1/meta")
    assert res.status_code == 503 and "uv run pull" in res.json()["error"]

def test_unknown_route(client):
    res = client.get("/nope")
    assert res.status_code == 404 and "error" in res.json()

def test_summary(client):
    body = client.get("/v1/accuracy/summary").json()
    assert body["stats"]["n"] == 48 and body["stats"]["bias"] == -30 and body["stats"]["mae"] == 30
    assert body["coverage_pct"] == 3.2

def test_by_hour_and_day(client):
    assert len(client.get("/v1/accuracy/by-hour").json()) == 48
    days = client.get("/v1/accuracy/by-day").json()
    assert [d["label"] for d in days] == ["2026-01-02"]

def test_by_horizon(client):
    groups = client.get("/v1/accuracy/by-horizon", params={"size": 24}).json()
    assert [g["label"] for g in groups] == ["0-24h", "24-48h"]
    assert [g["stats"]["n"] for g in groups] == [54, 90]

def test_horizon_size_limit(client): assert client.get("/v1/accuracy/by-horizon", params={"size": 99}).status_code == 422
