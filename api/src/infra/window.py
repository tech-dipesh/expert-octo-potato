from datetime import date, time
from src.infra.errors import AppError

FIRST_DAY = date(2026, 1, 2)
LAST_DAY = date(2026, 2, 1)
LOOKBACK = date(2025, 12, 30)
DEFAULT_CUTOFF = time(9, 0)
DAYS = (LAST_DAY - FIRST_DAY).days + 1

def check_day(day: date):
    if not FIRST_DAY <= day <= LAST_DAY: raise AppError(404, f"day must be between {FIRST_DAY} and {LAST_DAY}")
