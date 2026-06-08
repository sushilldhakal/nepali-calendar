import { adToBS, type BikramSambatDate } from "@sushill/react-nepali-calendar"

/** Oracle VM API — override with VITE_PATRO_API_URL in .env.local */
const DEFAULT_PATRO_API_URL = "https://84-235-248-118.sslip.io"

function resolvePatroApiUrl() {
  const configured = (import.meta.env.VITE_PATRO_API_URL as string | undefined)?.replace(
    /\/$/,
    "",
  )
  if (configured) return configured
  // Dev server proxies API routes — same origin, no CORS preflight.
  if (import.meta.env.DEV) return ""
  return DEFAULT_PATRO_API_URL
}

export const PATRO_API_URL = resolvePatroApiUrl()

export const PATRO_API_DISPLAY_HOST = PATRO_API_URL
  ? new URL(PATRO_API_URL).host
  : new URL(DEFAULT_PATRO_API_URL).host

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
      is_public_holiday?: boolean
    }

export type PanchangaMarkers = {
  is_purnima?: boolean
  is_amavasya?: boolean
  is_ekadashi?: boolean
}

export type PatroDayPanchanga = {
  display?: {
    bs_ne?: string
    gregorian_en?: string
    ns_ne?: string
  }
  vaara?: {
    number?: number
    name_ne?: string
    name_english?: string
  }
  tithi?: {
    name_ne?: string
    name?: string
  }
  paksha?: {
    label_ne?: string
  }
  markers?: PanchangaMarkers
}

export type PatroMonthDay = {
  bs_day: number
  date: string
  festivals?: PatroFestival[]
  panchanga?: PatroDayPanchanga
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

export type NamedElement = {
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

export type DayObservanceKind = "holiday" | "festival" | "shraddha" | "marker"

export type DayObservance = {
  id: string
  text: string
  kind: DayObservanceKind
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
  ns_date?: {
    year?: number
    month_name_ne?: string
    label_ne?: string
  }
  vaara?: {
    name_ne?: string
    name_english?: string
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
  lunar_month?: {
    name?: string
    full_name?: string
    is_adhik?: boolean
  }
  aayan?: {
    name_ne?: string
    name?: string
  }
  surya_rashi?: {
    name_ne?: string
    name?: string
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
  markers?: PanchangaMarkers
  planets?: Record<string, { rashi_name_ne?: string; rashi_name?: string; degrees?: number }>
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

export function getPatroMonth(
  bsYear: number,
  bsMonth: number,
  options?: { panchanga?: boolean },
) {
  const includePanchanga = options?.panchanga ?? false
  const key = `${bsYear}-${bsMonth}-${includePanchanga ? "full" : "lite"}`
  const cached = monthCache.get(key)
  if (cached) return cached

  const request = fetchJson<PatroMonth>(
    `/patro/${bsYear}/${bsMonth}?panchanga=${includePanchanga}`,
  ).catch(
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

function isPublicHolidayEntry(festival: PatroFestival) {
  if (typeof festival === "string") return false
  return festival.is_public_holiday === true || festival.importance === "national"
}

export function formatPanchangaElementNe(element?: NamedElement) {
  if (!element) return undefined

  const name = element.name_ne ?? element.name
  if (!name) return undefined

  const nextName = element.next?.name_ne ?? element.next?.name
  const endTime = element.end_hours_clock ?? element.end_ghati_clock

  if (nextName && endTime) return `${name}, ${endTime} बजेपछि ${nextName}`
  if (endTime) return `${name}, ${endTime} सम्म`
  return name
}

export function getShraddhaLabel(tithiName?: string) {
  if (!tithiName) return undefined
  if (tithiName === "पूर्णिमा" || tithiName === "अमावास्या") return undefined
  return `${tithiName} श्राद्ध`
}

export function buildDayObservanceLabels(day?: PatroMonthDay): DayObservance[] {
  if (!day) return []

  const labels: DayObservance[] = []

  for (const [index, festival] of (day.festivals ?? []).entries()) {
    const text = formatFestivalName(festival)
    labels.push({
      id: typeof festival === "string" ? `festival-${index}` : (festival.id ?? `festival-${index}`),
      text,
      kind: isPublicHolidayEntry(festival) ? "holiday" : "festival",
    })
  }

  const panchanga = day.panchanga
  const tithiName = panchanga?.tithi?.name_ne ?? panchanga?.tithi?.name
  const markers = panchanga?.markers

  if (markers?.is_purnima) {
    labels.push({ id: "marker-purnima", text: "पूर्णिमा", kind: "marker" })
  }
  if (markers?.is_amavasya) {
    labels.push({ id: "marker-amavasya", text: "अमावास्या", kind: "marker" })
  }
  if (markers?.is_ekadashi) {
    labels.push({ id: "marker-ekadashi", text: "एकादशी", kind: "marker" })
  }

  const shraddha = getShraddhaLabel(tithiName)
  if (shraddha && !labels.some((label) => label.text.includes(tithiName ?? ""))) {
    labels.push({ id: `shraddha-${tithiName}`, text: shraddha, kind: "shraddha" })
  }

  return labels.sort((left, right) => {
    const priority: Record<DayObservanceKind, number> = {
      holiday: 0,
      festival: 1,
      marker: 2,
      shraddha: 3,
    }
    return priority[left.kind] - priority[right.kind]
  })
}
