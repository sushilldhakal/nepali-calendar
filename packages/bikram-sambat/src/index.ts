import calendarData from "./bs-calendar-data.json"

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

/** Years 2080–2099: official lookup table. 2100–2200: extrapolated (3-year cycle + sankranti). */
export const BS_SUPPORTED_START_YEAR = calendarData.start_year
export const BS_SUPPORTED_END_YEAR = calendarData.end_year

function asMonthLengths(lengths: number[]): BsMonthLengths {
  if (lengths.length !== 12) {
    throw new Error(`BS month length row must have 12 entries, got ${lengths.length}`)
  }
  return lengths as unknown as BsMonthLengths
}

const BS_YEAR_MONTH_LENGTHS: Record<number, BsMonthLengths> = Object.fromEntries(
  Object.entries(calendarData.month_lengths).map(([year, lengths]) => [
    Number(year),
    asMonthLengths(lengths),
  ]),
)

const BAISAKH_1_AD: Record<number, string> = Object.fromEntries(
  Object.entries(calendarData.baisakh_1_ad).map(([year, iso]) => [Number(year), iso]),
)

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

/** True when `year` has embedded lookup month lengths (offline conversion). */
export function isBSSupportedYear(year: number): boolean {
  return year >= BS_SUPPORTED_START_YEAR && year <= BS_SUPPORTED_END_YEAR
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
    return { year: BS_SUPPORTED_START_YEAR, month: 1, day: 1, monthName: BS_MONTH_NAMES[0] }
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
