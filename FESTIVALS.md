# Nepali Festivals & Holidays

The Nepali Calendar now includes built-in support for major Nepali festivals and holidays!

## Features

- ✅ **Built-in Festival Data**: Major Nepali festivals pre-configured
- 🎯 **Visual Indicators**: Red dots for national holidays, blue for other festivals
- 📅 **Multi-day Support**: Handles festivals spanning multiple days (e.g., Dashain, Tihar)
- 🔍 **Query Functions**: Easy API to check festivals by date, month, or category
- 🌐 **Bilingual Names**: Both English and Nepali names included

## Quick Start

### Display Festivals on Calendar

Simply add the `showFestivals` prop to enable festival indicators:

```tsx
import { NepaliCalendar } from "@sushill/react-nepali-calendar"

function MyCalendar() {
  return (
    <NepaliCalendar
      mode="single"
      showFestivals={true}
    />
  )
}
```

### Query Festival Data

```tsx
import {
  getFestivalsForDate,
  getFestivalsForMonth,
  getNationalHolidays,
  isNationalHoliday,
  adToBS
} from "@sushill/react-nepali-calendar"

// Check festivals on a specific date
const today = new Date()
const bs = adToBS(today)
const todaysFestivals = getFestivalsForDate(bs.year, bs.month, bs.day)

// Get all festivals in a month
const baisakhFestivals = getFestivalsForMonth(1) // Baisakh

// Get only national holidays
const holidays = getNationalHolidays()

// Check if a date is a holiday
const isHoliday = isNationalHoliday(1, 1) // Nepali New Year
```

## Festival Data Structure

Each festival includes:

```typescript
type Festival = {
  id: string              // Unique identifier (e.g., "dashain")
  name: string            // English name
  nameNepali: string      // Nepali name (e.g., "दशैं")
  description: string     // Brief description
  category: FestivalCategory // "national" | "religious" | "cultural" | "regional"
  isNationalHoliday: boolean
  significance: 1 | 2 | 3 | 4 | 5  // 5 = most significant
  bsMonth: number         // BS month (1-12)
  bsDay: number          // BS day (1-32)
  durationDays?: number  // For multi-day festivals
}
```

## Included Festivals

### National Festivals
- **Nepali New Year** (Baisakh 1) - नयाँ वर्ष
- **Dashain** (Ashwin 25+, 15 days) - दशैं
- **Tihar** (Kartik 27+, 5 days) - तिहार
- **Republic Day** (Jestha 15) - गणतन्त्र दिवस
- **Constitution Day** (Bhadra 3) - संविधान दिवस
- **Democracy Day** (Magh 7) - लोकतन्त्र दिवस

### Religious Festivals
- **Buddha Jayanti** (Baisakh 15) - बुद्ध जयन्ती
- **Janai Purnima** (Shrawan 15) - जनै पूर्णिमा
- **Krishna Janmashtami** (Bhadra 8) - कृष्ण जन्माष्टमी
- **Teej** (Bhadra 3) - तीज
- **Maha Shivaratri** (Falgun 13) - महाशिवरात्रि
- **Chhath** (Kartik 20, 4 days) - छठ

### Cultural Festivals
- **Gai Jatra** (Shrawan 16) - गाई जात्रा
- **Indra Jatra** (Ashwin 1) - इन्द्र जात्रा
- **Holi** (Falgun 30) - होली
- **Ghode Jatra** (Chaitra 15) - घोडे जात्रा
- **Maghe Sankranti** (Magh 1) - माघे सङ्क्रान्ति
- **Sonam Lhosar** (Magh 15) - सोनाम ल्होसार

## API Reference

### `getFestivalsForDate(bsYear, bsMonth, bsDay)`
Returns array of festivals occurring on the specified BS date.

```tsx
const festivals = getFestivalsForDate(2081, 1, 1)
// Returns: [{ id: "nepali-new-year", name: "Nepali New Year", ... }]
```

### `getFestivalsForMonth(bsMonth)`
Returns all festivals in the specified BS month.

```tsx
const ashwinFestivals = getFestivalsForMonth(6)
// Includes Indra Jatra, Dashain, etc.
```

### `getNationalHolidays()`
Returns only festivals marked as national holidays.

```tsx
const holidays = getNationalHolidays()
// Returns all festivals where isNationalHoliday === true
```

### `getFestivalsByCategory(category)`
Filter festivals by category.

```tsx
const religiousFestivals = getFestivalsByCategory("religious")
// Returns Buddha Jayanti, Janai Purnima, etc.
```

### `isNationalHoliday(bsMonth, bsDay)`
Check if a specific date is a national holiday.

```tsx
const isHoliday = isNationalHoliday(1, 1) // true (New Year)
const isHoliday2 = isNationalHoliday(1, 2) // false
```

### `getFestivalById(id)`
Get a specific festival by its ID.

```tsx
const dashain = getFestivalById("dashain")
// Returns full festival object
```

### `NEPALI_FESTIVALS`
Access the complete festivals array.

```tsx
import { NEPALI_FESTIVALS } from "@sushill/react-nepali-calendar"

console.log(`Total festivals: ${NEPALI_FESTIVALS.length}`)
```

## Visual Indicators

When `showFestivals={true}`, the calendar displays:

- 🔴 **Red dot**: National holiday
- 🔵 **Blue dot**: Other festivals
- 🟥 **Red text**: Days that are national holidays

## Example: Festival List Component

```tsx
import { getFestivalsForMonth, BS_MONTH_NAMES } from "@sushill/react-nepali-calendar"

function FestivalList({ month }: { month: number }) {
  const festivals = getFestivalsForMonth(month)
  
  return (
    <div>
      <h2>{BS_MONTH_NAMES[month - 1]} Festivals</h2>
      <ul>
        {festivals.map((festival) => (
          <li key={festival.id}>
            <strong>{festival.name}</strong> ({festival.nameNepali})
            <br />
            {festival.description}
            {festival.isNationalHoliday && (
              <span className="badge">National Holiday</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Example: Holiday Checker

```tsx
import { useState } from "react"
import { 
  NepaliCalendar, 
  adToBS, 
  getFestivalsForDate 
} from "@sushill/react-nepali-calendar"

function HolidayChecker() {
  const [date, setDate] = useState<Date>()
  
  const festivals = date 
    ? getFestivalsForDate(
        adToBS(date).year, 
        adToBS(date).month, 
        adToBS(date).day
      )
    : []

  return (
    <div>
      <NepaliCalendar
        mode="single"
        selected={date}
        onSelect={setDate}
        showFestivals={true}
      />
      
      {festivals.length > 0 && (
        <div>
          <h3>Festivals on this day:</h3>
          {festivals.map((festival) => (
            <div key={festival.id}>
              <h4>{festival.name} ({festival.nameNepali})</h4>
              <p>{festival.description}</p>
              {festival.isNationalHoliday && (
                <span>🏖️ National Holiday</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Customization

### Custom Festival Indicators

Override the default DayButton component to customize how festivals are displayed:

```tsx
import { NepaliCalendar } from "@sushill/react-nepali-calendar"
import { adToBS, getFestivalsForDate } from "@sushill/bikram-sambat"

function CustomDayButton({ day, ...props }: any) {
  const bs = adToBS(day.date)
  const festivals = getFestivalsForDate(bs.year, bs.month, bs.day)
  
  return (
    <button {...props}>
      {bs.day}
      {festivals.length > 0 && (
        <span className="festival-badge">
          🎉
        </span>
      )}
    </button>
  )
}

function MyCalendar() {
  return (
    <NepaliCalendar
      components={{
        DayButton: CustomDayButton
      }}
    />
  )
}
```

## Contributing

Have a festival we're missing? Want to correct festival dates? 

The festival data is in `packages/bikram-sambat/src/festivals.ts`. Pull requests welcome!

### Adding a New Festival

```typescript
{
  id: "your-festival",
  name: "Your Festival Name",
  nameNepali: "तपाईंको चाड",
  description: "Brief description",
  category: "cultural",
  isNationalHoliday: false,
  significance: 3,
  bsMonth: 5,
  bsDay: 10,
  durationDays: 1
}
```

## Notes

- **Date Variations**: Some festivals (especially lunar-based ones) may vary slightly by year and region. We use typical/average dates.
- **Regional Festivals**: Currently focuses on nationally recognized festivals. Regional variations coming soon!
- **Future Enhancements**: 
  - Year-specific dates for lunar festivals
  - Regional festival variations
  - API integration for dynamic festival data
  - Custom festival additions via props

## License

MIT - Same as the Nepali Calendar package
