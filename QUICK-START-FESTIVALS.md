# Quick Start: Festivals

## 🎉 Show Festivals on Calendar

```tsx
import { NepaliCalendar } from "@sushill/react-nepali-calendar"

<NepaliCalendar 
  mode="single"
  showFestivals={true}  // 👈 That's it!
/>
```

## 🔍 Query Festival Data

```tsx
import { getFestivalsForDate, adToBS } from "@sushill/react-nepali-calendar"

// Check today's festivals
const bs = adToBS(new Date())
const festivals = getFestivalsForDate(bs.year, bs.month, bs.day)

// Example result:
// [{ 
//   id: "nepali-new-year",
//   name: "Nepali New Year", 
//   nameNepali: "नयाँ वर्ष",
//   isNationalHoliday: true 
// }]
```

## 📅 Check if Date is Holiday

```tsx
import { isNationalHoliday } from "@sushill/react-nepali-calendar"

const isHoliday = isNationalHoliday(1, 1)  // Baisakh 1
// Returns: true (Nepali New Year)
```

## 🗓️ Get All Festivals in a Month

```tsx
import { getFestivalsForMonth } from "@sushill/react-nepali-calendar"

const baisakhFestivals = getFestivalsForMonth(1)
// Returns array of all festivals in Baisakh
```

## 🏷️ Filter by Category

```tsx
import { getFestivalsByCategory } from "@sushill/react-nepali-calendar"

const nationalFestivals = getFestivalsByCategory("national")
const religiousFestivals = getFestivalsByCategory("religious")
const culturalFestivals = getFestivalsByCategory("cultural")
```

## 🎯 Get Specific Festival

```tsx
import { getFestivalById } from "@sushill/react-nepali-calendar"

const dashain = getFestivalById("dashain")
console.log(dashain.name)  // "Dashain"
console.log(dashain.nameNepali)  // "दशैं"
console.log(dashain.durationDays)  // 15
```

## 📋 List All Festivals

```tsx
import { NEPALI_FESTIVALS } from "@sushill/react-nepali-calendar"

console.log(`Total: ${NEPALI_FESTIVALS.length} festivals`)
```

## 🎨 Visual Indicators

- 🔴 Red dot = National holiday
- 🔵 Blue dot = Other festival  
- 🟥 Red text = Holiday date

## 📖 Full Documentation

- [FESTIVALS.md](./FESTIVALS.md) - Complete festival guide
- [FESTIVALS-API.md](./FESTIVALS-API.md) - API integration
- [docs-timesheet/content/docs/bikram-sambat-calendar.mdx](../docs-timesheet/content/docs/bikram-sambat-calendar.mdx) - Usage examples
