# react-nepali-calendar

Bikram Sambat (Nepali) calendar for React — dual BS/AD day display on [react-day-picker](https://react-day-picker.js.org/) v9.

Values in and out are always JavaScript `Date` (Gregorian). The grid navigates and labels months in Bikram Sambat.

## Install

```bash
npm install react-nepali-calendar bikram-sambat react-day-picker
```

Peers: `react` ≥18, `react-dom` ≥18, `react-day-picker` ^9.

## Setup

```tsx
import "react-day-picker/style.css"
import "react-nepali-calendar/styles.css"
```

Tailwind users: add the package to `content` in `tailwind.config` if you override `classNames`:

```js
content: ["./node_modules/react-nepali-calendar/dist/**/*.js"]
```

## Usage

### Single date

```tsx
import { useState } from "react"
import { NepaliCalendar } from "react-nepali-calendar"

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

### Date range

With `exactOptionalPropertyTypes`, omit props when undefined:

```tsx
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { NepaliCalendar } from "react-nepali-calendar"

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

### Conversion only

```tsx
import { adToBS, bsToAD, formatBSDate } from "react-nepali-calendar"
// or: import { adToBS } from "bikram-sambat"
```

## Props

Extends all [react-day-picker](https://daypicker.dev/) props, plus:

| Prop | Default | Description |
|------|---------|-------------|
| `showGregorianDates` | `true` | Small AD day under each BS day |

## Supported BS years

**2080–2090** (see `bikram-sambat` for tables). Extend by contributing year data.

## License

MIT
