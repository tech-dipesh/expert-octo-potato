def first(client, cutoff):
    res = client.get("/v1/forecast", params={"day": "2026-01-02", "cutoff": cutoff})
    assert res.status_code == 200
    return res.json()

def test_cutoff_is_inclusive(client):
    body = first(client, "09:00")
    p = body["points"][0]
    assert len(body["points"]) == 48
    assert p["forecast"] == 120 and p["error"] == -30 and p["horizon_h"] == 15
    assert p["published"] == "2026-01-01T09:00:00Z"

def test_just_before_picks_older(client): assert first(client, "08:59")["points"][0]["forecast"] == 100

def test_later_cutoff_picks_newer(client): assert first(client, "10:30")["points"][0]["forecast"] == 200

def test_nothing_published_yet(client):
    body = first(client, "07:00")
    assert body["points"][0]["forecast"] is None
    assert body["coverage"]["forecast"] == 0 and body["newest_publish"] is None
