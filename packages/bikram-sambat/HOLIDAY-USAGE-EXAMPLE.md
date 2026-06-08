# Holiday Display Example

## How Holidays Reflect in the Calendar

This example demonstrates how the holiday data from `holiday.ts` is displayed in a Nepali calendar.

## Quick Start

```typescript
import { 
  getFestivalsForDate, 
  isNationalHoliday,
  getFestivalsForMonth,
  NEPALI_FESTIVALS 
} from '@sushill/bikram-sambat'

// Example 1: Check today's holidays
const today = new Date()
const todaysFestivals = getFestivalsForDate(today)

if (todaysFestivals.length > 0) {
  todaysFestivals.forEach(festival => {
    console.log(`🎉 ${festival.name} (${festival.nameNepali})`)
    console.log(`   ${festival.description}`)
    console.log(`   National Holiday: ${festival.isNationalHoliday ? 'Yes ✓' : 'No'}`)
  })
}

// Example 2: Check if it's a national holiday
if (isNationalHoliday(today)) {
  console.log('🏖️ It\'s a public holiday!')
}
```

## Calendar Integration Example

### Monthly Calendar with Holidays

```typescript
function renderMonthWithHolidays(month: number, year: number) {
  const festivals = getFestivalsForMonth(month, year)
  
  // Create a map of dates to festivals
  const dateToFestivals = new Map<string, Festival[]>()
  
  festivals.forEach(festival => {
    const start = new Date(festival.startDate)
    const end = new Date(festival.endDate)
    
    // Mark each day in the festival range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      if (!dateToFestivals.has(dateKey)) {
        dateToFestivals.set(dateKey, [])
      }
      dateToFestivals.get(dateKey)?.push(festival)
    }
  })
  
  return dateToFestivals
}

// Usage
const holidayMap = renderMonthWithHolidays(11, 2026) // November 2026 (Tihar!)
console.log(holidayMap.get('2026-11-09')) // Laxmi Puja
```

### BS Calendar with Holidays

```typescript
import { getFestivalsForBSDate, isNationalHolidayBS, adToBS } from '@sushill/bikram-sambat'

function renderBSDay(bsYear: number, bsMonth: number, bsDay: number) {
  const festivals = getFestivalsForBSDate(bsYear, bsMonth, bsDay)
  const isHoliday = isNationalHolidayBS(bsMonth, bsDay)
  
  return {
    date: `${bsYear}/${bsMonth}/${bsDay}`,
    festivals: festivals.map(f => f.name),
    isHoliday,
    className: isHoliday ? 'holiday-cell' : 'regular-cell'
  }
}

// Example: BS New Year
const newYearDay = renderBSDay(2083, 1, 1)
console.log(newYearDay)
// {
//   date: "2083/1/1",
//   festivals: ["Nepali New Year"],
//   isHoliday: true,
//   className: "holiday-cell"
// }
```

## React Component Example

```tsx
import { getFestivalsForDate, isNationalHoliday } from '@sushill/bikram-sambat'
import { useState } from 'react'

function CalendarDay({ date }: { date: Date }) {
  const [showDetails, setShowDetails] = useState(false)
  const festivals = getFestivalsForDate(date)
  const isHoliday = isNationalHoliday(date)
  
  return (
    <div 
      className={`calendar-day ${isHoliday ? 'national-holiday' : ''}`}
      onClick={() => setShowDetails(!showDetails)}
    >
      <span className="day-number">{date.getDate()}</span>
      
      {festivals.length > 0 && (
        <div className="festival-indicator">
          <span className="festival-dot">●</span>
          {festivals.length > 1 && (
            <span className="festival-count">+{festivals.length - 1}</span>
          )}
        </div>
      )}
      
      {showDetails && festivals.length > 0 && (
        <div className="festival-tooltip">
          {festivals.map(festival => (
            <div key={festival.id} className="festival-item">
              <strong>{festival.name}</strong>
              <span className="nepali-name">{festival.nameNepali}</span>
              {festival.isNationalHoliday && <span className="badge">Holiday</span>}
              <p>{festival.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Styling Example

```css
/* National holidays */
.calendar-day.national-holiday {
  background-color: #fee2e2;
  border-color: #ef4444;
}

.calendar-day.national-holiday .day-number {
  color: #dc2626;
  font-weight: bold;
}

/* Festival indicators */
.festival-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.festival-dot {
  color: #f59e0b;
  font-size: 8px;
}

.festival-count {
  font-size: 10px;
  color: #6b7280;
}

/* Festival tooltip */
.festival-tooltip {
  position: absolute;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 200px;
}

.festival-item {
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.festival-item:last-child {
  border-bottom: none;
}

.nepali-name {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0;
}

.badge {
  display: inline-block;
  padding: 2px 6px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 6px;
}
```

## Filtering Holidays

```typescript
import { getNationalHolidays, getFestivalsByCategory } from '@sushill/bikram-sambat'

// Show only national holidays
function getNationalHolidaysList() {
  const holidays = getNationalHolidays()
  return holidays.map(h => ({
    name: h.name,
    date: h.startDate,
    duration: h.durationDays
  }))
}

// Filter by category
function getReligiousFestivals() {
  return getFestivalsByCategory('religious')
}

function getCulturalFestivals() {
  return getFestivalsByCategory('cultural')
}

// Major festivals only (significance >= 4)
function getMajorFestivals() {
  return NEPALI_FESTIVALS.filter(f => f.significance >= 4)
}
```

## Complete Calendar Example

```typescript
import { 
  getFestivalsForMonth, 
  isNationalHoliday,
  adToBS 
} from '@sushill/bikram-sambat'

interface CalendarCell {
  adDate: Date
  bsDate: { year: number; month: number; day: number; monthName: string }
  festivals: string[]
  isHoliday: boolean
}

function generateMonthCalendar(month: number, year: number): CalendarCell[][] {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const festivals = getFestivalsForMonth(month, year)
  
  // Create date-to-festival map
  const festivalMap = new Map<string, string[]>()
  festivals.forEach(festival => {
    const start = new Date(festival.startDate)
    const end = new Date(festival.endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      if (!festivalMap.has(key)) festivalMap.set(key, [])
      festivalMap.get(key)!.push(festival.name)
    }
  })
  
  // Build calendar grid
  const weeks: CalendarCell[][] = []
  let currentWeek: CalendarCell[] = []
  
  // Fill initial days
  const startDayOfWeek = firstDay.getDay()
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null as any) // Empty cells
  }
  
  // Fill calendar days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month - 1, day)
    const dateKey = date.toISOString().split('T')[0]
    
    currentWeek.push({
      adDate: date,
      bsDate: adToBS(date),
      festivals: festivalMap.get(dateKey) || [],
      isHoliday: isNationalHoliday(date)
    })
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  
  // Fill remaining days
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push(null as any)
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }
  
  return weeks
}

// Usage
const novemberCalendar = generateMonthCalendar(11, 2026)
console.log('November 2026 Calendar with Holidays:')
novemberCalendar.forEach((week, weekIndex) => {
  console.log(`Week ${weekIndex + 1}:`)
  week.forEach(cell => {
    if (cell) {
      const holidayMark = cell.isHoliday ? '🎉' : '  '
      const festivalMark = cell.festivals.length > 0 ? `[${cell.festivals.join(', ')}]` : ''
      console.log(`  ${holidayMark} ${cell.adDate.getDate()} ${festivalMark}`)
    }
  })
})
```

## Expected Output

When you run the examples with the holiday data:

```
November 2026 Calendar with Holidays:
Week 1:
  1
  2
  3
  4
  5
  6
Week 2:
  🎉 7 [Navavarsha, Tihar]
  8 [Tihar]
  🎉 9 [Goru Tihar, Tihar, Laxmi Puja]
  10 [Tihar]
  🎉 11 [Tihar, Mha Puja]
  🎉 12 [Bhai Tika, Chhath]
  13 [Chhath]
Week 3:
  14 [Chhath]
  🎉 15 [Chhath]
  ...
```

This demonstrates how the holiday data from `holiday.ts` seamlessly integrates with the calendar to provide rich festival information and highlight national holidays!
