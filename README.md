# wind desk
A buyer picks tomorrow's delivery day and the minute they will decide. The app shows the newest wind forecast that existed at that minute, then says in megawatts how wrong that forecast has been all January.

![data flow](docs/flow.svg)
The rule behind everything: for day D you decide on D-1, and each half-hour uses the newest forecast published at or before that time. Nothing later gets in. Elexon's forecast is hourly, so each hour is held over both half-hours.

I used a snapshot file instead of a database because the month is fixed, and plain Python maths instead of pandas because it is only about 100k rows. FastAPI with uv on the back, React with Vite, Tailwind v4 and Recharts on the front.

On top of the brief: a decision-time slider, a safe range on the chart, error by hours ahead, time of day, day and wind level, the five hardest days, and CSV export.

## files

```
api/    FastAPI app (uv). src/forecasts, src/accuracy, src/elexon, src/infra
        data/ snapshot, tests/, index.py (Vercel entry), vercel.json
web/    React + Vite + Tailwind v4. src/pages, src/components, src/api
docs/   architecture, decisions, deployment, analysis, flow.svg
compose.yml  local Docker for both
```

## start

```bash
cd api && uv sync && uv run pull && uv run dev
cd web && cp .env.example .env && pnpm install && pnpm dev
```

`uv run test` runs the api tests. `docker compose up --build` runs both in Docker.

## links

- Web app: `https://reint-prediction.vercel.app`
- API: `https://reint-wind-api.vercel.app/docs`
