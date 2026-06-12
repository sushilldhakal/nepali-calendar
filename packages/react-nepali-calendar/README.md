# @sushill/react-nepali-calendar

Bikram Sambat (Nepali) calendar for React — dual BS/AD day display on [react-day-picker](https://react-day-picker.js.org/) v9.

**[Live Demo →](https://sushilldhakal.github.io/nepali-calendar/)**

Values in and out are always JavaScript `Date` (Gregorian). The grid navigates and labels months in Bikram Sambat.

## Install

```bash
npm install @sushill/react-nepali-calendar react-day-picker
```

Peers: `react` ≥18, `react-dom` ≥18, `react-day-picker` ^9.

## Setup

```tsx
import "react-day-picker/style.css"
import "@sushill/react-nepali-calendar/styles.css"
```

Tailwind users: add the package to `content` in `tailwind.config` if you override `classNames`:

```js
content: ["./node_modules/@sushill/react-nepali-calendar/dist/**/*.js"]
```

## Usage

### Single date

```tsx
import { useState } from "react"
import { NepaliCalendar } from "@sushill/react-nepali-calendar"

export function Example() {
  const [date, setDate] = useState<Date>()

  return (
    <NepaliCalendar
      mode="single"
      selected={date}
      onSelect={setDate}
      {...(date ? { defaultMonth: date } : {})}
    />
  )
}
```

### With festivals (v1.1.0+)

```tsx
<NepaliCalendar
  mode="single"
  selected={date}
  onSelect={setDate}
  showFestivals
/>
```

Red dots mark national holidays; blue dots mark other festivals. Works offline using built-in festival data from `@sushill/bikram-sambat`.

### Date range

```tsx
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { NepaliCalendar } from "@sushill/react-nepali-calendar"

export function RangeExample() {
  const [range, setRange] = useState<DateRange>()

  return (
    <NepaliCalendar
      mode="range"
      numberOfMonths={2}
      {...(range?.from ? { defaultMonth: range.from } : {})}
      {...(range ? { selected: range } : {})}
      onSelect={setRange}
    />
  )
}
```

### Conversion & festival queries

```tsx
import {
  adToBS,
  bsToAD,
  formatBSDate,
  getFestivalsForDate,
  getNationalHolidays,
} from "@sushill/react-nepali-calendar"
```

## Props

Extends all [react-day-picker](https://daypicker.dev/) props, plus:

| Prop | Default | Description |
|------|---------|-------------|
| `showGregorianDates` | `true` | Small AD day under each BS day |
| `showFestivals` | `false` | Festival/holiday dot indicators on days |

## Supported BS years

**1700–2200** via `@sushill/bikram-sambat` (2000–2099 official lookup; other ranges sankranti estimated).

## Changelog

See [CHANGELOG.md](../../CHANGELOG.md) in the repo root.

## License

MIT
