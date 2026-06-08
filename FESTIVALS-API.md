# Festival API Integration

The calendar can fetch festival data from the Nepal Festival Discovery API for accurate, year-specific festival dates.

## Quick Start

### Option 1: Static Data (Default - Works Offline)

```tsx
import { getFestivalsForDate } from "@sushill/bikram-sambat"

// Always uses built-in static festival data
const festivals = getFestivalsForDate(2081, 1, 1)
```

### Option 2: API with Fallback (Recommended)

```tsx
import { getFestivalsForDateHybrid } from "@sushill/bikram-sambat"

// Tries API first, falls back to static data
const festivals = await getFestivalsForDateHybrid(2081, 1, 1, {
  baseUrl: "https://your-api-url.com",
  useApi: true,
  preferApi: true
})
```

### Option 3: API Only

```tsx
import { fetchFestivalsForDate } from "@sushill/bikram-sambat"

// API only - returns empty array if API fails
const date = "2025-04-13" // YYYY-MM-DD
const festivals = await fetchFestivalsForDate(date, {
  baseUrl: "https://your-api-url.com"
})
```

## Configuration

```typescript
type FestivalProviderConfig = {
  // API Configuration
  baseUrl?: string           // Default: "https://api.nepalfestival.com"
  timeout?: number           // Default: 5000ms
  cacheDuration?: number     // Default: 1 hour (3600000ms)
  
  // Hybrid mode options
  useApi?: boolean          // Default: true
  preferApi?: boolean       // Default: true (false = prefer static data)
}
```

## API Endpoints

Based on your OpenAPI spec, the following endpoints are available:

### 1. Get Festivals for a Calendar Month

```
GET /api/festivals/calendar/{year}/{month}
```

Returns all festivals in a Gregorian calendar month with daily breakdown.

**Example:**
```typescript
const response = await fetchFestivalsForMonth(2025, 4, {
  baseUrl: "https://api.example.com"
})

// Response structure:
{
  year: 2025,
  month: 4,
  days: [
    {
      date: "2025-04-13",
      festivals: [
        {
          id: "nepali-new-year",
          name: "Nepali New Year",
          name_nepali: "नयाँ वर्ष",
          start_date: "2025-04-13",
          is_national_holiday: true,
          significance_level: 5
        }
      ]
    }
  ]
}
```

### 2. Get Festivals on a Specific Date

```
GET /api/festivals/on-date/{target_date}
```

Returns all festivals occurring on a specific date (YYYY-MM-DD format).

**Example:**
```typescript
const festivals = await fetchFestivalsForDate("2025-04-13")
```

### 3. Get Upcoming Festivals

```
GET /api/festivals/upcoming?days={days}
```

Returns festivals in the next N days.

**Example:**
```typescript
const upcoming = await fetchUpcomingFestivals(30, {
  baseUrl: "https://api.example.com"
})
```

### 4. Get Festival Timeline

```
GET /api/festivals/timeline?from={date}&to={date}
```

Returns festivals in a date range.

## React Integration

### With React Hook

```tsx
import { useState, useEffect } from "react"
import { getFestivalsForDateHybrid, adToBS } from "@sushill/react-nepali-calendar"

function useFestivals(date: Date) {
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bs = adToBS(date)
    
    getFestivalsForDateHybrid(bs.year, bs.month, bs.day, {
      baseUrl: process.env.VITE_FESTIVAL_API_URL
    }).then(setFestivals)
      .finally(() => setLoading(false))
  }, [date])

  return { festivals, loading }
}

// Usage
function MyComponent() {
  const { festivals, loading } = useFestivals(new Date())
  
  if (loading) return <div>Loading festivals...</div>
  
  return (
    <div>
      {festivals.map(f => (
        <div key={f.id}>{f.name}</div>
      ))}
    </div>
  )
}
```

### With Calendar Component

```tsx
import { NepaliCalendar } from "@sushill/react-nepali-calendar"

function CalendarWithApiHolidays() {
  // The calendar uses static data by default
  // For API integration, you'd need to customize the DayButton component
  
  return (
    <NepaliCalendar
      mode="single"
      showFestivals={true}  // Uses static data
    />
  )
}
```

## Custom DayButton with API

For live API festival data in the calendar:

```tsx
import { NepaliCalendar, adToBS } from "@sushill/react-nepali-calendar"
import { getFestivalsForDateHybrid } from "@sushill/bikram-sambat"
import { useQuery } from "@tanstack/react-query"

function ApiDayButton({ day, ...props }) {
  const bs = adToBS(day.date)
  
  const { data: festivals = [] } = useQuery({
    queryKey: ['festivals', bs.year, bs.month, bs.day],
    queryFn: () => getFestivalsForDateHybrid(bs.year, bs.month, bs.day, {
      baseUrl: process.env.VITE_FESTIVAL_API_URL
    }),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const hasHoliday = festivals.some(f => f.isNationalHoliday)

  return (
    <button {...props}>
      <span className={hasHoliday ? "text-red-600" : ""}>
        {bs.day}
      </span>
      {festivals.length > 0 && (
        <span className="festival-indicator" />
      )}
    </button>
  )
}

function CalendarWithApi() {
  return (
    <NepaliCalendar
      components={{
        DayButton: ApiDayButton
      }}
    />
  )
}
```

## Caching

The API client includes automatic caching:

- **Duration**: 1 hour by default
- **Storage**: In-memory (cleared on page refresh)
- **Key**: Based on endpoint and parameters

### Clear Cache Manually

```typescript
import { clearFestivalCache } from "@sushill/bikram-sambat"

clearFestivalCache()
```

### Custom Cache Duration

```typescript
const festivals = await fetchFestivalsForDate("2025-04-13", {
  cacheDuration: 1000 * 60 * 30 // 30 minutes
})
```

## Error Handling

The hybrid approach automatically handles errors:

```typescript
// If API fails, automatically falls back to static data
const festivals = await getFestivalsForDateHybrid(2081, 1, 1, {
  baseUrl: "https://api.example.com",
  timeout: 3000
})

// festivals will contain static data if API times out or fails
```

For API-only calls, handle errors explicitly:

```typescript
try {
  const festivals = await fetchFestivalsForDate("2025-04-13", {
    baseUrl: "https://api.example.com"
  })
  console.log("Festivals:", festivals)
} catch (error) {
  console.error("Failed to fetch festivals:", error)
  // Use static fallback
  const bs = adToBS(new Date("2025-04-13"))
  const staticFestivals = getFestivalsForDate(bs.year, bs.month, bs.day)
}
```

## Environment Variables

```bash
# .env
VITE_FESTIVAL_API_URL=https://api.nepalfestival.com
VITE_FESTIVAL_CACHE_DURATION=3600000
```

## TypeScript Types

```typescript
import type {
  Festival,
  FestivalCategory,
  FestivalApiConfig,
  FestivalProviderConfig,
  FestivalSummary,
  FestivalCalendarResponse
} from "@sushill/bikram-sambat"
```

## Setting Up Your API

If you're hosting the festival API yourself:

1. Deploy the API (based on your `holiday.json` OpenAPI spec)
2. Update the `baseUrl` in your configuration
3. Ensure CORS is configured for your domain
4. Add authentication if required

```typescript
const festivals = await fetchFestivalsForDate("2025-04-13", {
  baseUrl: "https://your-domain.com",
  // If your API requires auth:
  headers: {
    "Authorization": "Bearer your-token"
  }
})
```

## Performance Tips

1. **Use hybrid mode** for best user experience (instant static data + accurate API updates)
2. **Prefetch** festival data for visible month when calendar loads
3. **Batch requests** when possible using the timeline endpoint
4. **Configure cache** appropriately (longer for historical data, shorter for upcoming)

## Next Steps

- [ ] Set up your festival API
- [ ] Configure the baseUrl
- [ ] Test hybrid fallback behavior
- [ ] Implement custom caching strategy if needed
- [ ] Add authentication if required
