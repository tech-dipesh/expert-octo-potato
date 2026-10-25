# how it fits together

Data goes one way. `uv run pull` asks Elexon for January wind actuals and wind forecasts, drops duplicates and empty rows, and writes one gzip file, `api/data/wind.json.gz`. The api reads that file once at startup. The web app only ever talks to the api.

For delivery day D the buyer decides on D-1 at some time, say 09:00. For every half-hour of D I take the newest forecast published at or before that time, using bisect on the sorted publish times (`api/src/forecasts/service.py`). 

Elexon's forecast is hourly and the actuals are half-hourly, so each hourly forecast is held over both half-hours of that hour.

The margin on the forecast page is the P90 of how far the forecast was too high, taken only from days up to D-2, because yesterday's actuals are not finished at a morning decision (`api/src/accuracy/service.py`).

Where things are: forecasts and accuracy each have routes, service and schema files under `api/src`. Fetching and the snapshot are in `api/src/elexon`. The January window and the error shape are in `api/src/infra`. On the web side every request goes through `useApi` and `Gate`, and day, time and toggles live in the url (`use-param.ts`).

