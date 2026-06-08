import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sunrise,
  Sunset,
  X,
} from "lucide-react"
import {
  BS_MONTH_NAMES,
  BS_SUPPORTED_END_YEAR,
  BS_SUPPORTED_START_YEAR,
  adToBS,
  bsToAD,
  getBSMonthLength,
} from "@sushill/react-nepali-calendar"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildDayObservanceLabels,
  formatFestivalName,
  formatPanchangaElementNe,
  getDailyPanchanga,
  getPatroMonth,
  PATRO_API_DISPLAY_HOST,
  type DailyPanchanga,
  type DayObservance,
  type PatroMonth,
  type PatroMonthDay,
} from "@/patro-api"

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const
const MAX_CELL_OBSERVANCES = 2

const BS_MONTH_NAMES_NE = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भाद्र",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
] as const

const WEEKDAYS = [
  { ne: "आइतवार", en: "Sunday" },
  { ne: "सोमवार", en: "Monday" },
  { ne: "मङ्गलवार", en: "Tuesday" },
  { ne: "बुधवार", en: "Wednesday" },
  { ne: "बिहिवार", en: "Thursday" },
  { ne: "शुक्रवार", en: "Friday" },
  { ne: "शनिवार", en: "Saturday" },
] as const

const DEFAULT_BS_YEAR = 2083
const DEFAULT_BS_MONTH = 2

type CalendarCell = {
  bsYear: number
  bsMonth: number
  bsDay: number
  date: Date
  inMonth: boolean
}

type DialogView = "summary" | "full"

function toNepaliDigits(value: number) {
  return String(value)
    .split("")
    .map((digit) => NEPALI_DIGITS[Number(digit)] ?? digit)
    .join("")
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load Patro data."
}

function observanceClassName(kind: DayObservance["kind"], selected?: boolean) {
  if (selected) return "text-white/95"

  switch (kind) {
    case "holiday":
      return "font-medium text-red-600"
    case "shraddha":
    case "marker":
      return "text-muted-foreground"
    default:
      return "text-muted-foreground"
  }
}

function buildCalendarGrid(bsYear: number, bsMonth: number): CalendarCell[] {
  const monthLength = getBSMonthLength(bsYear, bsMonth)
  const leadingDays = bsToAD(bsYear, bsMonth, 1).getDay()
  const cells: CalendarCell[] = []

  if (leadingDays > 0) {
    const prevMonth = bsMonth === 1 ? 12 : bsMonth - 1
    const prevYear = bsMonth === 1 ? bsYear - 1 : bsYear
    const prevMonthLength = getBSMonthLength(prevYear, prevMonth)

    for (let index = leadingDays - 1; index >= 0; index -= 1) {
      const bsDay = prevMonthLength - index
      cells.push({
        bsYear: prevYear,
        bsMonth: prevMonth,
        bsDay,
        inMonth: false,
        date: bsToAD(prevYear, prevMonth, bsDay),
      })
    }
  }

  for (let bsDay = 1; bsDay <= monthLength; bsDay += 1) {
    cells.push({
      bsYear,
      bsMonth,
      bsDay,
      inMonth: true,
      date: bsToAD(bsYear, bsMonth, bsDay),
    })
  }

  const trailingDays = (7 - (cells.length % 7)) % 7
  const nextMonth = bsMonth === 12 ? 1 : bsMonth + 1
  const nextYear = bsMonth === 12 ? bsYear + 1 : bsYear

  for (let bsDay = 1; bsDay <= trailingDays; bsDay += 1) {
    cells.push({
      bsYear: nextYear,
      bsMonth: nextMonth,
      bsDay,
      inMonth: false,
      date: bsToAD(nextYear, nextMonth, bsDay),
    })
  }

  return cells
}

function PanchangaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-border/70 py-2.5 text-sm last:border-b-0">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function PanchangaInfoGrid({ rows }: { rows: Array<{ label: string; value?: string }> }) {
  const visibleRows = rows.filter((row) => row.value)
  if (!visibleRows.length) return null

  return (
    <div className="rounded-lg border bg-muted/15 px-3">
      {visibleRows.map((row) => (
        <PanchangaRow key={row.label} label={row.label} value={row.value} />
      ))}
    </div>
  )
}

function DayDialogSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

function collectDialogObservances(
  monthDay: PatroMonthDay | undefined,
  panchanga: DailyPanchanga | null,
): DayObservance[] {
  const fromMonth = buildDayObservanceLabels(monthDay)
  const seen = new Set(fromMonth.map((item) => item.text))

  for (const [index, festival] of (panchanga?.festivals ?? []).entries()) {
    const text = formatFestivalName(festival)
    if (seen.has(text)) continue
    seen.add(text)
    fromMonth.push({
      id: `daily-festival-${index}`,
      text,
      kind: "festival",
    })
  }

  return fromMonth
}

function DayDetailDialog({
  open,
  view,
  date,
  monthDay,
  panchanga,
  loading,
  error,
  canGoPrev,
  canGoNext,
  onClose,
  onPrevDay,
  onNextDay,
  onShowFullPanchanga,
  onBackToSummary,
}: {
  open: boolean
  view: DialogView
  date: Date
  monthDay?: PatroMonthDay
  panchanga: DailyPanchanga | null
  loading: boolean
  error: string | null
  canGoPrev: boolean
  canGoNext: boolean
  onClose: () => void
  onPrevDay: () => void
  onNextDay: () => void
  onShowFullPanchanga: () => void
  onBackToSummary: () => void
}) {
  if (!open) return null

  const observances = collectDialogObservances(monthDay, panchanga)
  const display = panchanga?.display ?? monthDay?.panchanga?.display
  const dinVishesh = observances.map((item) => item.text).join(", ")

  const dialog = (
    <div className="patro-dialog-overlay" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="patro-day-dialog-title"
        className="patro-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-1">
            {view === "full" ? (
              <Button type="button" variant="ghost" size="icon" onClick={onBackToSummary}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canGoPrev}
                onClick={onPrevDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="text-sm font-semibold">
              {view === "full" ? "पञ्चाङ्ग" : "दिन विवरण"}
            </span>
            {view === "summary" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canGoNext}
                onClick={onNextDay}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading && !monthDay && !panchanga ? (
          <DayDialogSkeleton />
        ) : error ? (
          <div className="flex gap-2 p-5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : view === "summary" ? (
          <div className="space-y-5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h2 id="patro-day-dialog-title" className="text-lg font-semibold">
                  {display?.bs_ne ??
                    `${BS_MONTH_NAMES_NE[adToBS(date).month - 1]} ${toNepaliDigits(adToBS(date).day)}, ${toNepaliDigits(adToBS(date).year)}`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {display?.gregorian_en ?? monthDay?.date}
                </p>
                {display?.ns_ne ? (
                  <p className="text-sm text-muted-foreground">{display.ns_ne}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                {panchanga?.sunrise?.local_time_short ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Sunrise className="h-3.5 w-3.5" />
                    सूर्योदय {panchanga.sunrise.local_time_short}
                  </span>
                ) : null}
                {panchanga?.sunset?.local_time_short ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Sunset className="h-3.5 w-3.5" />
                    सूर्यास्त {panchanga.sunset.local_time_short}
                  </span>
                ) : null}
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">पञ्चाङ्ग</h3>
              <PanchangaInfoGrid
                rows={[
                  {
                    label: "वार",
                    value: panchanga?.vaara?.name_ne ?? monthDay?.panchanga?.vaara?.name_ne,
                  },
                  {
                    label: "तिथि",
                    value: formatPanchangaElementNe(panchanga?.tithi) ??
                      monthDay?.panchanga?.tithi?.name_ne,
                  },
                  { label: "नक्षत्र", value: formatPanchangaElementNe(panchanga?.nakshatra) },
                  { label: "योग", value: formatPanchangaElementNe(panchanga?.yoga) },
                  { label: "करण", value: formatPanchangaElementNe(panchanga?.karana) },
                {
                  label: "पक्ष",
                  value:
                    panchanga?.paksha?.label_ne ??
                    monthDay?.panchanga?.paksha?.label_ne ??
                    (typeof panchanga?.paksha === "string" ? panchanga.paksha : undefined),
                },
                ]}
              />
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-orange-600"
                onClick={onShowFullPanchanga}
              >
                थप जानकारी
              </Button>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">कार्यक्रमहरू</h3>
              {observances.length ? (
                <ul className="space-y-2">
                  {observances.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                      <span className={observanceClassName(item.kind)}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">यस दिन कुनै कार्यक्रम फेला परेन।</p>
              )}
            </section>
          </div>
        ) : (
          <div className="space-y-5 p-5">
            <div className="grid gap-2 rounded-lg border bg-muted/15 p-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">वि.सं.</span>
                <p className="font-medium">{display?.bs_ne}</p>
              </div>
              <div>
                <span className="text-muted-foreground">इ.सं</span>
                <p className="font-medium">{display?.gregorian_en}</p>
              </div>
              {display?.ns_ne ? (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">नेपाल संवत्</span>
                  <p className="font-medium">{display.ns_ne}</p>
                </div>
              ) : null}
            </div>

            <PanchangaInfoGrid
              rows={[
                {
                  label: "वार",
                  value: panchanga?.vaara?.name_ne,
                },
                {
                  label: "पक्ष",
                  value: panchanga?.paksha?.label_ne,
                },
                {
                  label: "तिथि",
                  value: formatPanchangaElementNe(panchanga?.tithi),
                },
                {
                  label: "नक्षत्र",
                  value: formatPanchangaElementNe(panchanga?.nakshatra),
                },
                {
                  label: "योग",
                  value: formatPanchangaElementNe(panchanga?.yoga),
                },
                {
                  label: "करण",
                  value: formatPanchangaElementNe(panchanga?.karana),
                },
                {
                  label: "चन्द्रराशि",
                  value: panchanga?.chandra_rashi?.name_ne ?? panchanga?.chandra_rashi?.name,
                },
                {
                  label: "सूर्यराशि",
                  value: panchanga?.surya_rashi?.name_ne ?? panchanga?.surya_rashi?.name,
                },
                {
                  label: "ऋतु",
                  value: panchanga?.ritu?.name_ne ?? panchanga?.ritu?.season,
                },
                {
                  label: "अयन",
                  value: panchanga?.aayan?.name_ne ?? panchanga?.aayan?.name,
                },
                {
                  label: "दिनमान",
                  value:
                    (panchanga?.dinamaan as { label_full_ne?: string } | undefined)?.label_full_ne ??
                    panchanga?.dinamaan?.label_ne ??
                    panchanga?.dinamaan?.label_en,
                },
                {
                  label: "सूर्योदय",
                  value: panchanga?.sunrise?.local_time_short,
                },
                {
                  label: "सूर्यास्त",
                  value: panchanga?.sunset?.local_time_short,
                },
              ]}
            />

            {dinVishesh ? (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">दिन विशेष</h3>
                <p className="rounded-lg border bg-muted/15 px-3 py-2.5 text-sm">{dinVishesh}</p>
              </section>
            ) : null}

            {panchanga?.planets && Object.keys(panchanga.planets).length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">सूर्योदयकालीन ग्रह</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {Object.entries(panchanga.planets).map(([name, position]) => (
                    <div
                      key={name}
                      className="rounded-md border bg-background px-2 py-2 text-center text-xs"
                    >
                      <div className="font-medium">{name}</div>
                      <div className="text-muted-foreground">
                        {position.rashi_name_ne ??
                          position.rashi_name ??
                          (position as { rashi?: number }).rashi ??
                          "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

function DetailCalendarCell({
  cell,
  day,
  isSelected,
  isToday,
  onOpenDay,
}: {
  cell: CalendarCell
  day?: PatroMonthDay
  isSelected: boolean
  isToday: boolean
  onOpenDay: () => void
}) {
  const isSaturday = cell.date.getDay() === 6
  const observances = cell.inMonth ? buildDayObservanceLabels(day) : []
  const visibleObservances = observances.slice(0, MAX_CELL_OBSERVANCES)
  const extraObservances = Math.max(observances.length - visibleObservances.length, 0)
  const tithi = day?.panchanga?.tithi?.name_ne ?? day?.panchanga?.tithi?.name

  return (
    <button
      type="button"
      onClick={onOpenDay}
      disabled={!cell.inMonth}
      className={cn(
        "detail-cal-day relative flex min-h-[5.75rem] flex-col border border-border/80 bg-background p-1.5 text-left transition-colors",
        !cell.inMonth && "detail-cal-day--outside",
        cell.inMonth && "hover:bg-muted/40",
        isSelected && "detail-cal-day--selected",
        isToday && cell.inMonth && !isSelected && "detail-cal-day--today",
        isSaturday && cell.inMonth && !isSelected && "detail-cal-day--saturday",
      )}
    >
      <div className="min-h-[2.4rem] space-y-0.5 pr-5">
        {visibleObservances.length ? (
          visibleObservances.map((observance) => (
            <span
              key={observance.id}
              className={cn(
                "line-clamp-1 block text-[0.72rem] leading-tight",
                observanceClassName(observance.kind, isSelected),
              )}
            >
              {observance.text}
            </span>
          ))
        ) : (
          <span className="block h-[1.1rem]" aria-hidden />
        )}
      </div>

      {extraObservances > 0 ? (
        <span
          className={cn(
            "absolute right-1 top-1 rounded-full px-1 py-0.5 text-[0.58rem] font-medium",
            isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
          )}
        >
          +{extraObservances}
        </span>
      ) : null}

      <span
        className={cn(
          "my-auto text-center text-2xl font-semibold leading-none",
          isSaturday && cell.inMonth && "text-red-600",
        )}
      >
        {toNepaliDigits(cell.bsDay)}
      </span>

      <div className="mt-0 flex items-end justify-between gap-1 text-[0.8rem] leading-none text-muted-foreground">
        <span className="truncate">{tithi ?? ""}</span>
        <span className="shrink-0 tabular-nums">{cell.date.getDate()}</span>
      </div>
    </button>
  )
}

function DetailCalendarSkeleton() {
  return (
    <div className="detail-cal-grid">
      {Array.from({ length: 42 }).map((_, index) => (
        <Skeleton key={index} className="min-h-[5.75rem] rounded-none" />
      ))}
    </div>
  )
}

export function DetailCalendarDemo() {
  const [bsYear, setBsYear] = useState(DEFAULT_BS_YEAR)
  const [bsMonth, setBsMonth] = useState(DEFAULT_BS_MONTH)
  const [selectedDay, setSelectedDay] = useState(1)
  const [dialogDay, setDialogDay] = useState<number | null>(null)
  const [dialogView, setDialogView] = useState<DialogView>("summary")
  const [monthData, setMonthData] = useState<PatroMonth | null>(null)
  const [dailyPanchanga, setDailyPanchanga] = useState<DailyPanchanga | null>(null)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [dailyError, setDailyError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const todayBS = useMemo(() => adToBS(new Date()), [])
  const years = useMemo(
    () =>
      Array.from(
        { length: BS_SUPPORTED_END_YEAR - BS_SUPPORTED_START_YEAR + 1 },
        (_, index) => BS_SUPPORTED_START_YEAR + index,
      ),
    [],
  )

  const dialogDate = useMemo(
    () => (dialogDay ? bsToAD(bsYear, bsMonth, dialogDay) : null),
    [bsMonth, bsYear, dialogDay],
  )
  const monthLength = getBSMonthLength(bsYear, bsMonth)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    getPatroMonth(bsYear, bsMonth, { panchanga: true })
      .then((data) => {
        if (cancelled) return
        setMonthData(data)
      })
      .catch((unknownError: unknown) => {
        if (cancelled) return
        setError(getErrorMessage(unknownError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [bsMonth, bsYear])

  useEffect(() => {
    let cancelled = false

    if (!dialogDate) {
      setDailyPanchanga(null)
      setDailyError(null)
      return () => {
        cancelled = true
      }
    }

    setDailyLoading(true)
    setDailyError(null)

    getDailyPanchanga(dialogDate)
      .then((data) => {
        if (cancelled) return
        setDailyPanchanga(data)
      })
      .catch((unknownError: unknown) => {
        if (cancelled) return
        setDailyError(getErrorMessage(unknownError))
      })
      .finally(() => {
        if (!cancelled) setDailyLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [bsMonth, bsYear, dialogDay, dialogDate])

  const daysByKey = useMemo(() => {
    const map = new Map<string, PatroMonthDay>()
    for (const day of monthData?.days ?? []) {
      map.set(`${bsYear}-${bsMonth}-${day.bs_day}`, day)
    }
    return map
  }, [bsMonth, bsYear, monthData])

  const grid = useMemo(() => buildCalendarGrid(bsYear, bsMonth), [bsMonth, bsYear])
  const dialogDayData = dialogDay ? daysByKey.get(`${bsYear}-${bsMonth}-${dialogDay}`) : undefined

  function openDay(day: number) {
    setSelectedDay(day)
    setDialogDay(day)
    setDialogView("summary")
  }

  function closeDialog() {
    setDialogDay(null)
    setDialogView("summary")
  }

  function shiftMonth(delta: number) {
    let nextMonth = bsMonth + delta
    let nextYear = bsYear

    if (nextMonth < 1) {
      nextMonth = 12
      nextYear -= 1
    } else if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }

    if (nextYear < BS_SUPPORTED_START_YEAR || nextYear > BS_SUPPORTED_END_YEAR) return

    setBsYear(nextYear)
    setBsMonth(nextMonth)
    setSelectedDay(1)
    setDialogDay(null)
  }

  function shiftDialogDay(delta: number) {
    if (!dialogDay) return
    const nextDay = dialogDay + delta
    if (nextDay < 1 || nextDay > monthLength) return
    openDay(nextDay)
  }

  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle>Detail Calendar</CardTitle>
              <CardDescription>
                Full-month Patro grid with tithi, shraddha labels, festivals, and Gregorian dates.
                Click a day or +N to open the day detail dialog; use थप जानकारी for full panchanga.
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit">
              API: {PATRO_API_DISPLAY_HOST}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="button" variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select value={String(bsMonth)} onValueChange={(value) => setBsMonth(Number(value))}>
              <SelectTrigger className="w-[9.5rem]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {BS_MONTH_NAMES.map((monthName, index) => (
                  <SelectItem key={monthName} value={String(index + 1)}>
                    {BS_MONTH_NAMES_NE[index]} / {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(bsYear)} onValueChange={(value) => setBsYear(Number(value))}>
              <SelectTrigger className="w-[6.5rem]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {toNepaliDigits(year)} ({year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="button" variant="outline" size="icon" onClick={() => shiftMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="ml-0 text-sm font-medium sm:ml-2">
              {monthData?.bs_month_name_ne ?? BS_MONTH_NAMES_NE[bsMonth - 1]} {toNepaliDigits(bsYear)}
              <span className="ml-2 text-muted-foreground">
                ({BS_MONTH_NAMES[bsMonth - 1]} {bsYear} BS)
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="detail-cal-grid detail-cal-weekdays">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday.en}
                className={cn(
                  "border border-border/80 bg-muted/30 px-1 py-2 text-center",
                  weekday.en === "Saturday" && "text-red-600",
                )}
              >
                <div className="text-xs font-medium">{weekday.ne}</div>
                <div className="text-[0.65rem] text-muted-foreground">{weekday.en}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <DetailCalendarSkeleton />
          ) : (
            <div className="detail-cal-grid">
              {grid.map((cell) => {
                const day = cell.inMonth
                  ? daysByKey.get(`${bsYear}-${bsMonth}-${cell.bsDay}`)
                  : undefined

                return (
                  <DetailCalendarCell
                    key={`${cell.bsYear}-${cell.bsMonth}-${cell.bsDay}-${cell.inMonth}`}
                    cell={cell}
                    day={day}
                    isSelected={cell.inMonth && selectedDay === cell.bsDay}
                    isToday={
                      cell.inMonth &&
                      todayBS.year === bsYear &&
                      todayBS.month === bsMonth &&
                      todayBS.day === cell.bsDay
                    }
                    onOpenDay={() => {
                      if (cell.inMonth) openDay(cell.bsDay)
                    }}
                  />
                )
              })}
            </div>
          )}

          {error ? (
            <div className="flex gap-2 border-t p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {!loading && !error ? (
            <>
              <Separator />
              <p className="px-4 py-3 text-xs text-muted-foreground">
                Grid labels include tithi-based श्राद्ध and lunar markers (पूर्णिमा, एकादशी).
                Named festivals appear when the API returns them for that day.
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>

      {dialogDate ? (
        <DayDetailDialog
          open={dialogDay !== null}
          view={dialogView}
          date={dialogDate}
          monthDay={dialogDayData}
          panchanga={dailyPanchanga}
          loading={dailyLoading}
          error={dailyError}
          canGoPrev={Boolean(dialogDay && dialogDay > 1)}
          canGoNext={Boolean(dialogDay && dialogDay < monthLength)}
          onClose={closeDialog}
          onPrevDay={() => shiftDialogDay(-1)}
          onNextDay={() => shiftDialogDay(1)}
          onShowFullPanchanga={() => setDialogView("full")}
          onBackToSummary={() => setDialogView("summary")}
        />
      ) : null}
    </>
  )
}
