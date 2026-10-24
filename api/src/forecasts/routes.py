from datetime import date, time
from fastapi import APIRouter
from src.elexon.snapshot import load
from src.forecasts.schema import DayForecast, Meta
from src.forecasts.service import TZ, day_forecast
from src.infra.window import DEFAULT_CUTOFF, FIRST_DAY, LAST_DAY, check_day

router = APIRouter(prefix="/v1", tags=["forecast"])

@router.get("/meta", response_model=Meta)
def get_meta():
    snap = load()
    return Meta(first_day=FIRST_DAY, last_day=LAST_DAY, default_cutoff=DEFAULT_CUTOFF, tz=TZ, snapshot_built=snap.built, actual_rows=len(snap.actual), forecast_rows=sum(len(pubs) for pubs, _ in snap.forecasts.values()))

@router.get("/forecast", response_model=DayForecast)
def get_forecast(day: date, cutoff: time = DEFAULT_CUTOFF):
    check_day(day)
    return day_forecast(load(), day, cutoff)
