/**
 * Patro Server API Client
 *
 * Fetches festival, holiday, and panchanga data from the Surya Panchanga API
 * (github.com/sushilldhakal/patro). Falls back gracefully if unavailable.
 *
 * Default base URL points to the production server. Override via config:
 *   { baseUrl: "http://localhost:8000" }
 */

import type { Festival } from "./festivals"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export type FestivalApiConfig = {
  baseUrl?: string
  timeout?: number
  cacheDuration?: number // milliseconds
}

const DEFAULT_CONFIG: Required<FestivalApiConfig> = {
  baseUrl: "https://84-235-248-118.sslip.io",
  timeout: 8000,
  cacheDuration: 1000 * 60 * 60, // 1 hour
}

// ---------------------------------------------------------------------------
// Patro server response types
// ---------------------------------------------------------------------------

/** A single festival/holiday entry as returned by /nepal/festivals */
export type PatroFestivalEntry = {
  id: string
  name_en: string
  name_ne: string | null
  start_date: string // "YYYY-MM-DD"
  end_date: string   // "YYYY-MM-DD"
  duration_days: number
  type: "lunar" | "solar" | "bs_fixed"
  category: string | null
  importance: string | null
  is_public_holiday: boolean
  notes: string | null
  bs_start_date?: string // "YYYY-MM-DD BS"
  bs_end_date?: string
}

/** Response shape for /nepal/festivals?year=YYYY&era=bs */
export type PatroFestivalsResponse = {
  bs_year?: number
  ad_year?: number
  era: "bs" | "ad"
  gregorian_range?: { start: string; end: string }
  count: number
  festivals: PatroFestivalEntry[]
}

/** Response shape for /nepal/holidays?year=YYYY */
export type PatroHolidaysResponse = {
  bs_year?: number
  ad_year?: number
  era: "bs" | "ad"
  gregorian_range?: { start: string; end: string }
  count: number
  holidays: PatroFestivalEntry[]
}

/** Adhik Maas (extra intercalary month) info */
export type AdhikMaasInfo =
  | { has_adhik_maas: false }
  | {
      has_adhik_maas: true
      month_name: string
      full_name_en: string
      full_name_ne: string
      start_date: string
      end_date: string
      purnima_date: string
      note: string
    }

/** Kshaya Maas (extremely rare lost month) info */
export type KshayaMaasInfo =
  | { is_kshaya: false }
  | {
      is_kshaya: true
      first_sankranti_rashi: number
      second_sankranti_rashi: number
      first_rashi_name: string
      second_rashi_name: string
      description: string
      start_date: string
      end_date: string
    }

/** Response shape for /nepal/special-months/{bs_year} */
export type SpecialMonthsResponse = {
  bs_year: number
  gregorian_range: { start: string; end: string }
  location: Record<string, unknown>
  adhik_maas: AdhikMaasInfo
  kshaya_maas: KshayaMaasInfo
}

/** Daily panchanga response from /nepal/panchanga/{date} */
export type PatroPanchangaResponse = {
  date: string
  bs_date: string
  tithi: { name: string; name_ne: string; number: number; paksha: string }
  nakshatra: { name: string; name_ne: string }
  yoga?: { name: string }
  vaara: { name_english: string; name_ne: string }
  sunrise?: { local_time_short: string }
  sunset?: { local_time_short: string }
  is_public_holiday: boolean
  festivals: (PatroFestivalEntry & { is_public_holiday: boolean })[]
}

// ---------------------------------------------------------------------------
// Legacy types (kept for backwards compatibility)
// ---------------------------------------------------------------------------

/** @deprecated Use PatroFestivalEntry instead */
export type FestivalSummary = {
  id: string
  name: string
  name_nepali?: string
  description?: string
  start_date: string
  end_date?: string
  is_national_holiday?: boolean
  category?: string
  significance_level?: number
}

/** @deprecated Use PatroFestivalsResponse instead */
export type CalendarDayFestival = {
  date: string
  festivals: FestivalSummary[]
}

/** @deprecated Use PatroFestivalsResponse instead */
export type FestivalCalendarResponse = {
  year: number
  month: number
  days: CalendarDayFestival[]
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const cache = new Map<string, { data: unknown; timestamp: number }>()

function getCached<T>(key: string, maxAge: number): T | undefined {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < maxAge) return entry.data as T
  return undefined
}

function setCached(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function fetchJson<T>(
  url: string,
  timeout: number,
): Promise<T | null> {
  try {
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), timeout)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    })
    clearTimeout(tid)
    if (!res.ok) {
      console.warn(`[patro-api] HTTP ${res.status} for ${url}`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.warn("[patro-api] fetch failed:", err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all festivals for a BS year from the Patro server.
 *
 * @param bsYear  Bikram Sambat year (e.g. 2082)
 * @param config  Optional config override
 */
export async function fetchFestivalsForBSYear(
  bsYear: number,
  config: FestivalApiConfig = {},
): Promise<PatroFestivalsResponse | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `patro-festivals-bs-${bsYear}`
  const hit = getCached<PatroFestivalsResponse>(key, cfg.cacheDuration)
  if (hit) return hit

  const url = `${cfg.baseUrl}/nepal/festivals?year=${bsYear}&era=bs`
  const data = await fetchJson<PatroFestivalsResponse>(url, cfg.timeout)
  if (data) setCached(key, data)
  return data
}

/**
 * Fetch public holidays for a BS year.
 */
export async function fetchHolidaysForBSYear(
  bsYear: number,
  config: FestivalApiConfig = {},
): Promise<PatroHolidaysResponse | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `patro-holidays-bs-${bsYear}`
  const hit = getCached<PatroHolidaysResponse>(key, cfg.cacheDuration)
  if (hit) return hit

  const url = `${cfg.baseUrl}/nepal/holidays?year=${bsYear}`
  const data = await fetchJson<PatroHolidaysResponse>(url, cfg.timeout)
  if (data) setCached(key, data)
  return data
}

/**
 * Fetch Adhik Maas and Kshaya Maas info for a BS year.
 *
 * Useful for displaying "Adhik Jestha" banners or warning that a rare Kshaya
 * month has caused festival dates to shift.
 */
export async function fetchSpecialMonths(
  bsYear: number,
  config: FestivalApiConfig = {},
): Promise<SpecialMonthsResponse | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `patro-special-months-${bsYear}`
  const hit = getCached<SpecialMonthsResponse>(key, cfg.cacheDuration)
  if (hit) return hit

  const url = `${cfg.baseUrl}/nepal/special-months/${bsYear}`
  const data = await fetchJson<SpecialMonthsResponse>(url, cfg.timeout)
  if (data) setCached(key, data)
  return data
}

/**
 * Fetch festivals active on a specific Gregorian date.
 */
export async function fetchFestivalsForDate(
  adDate: string, // "YYYY-MM-DD"
  config: FestivalApiConfig = {},
): Promise<PatroFestivalEntry[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `patro-festivals-date-${adDate}`
  const hit = getCached<PatroFestivalEntry[]>(key, cfg.cacheDuration)
  if (hit) return hit

  const url = `${cfg.baseUrl}/festivals/${adDate}?era=ad`
  const data = await fetchJson<{ festivals: PatroFestivalEntry[] }>(url, cfg.timeout)
  const festivals = data?.festivals ?? []
  setCached(key, festivals)
  return festivals
}

/**
 * Fetch daily panchanga + festival data for a specific date (BS format: YYYY-MM-DD).
 */
export async function fetchDailyPanchanga(
  bsDate: string, // "YYYY-MM-DD" in BS era
  config: FestivalApiConfig = {},
): Promise<PatroPanchangaResponse | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `patro-panchanga-${bsDate}`
  const hit = getCached<PatroPanchangaResponse>(key, cfg.cacheDuration)
  if (hit) return hit

  const url = `${cfg.baseUrl}/nepal/panchanga/${bsDate}?era=bs`
  const data = await fetchJson<PatroPanchangaResponse>(url, cfg.timeout)
  if (data) setCached(key, data)
  return data
}

// ---------------------------------------------------------------------------
// About / methodology
// ---------------------------------------------------------------------------

/** One anga (limb) of the panchanga as returned by /about */
export type PanchangaAngaInfo = {
  name: string
  name_ne: string
  division: string | null
  description: string
}

/** Full /about response shape */
export type PatroAboutResponse = {
  name: string
  version: string
  repository: string
  calculation_engine: {
    framework: string
    ephemeris: string
    ayanamsa: string
    sunrise_model: string
    udaya_tithi: string
  }
  panchangas: PanchangaAngaInfo[]
  special_months: Record<string, { description: string; frequency?: string; also_known_as?: string[]; next_known?: string; last_occurrence?: string; next_predicted?: string }>
  references: { id: number; title: string; url: string }[]
}

/**
 * Fetch methodology, references, and version metadata from the Patro server.
 */
export async function fetchAbout(
  config: FestivalApiConfig = {},
): Promise<PatroAboutResponse | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = "patro-about"
  const hit = getCached<PatroAboutResponse>(key, cfg.cacheDuration)
  if (hit) return hit

  const url = `${cfg.baseUrl}/about`
  const data = await fetchJson<PatroAboutResponse>(url, cfg.timeout)
  if (data) setCached(key, data)
  return data
}

/**
 * Fetch festivals for a Gregorian calendar month.
 *
 * @deprecated Prefer fetchFestivalsForBSYear; this wrapper is kept for
 *             backwards compatibility with older consumer code.
 */
export async function fetchFestivalsForMonth(
  adYear: number,
  adMonth: number,
  config: FestivalApiConfig = {},
): Promise<FestivalCalendarResponse | null> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `patro-festivals-ad-${adYear}-${adMonth}`
  const hit = getCached<FestivalCalendarResponse>(key, cfg.cacheDuration)
  if (hit) return hit

  const url = `${cfg.baseUrl}/nepal/patro/ad/${adYear}/${adMonth}`
  const raw = await fetchJson<{ days: Array<{ date_ad: string; festivals: PatroFestivalEntry[] }> }>(
    url,
    cfg.timeout,
  )
  if (!raw) return null

  // Reshape into legacy FestivalCalendarResponse format
  const data: FestivalCalendarResponse = {
    year: adYear,
    month: adMonth,
    days: raw.days.map((d) => ({
      date: d.date_ad,
      festivals: d.festivals.map((f) => ({
        id: f.id,
        name: f.name_en,
        name_nepali: f.name_ne ?? undefined,
        start_date: f.start_date,
        end_date: f.end_date,
        is_national_holiday: f.is_public_holiday,
        category: f.category ?? undefined,
      })),
    })),
  }
  setCached(key, data)
  return data
}

/**
 * Fetch upcoming festivals (next N days) — uses the daily patro endpoint.
 *
 * @deprecated Prefer fetchFestivalsForBSYear with date filtering.
 */
export async function fetchUpcomingFestivals(
  days: number = 30,
  config: FestivalApiConfig = {},
): Promise<FestivalSummary[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const key = `patro-upcoming-${days}-${year}-${month}`
  const hit = getCached<FestivalSummary[]>(key, cfg.cacheDuration)
  if (hit) return hit

  const url = `${cfg.baseUrl}/nepal/patro/ad/${year}/${month}`
  const raw = await fetchJson<{ days: Array<{ date_ad: string; festivals: PatroFestivalEntry[] }> }>(
    url,
    cfg.timeout,
  )
  if (!raw) return []

  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() + days)
  const todayStr = today.toISOString().split("T")[0]
  const cutoffStr = cutoff.toISOString().split("T")[0]

  const seen = new Set<string>()
  const results: FestivalSummary[] = []
  for (const day of raw.days) {
    if (day.date_ad < todayStr || day.date_ad > cutoffStr) continue
    for (const f of day.festivals) {
      if (!seen.has(f.id)) {
        seen.add(f.id)
        results.push({
          id: f.id,
          name: f.name_en,
          name_nepali: f.name_ne ?? undefined,
          start_date: f.start_date,
          end_date: f.end_date,
          is_national_holiday: f.is_public_holiday,
          category: f.category ?? undefined,
        })
      }
    }
  }
  setCached(key, results)
  return results
}

// ---------------------------------------------------------------------------
// Conversion helper
// ---------------------------------------------------------------------------

/**
 * Convert a PatroFestivalEntry from the server into our local Festival type.
 */
export function patroFestivalToFestival(f: PatroFestivalEntry): Festival {
  return {
    id: f.id,
    name: f.name_en,
    nameNepali: f.name_ne ?? f.name_en,
    description: f.notes ?? "",
    category: (f.category as Festival["category"]) ?? "cultural",
    isNationalHoliday: f.is_public_holiday,
    significance: f.importance === "national" ? 5 : f.importance === "regional" ? 3 : 2,
    startDate: f.start_date,
    endDate: f.end_date,
    durationDays: f.duration_days,
    year: new Date(f.start_date).getFullYear(),
  }
}

/**
 * @deprecated Use patroFestivalToFestival instead.
 */
export function apiFestivalToFestival(f: FestivalSummary): Festival {
  return {
    id: f.id,
    name: f.name,
    nameNepali: f.name_nepali ?? f.name,
    description: f.description ?? "",
    category: (f.category as Festival["category"]) ?? "cultural",
    isNationalHoliday: f.is_national_holiday ?? false,
    significance: (f.significance_level ?? 3) as Festival["significance"],
    startDate: f.start_date,
    endDate: f.end_date ?? f.start_date,
    durationDays: 1,
    year: new Date(f.start_date).getFullYear(),
  }
}

/**
 * Clear the in-memory cache (useful for testing or forced refresh).
 */
export function clearFestivalCache(): void {
  cache.clear()
}
