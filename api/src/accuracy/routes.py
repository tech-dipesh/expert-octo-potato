from datetime import time
from fastapi import APIRouter, Query
from src.accuracy.schema import Group, Summary
from src.accuracy.service import by_day, by_horizon, by_hour, summary
from src.infra.window import DEFAULT_CUTOFF

router = APIRouter(prefix="/v1/accuracy", tags=["accuracy"])

@router.get("/summary", response_model=Summary)
def get_summary(cutoff: time = DEFAULT_CUTOFF): return summary(cutoff)

@router.get("/by-hour", response_model=list[Group])
def get_by_hour(cutoff: time = DEFAULT_CUTOFF): return by_hour(cutoff)

@router.get("/by-day", response_model=list[Group])
def get_by_day(cutoff: time = DEFAULT_CUTOFF): return by_day(cutoff)

@router.get("/by-horizon", response_model=list[Group])
def get_by_horizon(size: int = Query(6, ge=1, le=24)): return by_horizon(size)
