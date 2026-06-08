/**
 * Hybrid Festival Provider
 * 
 * Tries to fetch from API first, falls back to static data
 */

import type { Festival } from "./festivals"
import {
  NEPALI_FESTIVALS,
  getFestivalsForBSDate,
  getFestivalsForBSMonth,
} from "./festivals"
import {
  fetchFestivalsForMonth,
  fetchFestivalsForDate,
  type FestivalApiConfig,
} from "./festivals-api"
import { bsToAD } from "./index"

export type FestivalProviderConfig = FestivalApiConfig & {
  useApi?: boolean
  preferApi?: boolean
}

/**
 * Get festivals for a BS date with API fallback
 */
export async function getFestivalsForDateHybrid(
  bsYear: number,
  bsMonth: number,
  bsDay: number,
  config: FestivalProviderConfig = {}
): Promise<Festival[]> {
  const { useApi = true, preferApi = true } = config

  // Try API first if enabled and preferred
  if (useApi && preferApi) {
    try {
      // Convert BS to AD for API call
      const adDate = bsToAD(bsYear, bsMonth, bsDay)
      const dateStr = adDate.toISOString().split("T")[0]

      const apiFestivals = await fetchFestivalsForDate(dateStr, config)

      if (apiFestivals && apiFestivals.length > 0) {
        // Convert API response to our Festival type
        return apiFestivals.map((f) => ({
          id: f.id,
          name: f.name,
          nameNepali: f.name_nepali || f.name,
          description: f.description || "",
          category: (f.category as any) || "cultural",
          isNationalHoliday: f.is_national_holiday || false,
          significance: (f.significance_level || 3) as any,
          startDate: f.start_date,
          endDate: f.end_date || f.start_date,
          durationDays: 1,
          year: bsYear,
        }))
      }
    } catch (error) {
      console.warn("API fetch failed, falling back to static data:", error)
    }
  }

  // Fall back to static data
  return getFestivalsForBSDate(bsYear, bsMonth, bsDay)
}

/**
 * Get festivals for a BS month with API fallback
 */
export async function getFestivalsForMonthHybrid(
  bsYear: number,
  bsMonth: number,
  config: FestivalProviderConfig = {}
): Promise<Festival[]> {
  const { useApi = true, preferApi = true } = config

  // Try API first if enabled and preferred
  if (useApi && preferApi) {
    try {
      // Get the first day of the BS month to determine the Gregorian year/month
      const firstDay = bsToAD(bsYear, bsMonth, 1)
      const year = firstDay.getFullYear()
      const month = firstDay.getMonth() + 1

      const apiResponse = await fetchFestivalsForMonth(year, month, config)

      if (apiResponse && apiResponse.days) {
        // Extract all unique festivals from the month
        const festivalMap = new Map<string, Festival>()

        apiResponse.days.forEach((day) => {
          day.festivals.forEach((f) => {
            if (!festivalMap.has(f.id)) {
              festivalMap.set(f.id, {
                id: f.id,
                name: f.name,
                nameNepali: f.name_nepali || f.name,
                description: f.description || "",
                category: (f.category as any) || "cultural",
                isNationalHoliday: f.is_national_holiday || false,
                significance: (f.significance_level || 3) as any,
                startDate: f.start_date || day.date,
                endDate: f.end_date || day.date,
                durationDays: 1,
                year: bsYear,
              })
            }
          })
        })

        if (festivalMap.size > 0) {
          return Array.from(festivalMap.values())
        }
      }
    } catch (error) {
      console.warn("API fetch failed, falling back to static data:", error)
    }
  }

  // Fall back to static data
  return getFestivalsForBSMonth(bsMonth)
}

/**
 * Check if a date has festivals (with API support)
 */
export async function hasFestivalsOnDate(
  bsYear: number,
  bsMonth: number,
  bsDay: number,
  config: FestivalProviderConfig = {}
): Promise<boolean> {
  const festivals = await getFestivalsForDateHybrid(bsYear, bsMonth, bsDay, config)
  return festivals.length > 0
}

/**
 * Get static festivals (synchronous, always available)
 */
export { NEPALI_FESTIVALS, getFestivalsForBSDate, getFestivalsForBSMonth }
