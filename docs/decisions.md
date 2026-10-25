# decisions
The cutoff is inclusive (publishTime <= cutoff) because a forecast published at that minute was there to be used. Default is 09:00 and you can move it, since the brief only says "one day before".

The window is decisions made 1 to 31 January, so delivery days run 2 Jan to 1 Feb. I pull forecasts from 30 Dec because a 1 Jan decision can still use one from 31 Dec.

Elexon forecasts wind hourly but the actuals are half-hourly. I held each hourly forecast over both half-hours so the page stays at 30 minutes. I also scored it two other ways (only on the hour, and hourly averages of the actuals) and the average miss came out within about 1%, so the choice does not change the story.

Error is forecast minus actual, so plus means too much wind was promised, which is the expensive side. The margin is the P90 of that, from days up to D-2 only, and it needs at least 144 half-hours before it shows. I left out MAPE because wind near zero makes it blow up.

No database, since the month is fixed and the brief does not ask for storage. A read-only snapshot also means the demo cannot fail on an Elexon rate limit. No pandas either, it is only about 100k rows.

Times are UTC. That is only UK time in winter, so a summer window would need Europe/London.

On the web side the day, time and toggles live in the url, so any screen can be sent as a link. We did not validate api responses with zod because it is our own api.

I stayed on TypeScript 6 because typescript-eslint does not support 7 yet and lint would quietly stop working.
