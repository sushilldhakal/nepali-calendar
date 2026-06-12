# @sushill/bikram-sambat

Framework-agnostic Bikram Sambat (Nepali calendar) ↔ Gregorian `Date` conversion, with built-in festivals, holidays, and an optional Patro API client.

> Part of the [nepali-calendar](https://github.com/sushilldhakal/nepali-calendar) project — see the **[Live Demo](https://sushilldhakal.github.io/nepali-calendar/)** for a full React calendar built on top of this package.

## Install

```bash
npm install @sushill/bikram-sambat
```

## Usage

### Date conversion

```ts
import { adToBS, bsToAD, formatBSDate } from "@sushill/bikram-sambat"

const bs = adToBS(new Date()) // { year, month, day, monthName }
const ad = bsToAD(2082, 1, 1) // Baisakh 1, 2082 BS → Date
console.log(formatBSDate(ad)) // "Baisakh 1, 2082"
```

### Built-in festivals (offline)

```ts
import {
  getFestivalsForDate,
  getFestivalsForMonth,
  getNationalHolidays,
  isNationalHoliday,
  NEPALI_FESTIVALS,
} from "@sushill/bikram-sambat"

const today = getFestivalsForDate(new Date())
const baisakh = getFestivalsForMonth(1)
const holidays = getNationalHolidays()
```

### Live Patro API (optional)

```ts
import {
  fetchFestivalsForBSYear,
  fetchHolidaysForBSYear,
  fetchDailyPanchanga,
  fetchSpecialMonths,
  fetchAbout,
} from "@sushill/bikram-sambat"

// Override baseUrl to point at your own Patro server
const festivals = await fetchFestivalsForBSYear(2083, {
  baseUrl: "https://your-api.example.com",
})

const holidays = await fetchHolidaysForBSYear(2083)
const panchanga = await fetchDailyPanchanga("2083-02-15")
const special = await fetchSpecialMonths(2083) // Adhik / Kshaya Maas
```

### Hybrid provider

```ts
import { getFestivalsForDateHybrid } from "@sushill/bikram-sambat"

// Offline built-in data, with API fallback when configured
const festivals = await getFestivalsForDateHybrid(new Date(), {
  apiBaseUrl: "https://your-api.example.com",
})
```

## Supported range

**1700–2200** (501 years offline):

| Range | Source |
|-------|--------|
| **2000–2099** | Official month-length lookup |
| **1700–1999** | Sankranti-based estimation |
| **2100–2200** | Sankranti-based estimation |

See `BS_SUPPORTED_START_YEAR` / `BS_SUPPORTED_END_YEAR`.

## Changelog

See [CHANGELOG.md](../../CHANGELOG.md) in the repo root.

## License

MIT
