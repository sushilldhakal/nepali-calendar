/**
 * Hybrid Festival Provider
 *
 * Tries to fetch from the Patro server API first; falls back to the local
 * static dataset if the server is unreachable or returns no data.
 */

import type { Festival } from "./festivals"
import {
  NEPALI_FESTIVALS,
  getFestivalsForBSDate,
  getFestivalsForBSMonth,
} from "./festivals"
import {
  fetchFestivalsForBSYear,
  fetchFestivalsForDate,
  fetchSpecialMonths,
  patroFestivalToFestival,
  type FestivalApiConfig,
  type SpecialMonthsResponse,
} from "./festivals-api"
import { bsToAD, adToBS } from "./index"

export type FestivalProviderConfig = FestivalApiConfig & {
  useApi?: boolean
  preferApi?: boolean
}

// ---------------------------------------------------------------------------
// Per-date lookup
// ---------------------------------------------------------------------------

/**
 * Get festivals for a BS date with Patro server API fallback.
 *
 * The server is tried first when `useApi && preferApi` (the default). On any
 * failure it silently falls back to the static dataset.
 */
export async function getFestivalsForDateHybrid(
  bsYear: number,
  bsMonth: number,
  bsDay: number,
  config: FestivalProviderConfig = {},
): Promise<Festival[]> {
  const { useApi = true, preferApi = true } = config

  if (useApi && preferApi) {
    try {
      const adDate = bsToAD(bsYear, bsMonth, bsDay)
      const dateStr = adDate.toISOString().split("T")[0]
      const entries = await fetchFestivalsForDate(dateStr, config)
      if (entries.length > 0) return entries.map(patroFestivalToFestival)
    } catch (err) {
      console.warn("[patro] date fetch failed, using static data:", err)
    }
  }

  return getFestivalsForBSDate(bsYear, bsMonth, bsDay)
}

// ---------------------------------------------------------------------------
// Per-month lookup
// ---------------------------------------------------------------------------

/**
 * Get festivals for a BS month with Patro server API fallback.
 *
 * Fetches the full BS-year payload and filters to the requested month,
 * which means subsequent calls in the same year are served from cache.
 */
export async function getFestivalsForMonthHybrid(
  bsYear: number,
  bsMonth: number,
  config: FestivalProviderConfig = {},
): Promise<Festival[]> {
  const { useApi = true, preferApi = true } = config

  if (useApi && preferApi) {
    try {
      const payload = await fetchFestivalsForBSYear(bsYear, config)
      if (payload && payload.festivals.length > 0) {
        // Filter to festivals that overlap this BS month
        const monthStart = bsToAD(bsYear, bsMonth, 1)
        const lastDay = getLastDayOfBSMonth(bsYear, bsMonth)
        const monthEnd = bsToAD(bsYear, bsMonth, lastDay)

        const filtered = payload.festivals.filter((f) => {
          const start = new Date(f.start_date)
          const end = new Date(f.end_date)
          return start <= monthEnd && end >= monthStart
        })

        if (filtered.length > 0) return filtered.map(patroFestivalToFestival)
      }
    } catch (err) {
      console.warn("[patro] month fetch failed, using static data:", err)
    }
  }

  return getFestivalsForBSMonth(bsMonth)
}

// ---------------------------------------------------------------------------
// Special months (Adhik Maas / Kshaya Maas)
// ---------------------------------------------------------------------------

/**
 * Fetch Adhik Maas and Kshaya Maas metadata for a BS year.
 *
 * Returns null if the server is unreachable. The `adhik_maas.has_adhik_maas`
 * flag tells you whether an extra intercalary month (Mala Maas) occurs this
 * year, which causes festival dates to shift by one lunar month.
 *
 * @example
 * const info = await getSpecialMonths(2082)
 * if (info?.adhik_maas.has_adhik_maas) {
 *   const m = info.adhik_maas
 *   console.log(`Adhik ${m.month_name}: ${m.start_date} – ${m.end_date}`)
 * }
 */
export async function getSpecialMonths(
  bsYear: number,
  config: FestivalApiConfig = {},
): Promise<SpecialMonthsResponse | null> {
  return fetchSpecialMonths(bsYear, config)
}

// ---------------------------------------------------------------------------
// Boolean helpers
// ---------------------------------------------------------------------------

/**
 * Check whether any festivals are active on a given BS date.
 */
export async function hasFestivalsOnDate(
  bsYear: number,
  bsMonth: number,
  bsDay: number,
  config: FestivalProviderConfig = {},
): Promise<boolean> {
  const festivals = await getFestivalsForDateHybrid(bsYear, bsMonth, bsDay, config)
  return festivals.length > 0
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { NEPALI_FESTIVALS, getFestivalsForBSDate, getFestivalsForBSMonth }

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function getLastDayOfBSMonth(bsYear: number, bsMonth: number): number {
  try {
    // bsToAD the 1st of the NEXT month, then subtract 1 day
    const nextMonth = bsMonth === 12 ? 1 : bsMonth + 1
    const nextYear = bsMonth === 12 ? bsYear + 1 : bsYear
    const nextMonthStart = bsToAD(nextYear, nextMonth, 1)
    nextMonthStart.setDate(nextMonthStart.getDate() - 1)
    return adToBS(nextMonthStart).day
  } catch {
    return 30 // safe fallback
  }
}
