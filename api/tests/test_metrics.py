from src.accuracy.service import percentile, stats
from src.elexon.pull import clean_actual, clean_forecast

def test_percentile():
    assert percentile([1, 2, 3, 4, 5], 0.5) == 3
    assert percentile([0, 10], 0.9) == 9

def test_stats():
    s = stats([(110, 100), (90, 100)])
    assert s.n == 2 and s.mae == 10 and s.rmse == 10 and s.bias == 0
    assert s.p90 == 8 and s.abs_p90 == 10

def test_stats_empty():
    s = stats([])
    assert s.n == 0 and s.mae is None

def test_clean_actual_keeps_latest_publish():
    rows = [{"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-02T00:30:00Z", "generation": 1, "fuelType": "WIND"}, {"startTime": "2026-01-02T00:00:00Z", "publishTime": "2026-01-02T01:00:00Z", "generation": 2, "fuelType": "WIND"}, {"startTime": "2026-01-02T00:30:00Z", "generation": None}, {"startTime": "2026-01-02T00:00:00Z", "generation": 9, "fuelType": "NUCLEAR"}]
    assert clean_actual(rows) == [[1767312000, 2]]

def test_clean_forecast_dedupes_and_skips_nulls():
    row = {"publishTime": "2026-01-01T09:00:00Z", "startTime": "2026-01-02T00:00:00Z", "generation": 5}
    assert clean_forecast([row, row, {**row, "generation": None}]) == [[1767258000, 1767312000, 5]]
