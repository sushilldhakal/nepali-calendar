import { useEffect, useMemo, useState } from "react"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatFestivalName,
  getPatroMonth,
  PATRO_API_DISPLAY_HOST,
  type PatroFestival,
  type PatroMonth,
  type PatroMonthDay,
} from "@/patro-api"

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const

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

function toNepaliDigits(value: number) {
  return String(value)
    .split("")
    .map((digit) => NEPALI_DIGITS[Number(digit)] ?? digit)
    .join("")
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load Patro data."
}

function isPublicHolidayFestival(festival: PatroFestival) {
  if (typeof festival === "string") return false
  return festival.is_public_holiday === true || festival.importance === "national"
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

function getPrimaryEventLabel(day?: PatroMonthDay) {
  const festivals = day?.festivals ?? []
  if (!festivals.length) return null

  const publicHoliday = festivals.find(isPublicHolidayFestival)
  if (publicHoliday) {
    return {
      text:
        typeof publicHoliday === "string"
          ? publicHoliday
          : (publicHoliday.name_ne ?? publicHoliday.name_en ?? "सार्वजनिक बिदा"),
      isHoliday: true,
    }
  }

  return {
    text: formatFestivalName(festivals[0]),
    isHoliday: false,
  }
}

function DetailCalendarCell({
  cell,
  day,
  isSelected,
  isToday,
  onSelect,
}: {
  cell: CalendarCell
  day?: PatroMonthDay
  isSelected: boolean
  isToday: boolean
  onSelect: () => void
}) {
  const isSaturday = cell.date.getDay() === 6
  const primaryEvent = cell.inMonth ? getPrimaryEventLabel(day) : null
  const extraEvents = cell.inMonth ? Math.max((day?.festivals?.length ?? 0) - 1, 0) : 0
  const tithi = day?.panchanga?.tithi?.name_ne ?? day?.panchanga?.tithi?.name

  return (
    <button
      type="button"
      onClick={onSelect}
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
      {primaryEvent ? (
        <span
          className={cn(
            "line-clamp-2 pr-5 text-[0.62rem] leading-tight",
            primaryEvent.isHoliday ? "font-medium text-red-600" : "text-muted-foreground",
          )}
        >
          {primaryEvent.text}
        </span>
      ) : (
        <span className="h-[1.35rem]" aria-hidden />
      )}

      {extraEvents > 0 ? (
        <span className="absolute right-1 top-1 rounded-full bg-muted px-1 py-0.5 text-[0.58rem] font-medium text-muted-foreground">
          +{extraEvents}
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

      <div className="mt-auto flex items-end justify-between gap-1 text-[0.62rem] leading-none text-muted-foreground">
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
  const [selectedDay, setSelectedDay] = useState(DEFAULT_BS_MONTH === 2 ? 1 : 1)
  const [monthData, setMonthData] = useState<PatroMonth | null>(null)
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

  const daysByKey = useMemo(() => {
    const map = new Map<string, PatroMonthDay>()
    for (const day of monthData?.days ?? []) {
      map.set(`${bsYear}-${bsMonth}-${day.bs_day}`, day)
    }
    return map
  }, [bsMonth, bsYear, monthData])

  const grid = useMemo(() => buildCalendarGrid(bsYear, bsMonth), [bsMonth, bsYear])

  const selectedDayData = daysByKey.get(`${bsYear}-${bsMonth}-${selectedDay}`)

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
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Detail Calendar</CardTitle>
            <CardDescription>
              Full-month Patro grid with tithi, festivals, and Gregorian dates — styled like a
              traditional Nepali calendar.
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
                  onSelect={() => {
                    if (cell.inMonth) setSelectedDay(cell.bsDay)
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

        {selectedDayData ? (
          <div className="border-t bg-muted/15 px-4 py-3 text-sm">
            <p className="font-medium">
              {selectedDayData.panchanga?.display?.bs_ne ??
                `${BS_MONTH_NAMES_NE[bsMonth - 1]} ${toNepaliDigits(selectedDay)}, ${toNepaliDigits(bsYear)}`}
            </p>
            <p className="text-muted-foreground">
              {selectedDayData.panchanga?.display?.gregorian_en ?? selectedDayData.date}
              {selectedDayData.panchanga?.tithi?.name_ne
                ? ` · ${selectedDayData.panchanga.tithi.name_ne}`
                : ""}
            </p>
            {selectedDayData.festivals?.length ? (
              <ul className="mt-2 space-y-1">
                {selectedDayData.festivals.map((festival, index) => (
                  <li
                    key={typeof festival === "string" ? festival : (festival.id ?? index)}
                    className={cn(
                      "text-xs",
                      isPublicHolidayFestival(festival) ? "font-medium text-red-600" : "text-foreground",
                    )}
                  >
                    {formatFestivalName(festival)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">No festivals on this day.</p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
