# bikram-sambat

Framework-agnostic Bikram Sambat (Nepali calendar) ↔ Gregorian `Date` conversion.

> Part of the [nepali-calendar](https://github.com/sushilldhakal/nepali-calendar) project — see the **[Live Demo](https://sushilldhakal.github.io/nepali-calendar/)** for a full React calendar built on top of this package.

## Install

```bash
npm install bikram-sambat
```

## Usage

```ts
import { adToBS, bsToAD, formatBSDate } from "bikram-sambat"

const bs = adToBS(new Date()) // { year, month, day, monthName }
const ad = bsToAD(2082, 1, 1) // Baisakh 1, 2082 BS → Date
console.log(formatBSDate(ad)) // "Baisakh 1, 2082"
```

## Supported range

BS years **2080–2090** with authoritative month lengths. See `BS_SUPPORTED_START_YEAR` / `BS_SUPPORTED_END_YEAR`.

## License

MIT
