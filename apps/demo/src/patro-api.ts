import { adToBS, type BikramSambatDate } from "@sushill/react-nepali-calendar"

const DEFAULT_PATRO_API_URL = "https://patro.onrender.com"

export const PATRO_API_URL =
  (import.meta.env.VITE_PATRO_API_URL as string | undefined)?.replace(/\/$/, "") ??
  DEFAULT_PATRO_API_URL

export type PatroFestival =
  | string
  | {
      id?: string
      name?: string
      name_en?: string
      name_ne?: string
      title?: string
      type?: string
      category?: string
      importance?: string
    }

export type PatroMonthDay = {
  bs_day: number
  date: string
  festivals?: PatroFestival[]
}

export type PatroMonth = {
  bs_year: number
  bs_month: number
  bs_month_name?: string
  bs_month_name_ne?: string
  month_start: string
  month_length: number
  days: PatroMonthDay[]
}

export type Holiday = {
  id: string
  name_en: string
  name_ne?: string
  start_date: string
  end_date: string
  duration_days: number
  type: string
  category: string
  importance: string
  notes?: string
}

export type HolidaysYear = {
  bs_year: number
  gregorian_range: {
    start: string
    end: string
  }
  location: {
    lat: number
    lon: number
    timezone: string
    name: string
  }
  count: number
  holidays: Holiday[]
  rule_version: string
  engine_version: string
  generated_at: string
}

type NamedElement = {
  name?: string
  name_ne?: string
  end_hours_clock?: string
  end_ghati_clock?: string
  next?: {
    name?: string
    name_ne?: string
    end_hours_clock?: string
    end_ghati_clock?: string
  }
}

export type DailyPanchanga = {
  date: string
  display?: {
    bs_ne?: string
    gregorian_en?: string
    ns_ne?: string
  }
  bs_date?: {
    year: number
    month: number
    day: number
    month_name_ne?: string
  }
  sunrise?: {
    local_time_short?: string
  }
  sunset?: {
    local_time_short?: string
  }
  moonrise?: {
    local_time_short?: string
  }
  moonset?: {
    local_time_short?: string
  }
  dinamaan?: {
    label_en?: string
    label_ne?: string
  }
  paksha?: {
    label_ne?: string
  }
  tithi?: NamedElement
  nakshatra?: NamedElement
  yoga?: NamedElement
  karana?: NamedElement
  chandra_rashi?: {
    name?: string
    name_ne?: string
  }
  ritu?: {
    season?: string
    name_ne?: string
  }
  festivals?: PatroFestival[]
}

type DailyPanchangaResponse = DailyPanchanga & {
  detail?: DailyPanchanga
}

const monthCache = new Map<string, Promise<PatroMonth>>()
const dayCache = new Map<string, Promise<DailyPanchanga>>()
const holidaysCache = new Map<number, Promise<HolidaysYear>>()

function fetchJson<T>(path: string): Promise<T> {
  return fetch(`${PATRO_API_URL}${path}`).then(async (response) => {
    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText)
      throw new Error(message || `Request failed with ${response.status}`)
    }

    return response.json() as Promise<T>
  })
}

export function warmPatroApi() {
  return fetch(`${PATRO_API_URL}/health`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => undefined)
}

export function getPatroMonth(bsYear: number, bsMonth: number) {
  const key = `${bsYear}-${bsMonth}`
  const cached = monthCache.get(key)
  if (cached) return cached

  const request = fetchJson<PatroMonth>(`/patro/${bsYear}/${bsMonth}?panchanga=false`).catch(
    (error: unknown) => {
      monthCache.delete(key)
      throw error
    },
  )
  monthCache.set(key, request)
  return request
}

export function getDailyPanchanga(date: Date) {
  const dateKey = formatBSPanchangaDate(date)
  const cached = dayCache.get(dateKey)
  if (cached) return cached

  const request = fetchJson<DailyPanchangaResponse>(`/panchanga/${dateKey}?festivals=true`)
    .then(normalizeDailyPanchanga)
    .catch((error: unknown) => {
      dayCache.delete(dateKey)
      throw error
    })
  dayCache.set(dateKey, request)
  return request
}

export function getHolidaysYear(bsYear: number) {
  const cached = holidaysCache.get(bsYear)
  if (cached) return cached

  const request = fetchJson<HolidaysYear>(`/holidays/${bsYear}`).catch((error: unknown) => {
    holidaysCache.delete(bsYear)
    throw error
  })
  holidaysCache.set(bsYear, request)
  return request
}

export function formatLocalISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatBSPanchangaDate(date: Date) {
  const bs = adToBS(date)
  return formatBSDateKey(bs)
}

function formatBSDateKey(date: BikramSambatDate) {
  const month = String(date.month).padStart(2, "0")
  const day = String(date.day).padStart(2, "0")

  return `${date.year}-${month}-${day}`
}

function normalizeDailyPanchanga(data: DailyPanchangaResponse): DailyPanchanga {
  if (!data.detail) return data

  return {
    ...data.detail,
    festivals: data.detail.festivals ?? data.festivals,
  }
}

export function formatFestivalName(festival: PatroFestival) {
  if (typeof festival === "string") return festival

  return (
    festival.name_ne ??
    festival.name_en ??
    festival.name ??
    festival.title ??
    festival.id ??
    "Festival"
  )
}

export function formatFestivalMeta(festival: PatroFestival) {
  if (typeof festival === "string") return undefined

  return [festival.category, festival.type, festival.importance].filter(Boolean).join(" · ")
}
