# Changelog

All notable changes to this project are documented here.

## [1.2.0] — 2026-06-12

### `@sushill/bikram-sambat`

#### Changed
- **Expanded offline BS calendar data from 1700 to 2200** (501 years, up from 121)
  - **2000–2099** — official month-length lookup
  - **1700–1999** — sankranti-based estimation (historical range)
  - **2100–2200** — sankranti-based estimation (future range)
- `BS_SUPPORTED_START_YEAR` is now **1700** (was 2080)

### `@sushill/react-nepali-calendar` 1.1.1

#### Changed
- Bumps `@sushill/bikram-sambat` to **1.2.0** — inherits the 1700–2200 conversion range

---

## [1.1.0] — 2026-06-12

### `@sushill/react-nepali-calendar`

#### Added
- **`showFestivals` prop** — red dots for national holidays, blue dots for other festivals on calendar days
- **Festival-aware day button** — holiday dates highlighted in red when `showFestivals` is enabled
- Re-exports all festival utilities from `@sushill/bikram-sambat` (`getFestivalsForDate`, `getNationalHolidays`, `NEPALI_FESTIVALS`, etc.)

#### Demo (GitHub Pages)
- **Dynamic Patro** — month festival markers from `/patro`, full daily panchanga on date selection
- **Detail Calendar** — traditional Patro-style monthly grid with tithi, shraddha labels, and full panchanga modal
- **Holidays Calendar** — BS-year public holidays from `/holidays` with multi-day range highlighting
- **Muhurta windows** — Rahu Kalam, Yamaganda, Gulika, and Abhijit shown in panchanga sidebars
- Demo API server updated to `https://193-123-67-133.sslip.io` (demo only; npm packages are API-agnostic)

---

### `@sushill/bikram-sambat`

#### Added
- **Built-in festival dataset** — major Nepali festivals with bilingual names, categories, and multi-day support
- **Holiday data module** — structured public holiday records by BS year
- **Patro API client** (`festivals-api.ts`) — fetch live festival, holiday, and panchanga data:
  - `fetchFestivalsForBSYear`, `fetchHolidaysForBSYear`
  - `fetchDailyPanchanga`, `fetchFestivalsForDate`
  - `fetchSpecialMonths` (Adhik Maas / Kshaya Maas)
  - `fetchAbout` (methodology, references, engine version)
- **Hybrid festival provider** — offline built-in data with optional API fallback (`getFestivalsForDateHybrid`, `getFestivalsForMonthHybrid`)
- **Query helpers** — `getFestivalsForDate`, `getFestivalsForMonth`, `getNationalHolidays`, `isNationalHoliday`, `getFestivalById`

#### Changed
- Extended BS calendar data: authoritative **2080–2099**, extrapolated support through **BS 2200**
- Rewrote API client to match the [Surya Panchanga API](https://github.com/sushilldhakal/patro) response shapes

---

## [1.0.0] — 2025

### Initial release

- `@sushill/bikram-sambat` — AD ↔ BS conversion with zero runtime dependencies
- `@sushill/react-nepali-calendar` — Bikram Sambat date picker on react-day-picker v9
- Dual BS/AD day display, shadcn/ui compatible CSS variables
- Single, range, and dropdown caption modes

[1.2.0]: https://github.com/sushilldhakal/nepali-calendar/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/sushilldhakal/nepali-calendar/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/sushilldhakal/nepali-calendar/releases/tag/v1.0.0
