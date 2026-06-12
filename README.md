# Nepali Calendar

Open-source **Bikram Sambat** calendar for JavaScript and React. Free to use, MIT licensed.

**[Live Demo →](https://sushilldhakal.github.io/nepali-calendar/)**

## What's new

- **v1.2.0** — BS calendar data expanded to **1700–2200** (501 years offline)
- **v1.1.0** — Festivals, holidays, Patro API client, rich demo pages

See **[CHANGELOG.md](./CHANGELOG.md)** for the full release notes.

## Features

| Feature | Description |
|---------|-------------|
| **Bikram Sambat dates** | Navigate and display Nepali calendar dates |
| **Dual calendar display** | BS day prominent, AD day underneath |
| **Festival indicators** | Built-in festivals; red = national holiday, blue = festival |
| **Patro API integration** | Optional live data from Surya Panchanga API |
| **shadcn/ui compatible** | CSS variables map to shadcn design tokens |
| **TypeScript** | Fully typed across both packages |
| **Zero-dep core** | `bikram-sambat` has no runtime dependencies |

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| [`@sushill/bikram-sambat`](./packages/bikram-sambat) | [![npm](https://img.shields.io/npm/v/@sushill/bikram-sambat)](https://www.npmjs.com/package/@sushill/bikram-sambat) | AD ↔ BS conversion, festivals, holidays, API client |
| [`@sushill/react-nepali-calendar`](./packages/react-nepali-calendar) | [![npm](https://img.shields.io/npm/v/@sushill/react-nepali-calendar)](https://www.npmjs.com/package/@sushill/react-nepali-calendar) | Bikram Sambat date picker for React |

## Quick start

```bash
npm install @sushill/react-nepali-calendar react-day-picker
```

```tsx
import "@sushill/react-nepali-calendar/styles.css"
import { NepaliCalendar } from "@sushill/react-nepali-calendar"

<NepaliCalendar mode="single" selected={date} onSelect={setDate} />
```

### With festivals

```tsx
<NepaliCalendar
  mode="single"
  selected={date}
  onSelect={setDate}
  showFestivals
/>
```

### Query festival data

```tsx
import { getFestivalsForDate, isNationalHoliday } from "@sushill/bikram-sambat"

const festivals = getFestivalsForDate(new Date())
const isHoliday = festivals.some(f => f.isNationalHoliday)
```

### Live API data (optional)

```tsx
import { fetchFestivalsForBSYear, fetchHolidaysForBSYear } from "@sushill/bikram-sambat"

const data = await fetchFestivalsForBSYear(2083, {
  baseUrl: "https://your-patro-api.example.com",
})
```

See **[FESTIVALS.md](./FESTIVALS.md)** for complete festival documentation.

## Demo

**Online:** https://sushilldhakal.github.io/nepali-calendar/

The demo connects to the Surya Panchanga API for live panchanga, festivals, and holidays. Basic date-picker examples work fully offline.

**Run locally:**

```bash
git clone https://github.com/sushilldhakal/nepali-calendar.git
cd nepali-calendar
npm install
npm run build
npm run demo
```

Open http://localhost:5175

## Monorepo scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspaces |
| `npm run build` | Build all packages |
| `npm test` | Run bikram-sambat tests |
| `npm run demo` | Start the Vite demo app |
| `npm run typecheck` | TypeScript check all packages |

## Supported BS years

**1700–2200** offline (501 years):

| Range | Source |
|-------|--------|
| **2000–2099** | Official month-length lookup |
| **1700–1999** | Sankranti-based estimation |
| **2100–2200** | Sankranti-based estimation |

Contributions welcome — see [`packages/bikram-sambat/src/bs-calendar-data.json`](./packages/bikram-sambat/src/bs-calendar-data.json).

## Publishing

Packages publish to npm on GitHub Release (see [`.github/workflows/publish.yml`](./.github/workflows/publish.yml)):

1. Merge changes to `main`
2. Create a GitHub Release with tag `v1.1.0`
3. CI builds, tests, and publishes both packages with npm provenance

## Contributing

1. Fork the repo
2. `npm install`
3. Make changes in `packages/`
4. `npm run build && npm test`
5. Open a pull request

## License

MIT — see [LICENSE](./LICENSE)
