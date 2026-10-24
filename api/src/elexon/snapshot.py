import gzip
import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from src.infra.errors import AppError

FILE = Path(__file__).resolve().parents[2] / "data" / "wind.json.gz"

@dataclass(frozen=True)
class Snapshot:
    built: str
    actual: dict[int, float]
    forecasts: dict[int, tuple[list[int], list[float]]]

@lru_cache
def load() -> Snapshot:
    try:
        with gzip.open(FILE, "rt") as f: raw = json.load(f)
        forecasts: dict[int, tuple[list[int], list[float]]] = {}
        for pub, start, gen in sorted(raw["forecast"]):
            pubs, gens = forecasts.setdefault(start, ([], []))
            pubs.append(pub)
            gens.append(gen)
        return Snapshot(built=raw["built"], actual=dict(raw["actual"]), forecasts=forecasts)
    except FileNotFoundError: raise AppError(503, "snapshot missing, run: uv run pull")
    except (OSError, ValueError, KeyError): raise AppError(503, "snapshot unreadable, run: uv run pull")
