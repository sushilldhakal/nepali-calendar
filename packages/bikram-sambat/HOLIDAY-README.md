# Holiday Data Integration

## Overview

The `holiday.ts` file serves as the central data source for Nepali festivals and holidays in the calendar system. It contains accurate festival calculations for multiple years and integrates seamlessly with the calendar to display holidays.

## How Holidays Reflect in the Calendar

### 1. **Data Structure**

Each holiday entry contains:
- `festival_id`: Unique identifier (e.g., "dashain", "tihar")
- `start` and `end`: Gregorian date range (YYYY-MM-DD)
- `duration_days`: Length of the festival
- `lunar_month`: Associated Nepali month
- `is_adhik_year`: Whether it occurs in a leap year
- `method`: Calculation method used

### 2. **Integration Flow**

```
holiday.ts (raw data)
    ↓
festivals.ts (processes data, adds metadata)
    ↓
NEPALI_FESTIVALS (array of Festival objects)
    ↓
Calendar Components (display holidays)
```

### 3. **Usage Examples**

#### Check if a date has a holiday:

```typescript
import { getFestivalsForDate, isNationalHoliday } from 'bikram-sambat'

const date = new Date('2026-04-14')
const festivals = getFestivalsForDate(date)
// Returns: [{ id: 'bs-new-year', name: 'Nepali New Year', ... }]

const isHoliday = isNationalHoliday(date)
// Returns: true
```

#### Get all holidays for a month:

```typescript
import { getFestivalsForMonth } from 'bikram-sambat'

const festivals = getFestivalsForMonth(11, 2026) // November 2026
// Returns: Tihar festivals, Chhath, etc.
```

#### Check BS date for holidays:

```typescript
import { getFestivalsForBSDate, isNationalHolidayBS } from 'bikram-sambat'

const festivals = getFestivalsForBSDate(2083, 1, 1) // BS 2083/1/1
// Returns festivals on Nepali New Year

const isHoliday = isNationalHolidayBS(1, 1)
// Returns: true
```

#### Access raw holiday data:

```typescript
import { holiday, getHolidaysByYear, getAvailableYears } from 'bikram-sambat'

// Current year data
console.log(holiday.year) // 2026
console.log(holiday.count) // 47 festivals

// Specific year
const data2027 = getHolidaysByYear(2027)

// All available years
const years = getAvailableYears() // [2026, 2027, 2028]
```

## Festival Categories

Holidays are categorized for easy filtering:

- **National Holidays**: Major public holidays (Dashain, Tihar, New Year)
- **Religious**: Sacred festivals (Shivaratri, Buddha Jayanti)
- **Cultural**: Community festivals (Gai Jatra, Indra Jatra)
- **Regional**: Ethnic group celebrations (Lhosar variants)

## Calendar Display Features

### Visual Indicators

- **National Holidays**: Highlighted in red/special color
- **Religious Festivals**: Marked with religious symbols
- **Multi-day Festivals**: Show duration range
- **Festival Names**: Display on hover or click

### Filtering Options

```typescript
import { getNationalHolidays, getFestivalsByCategory } from 'bikram-sambat'

// Only public holidays
const publicHolidays = getNationalHolidays()

// By category
const culturalFestivals = getFestivalsByCategory('cultural')
```

## Data Accuracy

- Generated from accurate lunar calculations
- Includes override data for precision
- Accounts for adhik maas (leap month)
- Multi-year coverage (2026-2028+)

## Adding New Year Data

To add holiday data for a new year:

1. Generate festival calculations for the year
2. Add a new object to the `holidays` array:

```typescript
{
  "year": 2029,
  "generated_at": "2029-01-01T00:00:00.000Z",
  "count": 50,
  "festivals": [
    // ... festival entries
  ]
}
```

3. Ensure festival IDs match existing metadata in `festivals.ts`

## API Integration

For dynamic updates, combine with the API:

```typescript
import { getFestivalsForDateHybrid } from 'bikram-sambat'

// Tries API first, falls back to static data
const festivals = await getFestivalsForDateHybrid(
  new Date('2026-10-19'),
  { preferApi: true }
)
```

## Type Safety

All holiday data is fully typed:

```typescript
import type { HolidayFestival, HolidayYear } from 'bikram-sambat'

const festival: HolidayFestival = {
  festival_id: "dashain",
  start: "2026-10-10",
  end: "2026-10-24",
  duration_days: 15,
  method: "override",
  lunar_month: "Ashwin",
  is_adhik_year: true
}
```

## Troubleshooting

### Holidays not showing?

1. Check if the year has data: `hasHolidayDataForYear(2026)`
2. Verify date format is correct (YYYY-MM-DD)
3. Ensure festivals.ts metadata exists for the festival ID

### Wrong dates?

1. Check the lunar_month alignment
2. Verify is_adhik_year flag
3. Review the calculation method

## Related Files

- `festivals.ts`: Processing and metadata
- `festivals-api.ts`: Dynamic API integration
- `festivals-hybrid.ts`: Combined static + API approach
- `index.ts`: Main exports

## Contributing

When adding new festivals:
1. Add metadata to `FESTIVAL_META` in `festivals.ts`
2. Include proper categorization
3. Mark national holidays correctly
4. Provide both English and Nepali names
