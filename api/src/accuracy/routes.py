from datetime import date, time

from fastapi import APIRouter, Query

from src.accuracy.schema import Group, Margin, Summary
from src.accuracy.service import (
    by_day,
    by_horizon,
    by_hour,
    by_level,
    margin,
    summary,
    worst,
)
from src.infra.window import DEFAULT_CUTOFF, check_day

router = APIRouter(prefix="/v1/accuracy", tags=["accuracy"])

@router.get("/summary", response_model=Summary)
def get_summary(cutoff: time = DEFAULT_CUTOFF): return summary(cutoff)

@router.get("/by-hour", response_model=list[Group])
def get_by_hour(cutoff: time = DEFAULT_CUTOFF): return by_hour(cutoff)

@router.get("/by-day", response_model=list[Group])
def get_by_day(cutoff: time = DEFAULT_CUTOFF): return by_day(cutoff)

@router.get("/by-horizon", response_model=list[Group])
def get_by_horizon(size: int = Query(6, ge=1, le=24)): return by_horizon(size)

@router.get("/by-level", response_model=list[Group])
def get_by_level(cutoff: time = DEFAULT_CUTOFF, size: int = Query(3000, ge=500, le=10000)): return by_level(cutoff, size)

@router.get("/worst", response_model=list[Group])
def get_worst(cutoff: time = DEFAULT_CUTOFF, limit: int = Query(5, ge=1, le=31)): return worst(cutoff, limit)

@router.get("/margin", response_model=Margin)
def get_margin(day: date, cutoff: time = DEFAULT_CUTOFF):
    check_day(day)
    return margin(day, cutoff)
