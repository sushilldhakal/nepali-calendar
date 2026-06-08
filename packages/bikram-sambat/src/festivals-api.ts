/**
 * Festival API Integration
 * 
 * Fetches festival data from the Nepal Festival Discovery API
 * Falls back to static data if API is unavailable
 */

import type { Festival } from "./festivals"

export type FestivalApiConfig = {
  baseUrl?: string
  timeout?: number
  cacheDuration?: number // in milliseconds
}

export type FestivalSummary = {
  id: string
  name: string
  name_nepali?: string
  description?: string
  start_date: string // YYYY-MM-DD
  end_date?: string
  is_national_holiday?: boolean
  category?: string
  significance_level?: number
}

export type CalendarDayFestival = {
  date: string
  festivals: FestivalSummary[]
}

export type FestivalCalendarResponse = {
  year: number
  month: number
  days: CalendarDayFestival[]
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()

const DEFAULT_CONFIG: Required<FestivalApiConfig> = {
  baseUrl: "https://api.nepalfestival.com", // Update with actual API URL
  timeout: 5000,
  cacheDuration: 1000 * 60 * 60, // 1 hour
}

/**
 * Fetch festivals for a specific month from the API
 */
export async function fetchFestivalsForMonth(
  year: number,
  month: number,
  config: FestivalApiConfig = {}
): Promise<FestivalCalendarResponse | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const cacheKey = `festivals-${year}-${month}`

  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < cfg.cacheDuration) {
    return cached.data
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), cfg.timeout)

    const response = await fetch(
      `${cfg.baseUrl}/api/festivals/calendar/${year}/${month}`,
      {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Festival API returned ${response.status}`)
      return null
    }

    const data = await response.json()

    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() })

    return data
  } catch (error) {
    console.warn("Failed to fetch festivals from API:", error)
    return null
  }
}

/**
 * Fetch festivals for a specific date
 */
export async function fetchFestivalsForDate(
  date: string, // YYYY-MM-DD
  config: FestivalApiConfig = {}
): Promise<FestivalSummary[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const cacheKey = `festivals-date-${date}`

  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < cfg.cacheDuration) {
    return cached.data
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), cfg.timeout)

    const response = await fetch(
      `${cfg.baseUrl}/api/festivals/on-date/${date}`,
      {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Festival API returned ${response.status}`)
      return []
    }

    const data = await response.json()

    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() })

    return data
  } catch (error) {
    console.warn("Failed to fetch festivals from API:", error)
    return []
  }
}

/**
 * Fetch upcoming festivals
 */
export async function fetchUpcomingFestivals(
  days: number = 30,
  config: FestivalApiConfig = {}
): Promise<FestivalSummary[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const cacheKey = `festivals-upcoming-${days}`

  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < cfg.cacheDuration) {
    return cached.data
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), cfg.timeout)

    const response = await fetch(
      `${cfg.baseUrl}/api/festivals/upcoming?days=${days}`,
      {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Festival API returned ${response.status}`)
      return []
    }

    const data = await response.json()
    const festivals = data.festivals || []

    // Cache the result
    cache.set(cacheKey, { data: festivals, timestamp: Date.now() })

    return festivals
  } catch (error) {
    console.warn("Failed to fetch upcoming festivals from API:", error)
    return []
  }
}

/**
 * Convert API festival to our Festival type
 */
export function apiFestivalToFestival(apiFestival: FestivalSummary): Festival {
  return {
    id: apiFestival.id,
    name: apiFestival.name,
    nameNepali: apiFestival.name_nepali || apiFestival.name,
    description: apiFestival.description || "",
    category: (apiFestival.category as any) || "cultural",
    isNationalHoliday: apiFestival.is_national_holiday || false,
    significance: (apiFestival.significance_level || 3) as any,
    startDate: apiFestival.start_date,
    endDate: apiFestival.end_date || apiFestival.start_date,
    durationDays: 1,
    year: new Date(apiFestival.start_date).getFullYear(),
  }
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearFestivalCache(): void {
  cache.clear()
}
