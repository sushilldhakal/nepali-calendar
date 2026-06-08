export const BS_MONTH_NAMES = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const

export type BikramSambatDate = {
  year: number
  month: number
  day: number
  monthName: string
}

type BsMonthLengths = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

/** Authoritative month lengths for supported BS years, Baisakh through Chaitra. */
const BS_YEAR_MONTH_LENGTHS: Record<number, BsMonthLengths> = {
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2085: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2086: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2087: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2088: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2090: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
}

/** Baisakh 1 AD dates for BS years 2080–2091. */
const BAISAKH_1_AD: Record<number, string> = {
  2080: "2023-04-14",
  2081: "2024-04-13",
  2082: "2025-04-14",
  2083: "2026-04-14",
  2084: "2027-04-14",
  2085: "2028-04-13",
  2086: "2029-04-14",
  2087: "2030-04-14",
  2088: "2031-04-14",
  2089: "2032-04-13",
  2090: "2033-04-14",
  2091: "2034-04-14",
}

export const BS_SUPPORTED_START_YEAR = 2080
export const BS_SUPPORTED_END_YEAR = 2090

type BsMonthStart = {
  year: number
  month: number
  adMs: number
}

function parseAdDateOnly(isoDate: string): number {
  const parts = isoDate.split("-").map(Number)
  const y = parts[0] ?? 0
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  return Date.UTC(y, m - 1, d)
}

function localDateFromUtcMs(ms: number): Date {
  const date = new Date(ms)
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function buildMonthStarts(): BsMonthStart[] {
  const starts: BsMonthStart[] = []
  for (let year = BS_SUPPORTED_START_YEAR; year <= BS_SUPPORTED_END_YEAR; year += 1) {
    const baisakh1 = BAISAKH_1_AD[year]
    if (!baisakh1) continue
    let cursor = parseAdDateOnly(baisakh1)
    for (let month = 1; month <= 12; month += 1) {
      starts.push({ year, month, adMs: cursor })
      const days = BS_YEAR_MONTH_LENGTHS[year]?.[month - 1] ?? 30
      cursor += days * 86_400_000
    }
  }
  return starts
}

const BS_MONTH_STARTS = buildMonthStarts()

function normalizeToUtcDate(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

function monthStartFor(year: number, month: number): BsMonthStart | undefined {
  return BS_MONTH_STARTS.find((start) => start.year === year && start.month === month)
}

export function getBSMonthLength(year: number, month: number): number {
  const monthLength = BS_YEAR_MONTH_LENGTHS[year]?.[month - 1]
  if (monthLength) return monthLength

  const current = monthStartFor(year, month)
  if (!current) return 30

  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const next =
    monthStartFor(nextYear, nextMonth) ??
    (nextMonth === 1 && BAISAKH_1_AD[nextYear]
      ? { year: nextYear, month: nextMonth, adMs: parseAdDateOnly(BAISAKH_1_AD[nextYear]) }
      : undefined)

  if (!next) return 30
  return Math.round((next.adMs - current.adMs) / 86_400_000)
}

export function bsToAD(year: number, month: number, day: number): Date {
  const monthStart = monthStartFor(year, month) ?? BS_MONTH_STARTS[0]
  if (!monthStart) return new Date(year, month - 1, day)

  const monthLength = getBSMonthLength(year, month)
  const safeDay = Math.min(Math.max(1, day), monthLength)
  return localDateFromUtcMs(monthStart.adMs + (safeDay - 1) * 86_400_000)
}

export function adToBS(date: Date): BikramSambatDate {
  const adMs = normalizeToUtcDate(date)
  const fallback = BS_MONTH_STARTS[0]
  if (!fallback) {
    return { year: 2080, month: 1, day: 1, monthName: BS_MONTH_NAMES[0] }
  }

  let match = fallback
  for (const start of BS_MONTH_STARTS) {
    if (start.adMs <= adMs) {
      match = start
    } else {
      break
    }
  }

  const day = Math.max(1, Math.floor((adMs - match.adMs) / 86_400_000) + 1)
  const monthName = BS_MONTH_NAMES[match.month - 1] ?? BS_MONTH_NAMES[0]
  return { year: match.year, month: match.month, day, monthName }
}

export function formatBSDate(date: Date): string {
  const bs = adToBS(date)
  return `${bs.monthName} ${bs.day}, ${bs.year}`
}

export function formatBSMonthYear(date: Date): string {
  const bs = adToBS(date)
  return `${bs.monthName} ${bs.year}`
}

export function getBSMonthADRange(date: Date): { start: Date; end: Date } {
  const bs = adToBS(date)
  return {
    start: bsToAD(bs.year, bs.month, 1),
    end: bsToAD(bs.year, bs.month, getBSMonthLength(bs.year, bs.month)),
  }
}

export function getBSPayPeriodLabel(startDate: string, endDate: string): string {
  const startMs = parseAdDateOnly(startDate.slice(0, 10))
  const endMs = parseAdDateOnly(endDate.slice(0, 10))
  const midpoint = new Date((startMs + endMs) / 2)
  const bs = adToBS(midpoint)
  return `${bs.monthName} ${bs.year}`
}

// Export festival utilities
export {
  NEPALI_FESTIVALS,
  getFestivalsForDate,
  getFestivalsForBSDate,
  getFestivalsForMonth,
  getFestivalsForBSMonth,
  getNationalHolidays,
  getFestivalsByCategory,
  isNationalHoliday,
  isNationalHolidayBS,
  getFestivalById,
  type Festival,
  type FestivalCategory,
} from "./festivals"

// Export API festival utilities
export {
  fetchFestivalsForMonth,
  fetchFestivalsForDate,
  fetchUpcomingFestivals,
  apiFestivalToFestival,
  clearFestivalCache,
  type FestivalApiConfig,
  type FestivalSummary,
  type FestivalCalendarResponse,
} from "./festivals-api"

// Export hybrid festival utilities
export {
  getFestivalsForDateHybrid,
  getFestivalsForMonthHybrid,
  hasFestivalsOnDate,
  type FestivalProviderConfig,
} from "./festivals-hybrid"

// Export holiday data and utilities
export {
  holidays,
  holiday,
  getHolidaysByYear,
  getAvailableYears,
  hasHolidayDataForYear,
  type HolidayFestival,
  type HolidayYear,
} from "./holiday"
