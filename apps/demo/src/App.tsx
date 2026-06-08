import { useEffect, useMemo, useState } from "react"
import { format, subDays } from "date-fns"
import { AlertCircle, CalendarIcon, GitFork, Package } from "lucide-react"
import type { DateRange } from "react-day-picker"
import {
  NepaliCalendar,
  adToBS,
  bsToAD,
  formatBSDate,
  getBSMonthLength,
} from "@sushill/react-nepali-calendar"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatFestivalMeta,
  formatFestivalName,
  formatLocalISODate,
  getDailyPanchanga,
  getHolidaysYear,
  getPatroMonth,
  PATRO_API_URL,
  warmPatroApi,
  type DailyPanchanga,
  type Holiday,
  type HolidaysYear,
  type PatroMonth,
} from "@/patro-api"

// ─── Date Picker: Basic ──────────────────────────────────────────────────────

function DatePickerDemo() {
  const [date, setDate] = useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatBSDate(date) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <NepaliCalendar mode="single" selected={date} onSelect={setDate} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

// ─── Date Picker: Range ──────────────────────────────────────────────────────

function DateRangePickerDemo({ className }: { className?: string }) {
  const [range, setRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 20),
    to: new Date(),
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !range && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {formatBSDate(range.from)} – {formatBSDate(range.to)}
                </>
              ) : (
                formatBSDate(range.from)
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <NepaliCalendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ─── Date Picker: With Presets ───────────────────────────────────────────────

function DatePickerWithPresets() {
  const [date, setDate] = useState<Date>()

  function applyPreset(value: string) {
    const today = new Date()
    if (value === "today") setDate(today)
    else if (value === "tomorrow") setDate(new Date(today.setDate(today.getDate() + 1)))
    else if (value === "in3days") setDate(new Date(today.setDate(today.getDate() + 3)))
    else if (value === "in1week") setDate(new Date(today.setDate(today.getDate() + 7)))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatBSDate(date) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <Select onValueChange={applyPreset}>
          <SelectTrigger>
            <SelectValue placeholder="Select a preset" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="in3days">In 3 days</SelectItem>
            <SelectItem value="in1week">In a week</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <NepaliCalendar mode="single" selected={date} onSelect={setDate} />
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Date Picker: Date of Birth ──────────────────────────────────────────────

// Supported range: BS 2080–2200 (offline lookup in bikram-sambat)
const DOB_FROM_DATE = new Date(2023, 3, 14)  // BS 2080 Baisakh 1
const DOB_TO_DATE   = new Date(2144, 3, 15)  // BS 2200 Chaitra last day

function DateOfBirthPicker() {
  const [date, setDate] = useState<Date>()

  const bs = date ? adToBS(date) : null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {bs
            ? `${bs.year}/${String(bs.month).padStart(2, "0")}/${String(bs.day).padStart(2, "0")}`
            : <span>Pick date of birth (BS)</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <NepaliCalendar
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={setDate}
          defaultMonth={DOB_FROM_DATE}
          startMonth={DOB_FROM_DATE}
          endMonth={DOB_TO_DATE}
          disabled={(d) => d < DOB_FROM_DATE || d > DOB_TO_DATE}
          initialFocus
        />
        {bs && (
          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            BS: {bs.monthName} {bs.day}, {bs.year}
            &nbsp;·&nbsp;
            AD: {date?.toISOString().slice(0, 10)}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── Calendar: Standalone ────────────────────────────────────────────────────

function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col items-center gap-4">
      <NepaliCalendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg border"
      />
      <p className="text-sm text-muted-foreground">
        {date ? (
          <>Selected: <span className="font-medium text-foreground">{formatBSDate(date)}</span></>
        ) : (
          "No date selected"
        )}
      </p>
    </div>
  )
}

// ─── Calendar: Dynamic Patro API integration ─────────────────────────────────

const DYNAMIC_PATRO_DEFAULT_MONTH = bsToAD(2083, 2, 1)

function getDynamicPatroDefaultMonth() {
  return new Date(DYNAMIC_PATRO_DEFAULT_MONTH)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load Patro data."
}

function formatPanchangaElement(element: DailyPanchanga["tithi"]) {
  if (!element) return undefined

  const name = element?.name_ne ?? element?.name
  if (!name) return undefined

  const endTime = element.end_hours_clock ?? element.end_ghati_clock
  return endTime ? `${name} (until ${endTime})` : name
}

function formatNextElement(element: DailyPanchanga["tithi"]) {
  if (!element) return undefined

  const name = element?.next?.name_ne ?? element?.next?.name
  if (!name) return undefined

  const endTime = element.next?.end_hours_clock ?? element.next?.end_ghati_clock
  return endTime ? `${name} (until ${endTime})` : name
}

function PanchangaField({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border bg-background px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="max-w-[12rem] text-right text-sm">{value}</span>
    </div>
  )
}

function PanchangaSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}

function PanchangaSidebar({
  date,
  panchanga,
  festivals,
  isLoading,
  error,
}: {
  date?: Date
  panchanga: DailyPanchanga | null
  festivals: PatroMonth["days"][number]["festivals"]
  isLoading: boolean
  error: string | null
}) {
  const festivalItems = panchanga?.festivals?.length ? panchanga.festivals : festivals ?? []

  return (
    <Card className="w-full lg:max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Daily Panchanga</CardTitle>
        <CardDescription>
          {date ? formatLocalISODate(date) : "Select a calendar day to load details."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!date ? (
          <p className="text-sm text-muted-foreground">
            Month data is loaded with <code className="rounded bg-muted px-1">panchanga=false</code>.
            Selecting a date fetches the full daily panchanga.
          </p>
        ) : isLoading ? (
          <PanchangaSkeleton />
        ) : error ? (
          <div className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : panchanga ? (
          <>
            <div className="flex flex-col gap-1">
              <p className="font-medium">{panchanga.display?.bs_ne ?? formatBSDate(date)}</p>
              {panchanga.display?.gregorian_en && (
                <p className="text-sm text-muted-foreground">{panchanga.display.gregorian_en}</p>
              )}
              {panchanga.display?.ns_ne && (
                <p className="text-sm text-muted-foreground">{panchanga.display.ns_ne}</p>
              )}
            </div>

            {festivalItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {festivalItems.map((festival, index) => (
                  <Badge key={`${formatFestivalName(festival)}-${index}`} variant="secondary">
                    {formatFestivalName(festival)}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid gap-2">
              <PanchangaField label="Tithi" value={formatPanchangaElement(panchanga.tithi)} />
              <PanchangaField label="Next tithi" value={formatNextElement(panchanga.tithi)} />
              <PanchangaField label="Nakshatra" value={formatPanchangaElement(panchanga.nakshatra)} />
              <PanchangaField label="Yoga" value={formatPanchangaElement(panchanga.yoga)} />
              <PanchangaField label="Karana" value={formatPanchangaElement(panchanga.karana)} />
              <PanchangaField label="Paksha" value={panchanga.paksha?.label_ne} />
              <PanchangaField
                label="Sun"
                value={[panchanga.sunrise?.local_time_short, panchanga.sunset?.local_time_short]
                  .filter(Boolean)
                  .join(" - ")}
              />
              <PanchangaField
                label="Moon"
                value={[panchanga.moonrise?.local_time_short, panchanga.moonset?.local_time_short]
                  .filter(Boolean)
                  .join(" - ")}
              />
              <PanchangaField
                label="Dinamaan"
                value={panchanga.dinamaan?.label_ne ?? panchanga.dinamaan?.label_en}
              />
              <PanchangaField
                label="Rashi"
                value={panchanga.chandra_rashi?.name_ne ?? panchanga.chandra_rashi?.name}
              />
              <PanchangaField
                label="Ritu"
                value={panchanga.ritu?.name_ne ?? panchanga.ritu?.season}
              />
            </div>

            {festivalItems.some((festival) => formatFestivalMeta(festival)) && (
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {festivalItems.map((festival, index) => {
                  const meta = formatFestivalMeta(festival)
                  if (!meta) return null

                  return (
                    <span key={`${formatFestivalName(festival)}-meta-${index}`}>
                      {formatFestivalName(festival)}: {meta}
                    </span>
                  )
                })}
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DynamicPatroDemo() {
  const [visibleMonth, setVisibleMonth] = useState<Date>(getDynamicPatroDefaultMonth)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getDynamicPatroDefaultMonth)
  const [monthData, setMonthData] = useState<PatroMonth | null>(null)
  const [monthLoading, setMonthLoading] = useState(false)
  const [monthError, setMonthError] = useState<string | null>(null)
  const [dailyPanchanga, setDailyPanchanga] = useState<DailyPanchanga | null>(null)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [dailyError, setDailyError] = useState<string | null>(null)

  const visibleBS = useMemo(() => adToBS(visibleMonth), [visibleMonth])
  const activeMonthData =
    monthData?.bs_year === visibleBS.year && monthData.bs_month === visibleBS.month ? monthData : null

  useEffect(() => {
    let cancelled = false

    setMonthLoading(true)
    setMonthError(null)

    getPatroMonth(visibleBS.year, visibleBS.month)
      .then((data) => {
        if (cancelled) return

        setMonthData(data)
      })
      .catch((error: unknown) => {
        if (cancelled) return

        setMonthError(getErrorMessage(error))
      })
      .finally(() => {
        if (!cancelled) setMonthLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [visibleBS.month, visibleBS.year])

  useEffect(() => {
    let cancelled = false

    if (!selectedDate) {
      setDailyPanchanga(null)
      setDailyError(null)
      return () => {
        cancelled = true
      }
    }

    setDailyLoading(true)
    setDailyError(null)

    getDailyPanchanga(selectedDate)
      .then((data) => {
        if (cancelled) return

        setDailyPanchanga(data)
      })
      .catch((error: unknown) => {
        if (cancelled) return

        setDailyError(getErrorMessage(error))
      })
      .finally(() => {
        if (!cancelled) setDailyLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedDate])

  const festivalsByDate = useMemo(() => {
    const map = new Map<string, PatroMonth["days"][number]>()
    for (const day of activeMonthData?.days ?? []) {
      if (day.festivals?.length) map.set(day.date, day)
    }
    return map
  }, [activeMonthData])

  const selectedDay = selectedDate ? festivalsByDate.get(formatLocalISODate(selectedDate)) : undefined
  const festivalCount = Array.from(festivalsByDate.values()).reduce(
    (count, day) => count + (day.festivals?.length ?? 0),
    0,
  )

  const modifiers = useMemo(
    () => ({
      festival: (date: Date) => festivalsByDate.has(formatLocalISODate(date)),
      monthLoading: (date: Date) => {
        const bs = adToBS(date)
        return monthLoading && bs.year === visibleBS.year && bs.month === visibleBS.month
      },
    }),
    [festivalsByDate, monthLoading, visibleBS.month, visibleBS.year],
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Dynamic Patro</CardTitle>
            <CardDescription>
              Fetches month festivals from <code className="rounded bg-muted px-1">/patro</code> and
              daily panchanga from <code className="rounded bg-muted px-1">/panchanga</code>.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            API: {new URL(PATRO_API_URL).host}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div>
              <p className="font-medium">
                {activeMonthData?.bs_month_name ?? visibleBS.monthName} {visibleBS.year}
              </p>
              <p className="text-muted-foreground">
                {activeMonthData
                  ? `${activeMonthData.month_length} days · ${festivalCount} festival marker${
                      festivalCount === 1 ? "" : "s"
                    }`
                  : "Loading month markers..."}
              </p>
            </div>
            {monthLoading && <Badge variant="secondary">Loading month</Badge>}
          </div>

          <NepaliCalendar
            mode="single"
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={modifiers}
            modifiersClassNames={{
              festival: "patro-festival-day",
              monthLoading: "patro-loading-day",
            }}
            className="rounded-lg border"
          />

          {monthError ? (
            <div className="flex max-w-md gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {monthError} Render may be waking the service; try the month again in a moment.
              </span>
            </div>
          ) : (
            <p className="max-w-md text-xs text-muted-foreground">
              Festival days are highlighted with a dot. Month fetches are cached in-memory so
              revisiting a BS month is instant during the session.
            </p>
          )}
        </div>

        <PanchangaSidebar
          date={selectedDate}
          panchanga={dailyPanchanga}
          festivals={selectedDay?.festivals}
          isLoading={dailyLoading}
          error={dailyError}
        />
      </CardContent>
    </Card>
  )
}

// ─── Calendar: Holidays endpoint integration ─────────────────────────────────

const HOLIDAYS_DEFAULT_YEAR = 2083
const HOLIDAYS_DEFAULT_MONTH = bsToAD(HOLIDAYS_DEFAULT_YEAR, 1, 1)

function getHolidaysDefaultMonth() {
  return new Date(HOLIDAYS_DEFAULT_MONTH)
}

function dateFromISODate(date: string) {
  const [year = "1970", month = "1", day = "1"] = date.split("-")
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function eachDateInRange(startDate: string, endDate: string) {
  const dates: Date[] = []
  const cursor = dateFromISODate(startDate)
  const end = dateFromISODate(endDate)

  while (cursor <= end) {
    dates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

function formatBSDateKeyFromAD(date: Date) {
  const bs = adToBS(date)
  const month = String(bs.month).padStart(2, "0")
  const day = String(bs.day).padStart(2, "0")

  return `${bs.year}-${month}-${day}`
}

function getHolidayName(holiday: Holiday) {
  return holiday.name_en || holiday.name_ne || holiday.id
}

function formatHolidayDateRange(holiday: Holiday) {
  const startBS = formatBSDateKeyFromAD(dateFromISODate(holiday.start_date))
  const endBS = formatBSDateKeyFromAD(dateFromISODate(holiday.end_date))

  if (holiday.start_date === holiday.end_date) {
    return `BS ${startBS} (AD ${holiday.start_date})`
  }

  return `BS ${startBS} - ${endBS} (AD ${holiday.start_date} - ${holiday.end_date})`
}

function formatHolidayMeta(holiday: Holiday) {
  return [holiday.importance, holiday.category, holiday.type]
    .filter(Boolean)
    .map((value) => value[0]?.toUpperCase() + value.slice(1))
    .join(" · ")
}

function HolidaysSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

function HolidayListItem({ holiday }: { holiday: Holiday }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="font-medium leading-none">{getHolidayName(holiday)}</p>
          <p className="text-xs text-muted-foreground">{formatHolidayDateRange(holiday)}</p>
        </div>
        <Badge variant={holiday.importance === "national" ? "secondary" : "outline"}>
          {holiday.duration_days} day{holiday.duration_days === 1 ? "" : "s"}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{formatHolidayMeta(holiday)}</p>
      {holiday.notes && <p className="text-sm text-muted-foreground">{holiday.notes}</p>}
    </div>
  )
}

function HolidaysCalendarDemo() {
  const [visibleMonth, setVisibleMonth] = useState<Date>(getHolidaysDefaultMonth)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getHolidaysDefaultMonth)
  const [holidaysData, setHolidaysData] = useState<HolidaysYear | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    getHolidaysYear(HOLIDAYS_DEFAULT_YEAR)
      .then((data) => {
        if (cancelled) return

        setHolidaysData(data)
      })
      .catch((requestError: unknown) => {
        if (cancelled) return

        setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const holidayDates = useMemo(() => {
    const dates = new Set<string>()
    for (const holiday of holidaysData?.holidays ?? []) {
      for (const date of eachDateInRange(holiday.start_date, holiday.end_date)) {
        dates.add(formatBSDateKeyFromAD(date))
      }
    }
    return dates
  }, [holidaysData])

  const holidaysByMonth = useMemo(() => {
    const groups = new Map<number, Holiday[]>()
    for (let month = 1; month <= 12; month += 1) groups.set(month, [])

    for (const holiday of holidaysData?.holidays ?? []) {
      const bs = adToBS(dateFromISODate(holiday.start_date))
      groups.get(bs.month)?.push(holiday)
    }

    return groups
  }, [holidaysData])

  const holidaysByDate = useMemo(() => {
    const groups = new Map<string, Holiday[]>()
    for (const holiday of holidaysData?.holidays ?? []) {
      for (const date of eachDateInRange(holiday.start_date, holiday.end_date)) {
        const key = formatBSDateKeyFromAD(date)
        groups.set(key, [...(groups.get(key) ?? []), holiday])
      }
    }
    return groups
  }, [holidaysData])

  const visibleBS = adToBS(visibleMonth)
  const selectedHolidays = selectedDate
    ? holidaysByDate.get(formatBSDateKeyFromAD(selectedDate)) ?? []
    : []
  const visibleMonthHolidays = holidaysByMonth.get(visibleBS.month) ?? []
  const startMonth = bsToAD(HOLIDAYS_DEFAULT_YEAR, 1, 1)
  const endMonth = bsToAD(
    HOLIDAYS_DEFAULT_YEAR,
    12,
    getBSMonthLength(HOLIDAYS_DEFAULT_YEAR, 12),
  )

  const modifiers = useMemo(
    () => ({
      holiday: (date: Date) => holidayDates.has(formatBSDateKeyFromAD(date)),
      holidaysLoading: (date: Date) => {
        const bs = adToBS(date)
        return isLoading && bs.year === HOLIDAYS_DEFAULT_YEAR
      },
    }),
    [holidayDates, isLoading],
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Holidays Calendar</CardTitle>
            <CardDescription>
              National public holidays from{" "}
              <code className="rounded bg-muted px-1">/holidays/{HOLIDAYS_DEFAULT_YEAR}</code>{" "}
              (not every festival — use <code className="rounded bg-muted px-1">/festivals/bs/{HOLIDAYS_DEFAULT_YEAR}</code>{" "}
              for the full observance list).
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            {holidaysData?.count ?? 0} holidays · {holidaysData?.location.name ?? "Kathmandu"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-medium">
                  {visibleBS.monthName} {visibleBS.year}
                </p>
                <p className="text-muted-foreground">
                  {visibleMonthHolidays.length} holiday
                  {visibleMonthHolidays.length === 1 ? "" : "s"} in this BS month
                </p>
              </div>
              {isLoading && <Badge variant="secondary">Loading holidays</Badge>}
            </div>

            <NepaliCalendar
              mode="single"
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              selected={selectedDate}
              onSelect={setSelectedDate}
              startMonth={startMonth}
              endMonth={endMonth}
              modifiers={modifiers}
              modifiersClassNames={{
                holiday: "patro-holiday-day",
                holidaysLoading: "patro-loading-day",
              }}
              className="rounded-lg border"
            />

            {error ? (
              <div className="flex max-w-md gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {error} The cache-backed holidays endpoint may still be warming up.
                </span>
              </div>
            ) : (
              <p className="max-w-md text-xs text-muted-foreground">
                Highlighted days are official public holidays only. Multi-day blocks like Dashain
                and Tihar span their full date range; regional jatras are not included here.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {selectedDate ? formatBSDate(selectedDate) : "Selected date"}
                </CardTitle>
                <CardDescription>
                  {selectedDate ? formatLocalISODate(selectedDate) : "Pick a holiday date."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {isLoading ? (
                  <HolidaysSkeleton />
                ) : selectedHolidays.length > 0 ? (
                  selectedHolidays.map((holiday) => (
                    <HolidayListItem
                      key={`selected-${holiday.id}-${holiday.start_date}`}
                      holiday={holiday}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No holiday is active on this selected date.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{visibleBS.monthName} holidays</CardTitle>
                <CardDescription>Quick list for the currently visible BS month.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {isLoading ? (
                  <HolidaysSkeleton />
                ) : visibleMonthHolidays.length > 0 ? (
                  visibleMonthHolidays.map((holiday) => (
                    <HolidayListItem
                      key={`visible-${holiday.id}-${holiday.start_date}`}
                      holiday={holiday}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No major holidays listed for this month.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {holidaysData && (
          <p className="text-xs text-muted-foreground">
            BS {HOLIDAYS_DEFAULT_YEAR} · Gregorian {holidaysData.gregorian_range.start} to{" "}
            {holidaysData.gregorian_range.end} · Rule {holidaysData.rule_version} · Engine{" "}
            {holidaysData.engine_version}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
// ─── Calendar: With Festivals ────────────────────────────────────────────────

function CalendarWithFestivals() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col items-center gap-4">
      <NepaliCalendar
        mode="single"
        selected={date}
        onSelect={setDate}
        showFestivals={true}
        className="rounded-lg border"
      />
      <p className="text-sm text-muted-foreground">
        {date ? (
          <>Selected: <span className="font-medium text-foreground">{formatBSDate(date)}</span></>
        ) : (
          "No date selected"
        )}
      </p>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>National Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Festival</span>
        </div>
      </div>
    </div>
  )
}

// ─── Demo block (preview + code tabs) ───────────────────────────────────────

function DemoBlock({
  title,
  description,
  preview,
  code,
}: {
  title: string
  description?: string
  preview: React.ReactNode
  code: string
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <Tabs defaultValue="preview">
        <TabsList className="h-8 text-xs">
          <TabsTrigger value="preview" className="text-xs px-3 py-1">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="text-xs px-3 py-1">
            Code
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center p-6">
              {preview}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="code">
          <Card>
            <CardContent className="p-0">
              <pre className="overflow-x-auto rounded-lg p-4 text-xs leading-relaxed bg-muted/60">
                <code>{code}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Sidebar nav items ───────────────────────────────────────────────────────

const NAV = [
  { label: "Installation" },
  { label: "Usage" },
  { label: "Examples", active: true },
  { label: "Calendar" },
  { label: "Dynamic Patro" },
  { label: "Holidays Calendar" },
  { label: "With Festivals" },
  { label: "Basic" },
  { label: "Date Range" },
  { label: "With Presets" },
  { label: "Date of Birth" },
]

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {
  const today = new Date()
  const todayBS = adToBS(today)

  useEffect(() => {
    void warmPatroApi()
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Top nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6 gap-4">
          <span className="font-semibold text-sm">react-nepali-calendar</span>
          <div className="flex items-center gap-1 ml-auto">
            <Badge variant="secondary" className="text-xs">Free &amp; Open Source</Badge>
            <Badge variant="outline" className="text-xs">shadcn/ui compatible</Badge>
            <Button variant="ghost" size="sm" asChild className="ml-2">
              <a href="https://github.com/sushilldhakal/nepali-calendar" target="_blank" rel="noreferrer">
                <GitFork className="h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://www.npmjs.com/package/@sushill/react-nepali-calendar" target="_blank" rel="noreferrer">
                <Package className="h-4 w-4" />
                npm
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
          <div className="py-6 px-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Components
            </p>
            {NAV.map((item) => (
              <a
                key={item.label}
                href={`#${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  item.active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 py-10 max-w-5xl">
          {/* Page title */}
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Nepali Date Picker</h1>
            <p className="text-muted-foreground text-lg">
              A Bikram Sambat date picker built with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                NepaliCalendar
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">Popover</code>.
            </p>
          </div>

          {/* Today's conversion callout */}
          <div className="mb-8 rounded-lg border bg-muted/40 px-4 py-3 text-sm flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              Today:{" "}
              <span className="font-medium">
                {format(today, "PPP")}
              </span>{" "}
              <span className="text-muted-foreground">→</span>{" "}
              <span className="font-medium">
                {todayBS.monthName} {todayBS.day}, {todayBS.year} BS
              </span>
            </span>
          </div>

          {/* Installation */}
          <section id="installation" className="mb-10 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight border-b pb-2">Installation</h2>
            <p className="text-sm text-muted-foreground">
              The Nepali Date Picker is built using a composition of{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">NepaliCalendar</code> and the
              shadcn/ui{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">Popover</code> component.
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
              <code>{`npm install react-nepali-calendar`}</code>
            </pre>
          </section>

          {/* Usage */}
          <section id="usage" className="mb-10 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight border-b pb-2">Usage</h2>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
              <code>{`import { NepaliCalendar, formatBSDate } from "@sushill/react-nepali-calendar"
import "react-nepali-calendar/styles.css"

// The CSS variables map directly to shadcn/ui tokens — no extra config needed.
// --nc-primary  → --primary
// --nc-accent   → --accent
// --nc-border   → --border`}</code>
            </pre>
          </section>

          {/* Examples */}
          <section id="examples" className="mb-10 space-y-10">
            <h2 className="text-xl font-semibold tracking-tight border-b pb-2">Examples</h2>

            {/* Standalone Calendar */}
            <div id="calendar">
              <DemoBlock
                title="Calendar"
                description="A standalone Bikram Sambat calendar. Use it directly when you don't need a popover trigger."
                preview={<CalendarDemo />}
                code={`import { useState } from "react"
import { NepaliCalendar, formatBSDate } from "@sushill/react-nepali-calendar"

export function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <NepaliCalendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-lg border"
    />
  )
}`}
              />
            </div>

            {/* Dynamic Patro */}
            <div id="dynamic-patro">
              <DemoBlock
                title="Dynamic Patro"
                description="Hydrate the calendar from the Surya Panchanga API: lightweight month markers first, full daily panchanga on selection."
                preview={<DynamicPatroDemo />}
                code={`import { useEffect, useMemo, useState } from "react"
import { NepaliCalendar, adToBS } from "@sushill/react-nepali-calendar"

export function DynamicPatro() {
  const [visibleMonth, setVisibleMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [monthData, setMonthData] = useState(null)
  const visibleBS = useMemo(() => adToBS(visibleMonth), [visibleMonth])

  useEffect(() => {
    fetch("https://patro.onrender.com/health").catch(() => undefined)
  }, [])

  useEffect(() => {
    fetch(
      \`https://patro.onrender.com/patro/\${visibleBS.year}/\${visibleBS.month}?panchanga=false\`,
    )
      .then((response) => response.json())
      .then(setMonthData)
  }, [visibleBS.month, visibleBS.year])

  const modifiers = {
    festival: (date: Date) => hasFestival(date, monthData),
  }

  return (
    <NepaliCalendar
      mode="single"
      month={visibleMonth}
      onMonthChange={setVisibleMonth}
      selected={selectedDate}
      onSelect={setSelectedDate}
      modifiers={modifiers}
      modifiersClassNames={{ festival: "patro-festival-day" }}
    />
  )
}`}
              />
            </div>

            {/* Holidays Calendar */}
            <div id="holidays-calendar">
              <DemoBlock
                title="Holidays Calendar"
                description="Fetch BS-year holidays once, fill holiday dates with a muted treatment, and show the current BS month's holidays."
                preview={<HolidaysCalendarDemo />}
                code={`import { useEffect, useMemo, useState } from "react"
import { NepaliCalendar, adToBS } from "@sushill/react-nepali-calendar"

export function HolidaysCalendar() {
  const [holidays, setHolidays] = useState([])
  const [visibleMonth, setVisibleMonth] = useState(new Date())

  useEffect(() => {
    fetch("https://patro.onrender.com/holidays/2083")
      .then((response) => response.json())
      .then((data) => setHolidays(data.holidays))
  }, [])

  const holidayDates = useMemo(() => {
    const dates = new Set<string>()
    for (const holiday of holidays) {
      for (const date of eachDateInRange(holiday.start_date, holiday.end_date)) {
        dates.add(formatBSDateKey(date))
      }
    }
    return dates
  }, [holidays])

  const holidaysByMonth = useMemo(() => groupByBSMonth(holidays), [holidays])

  return (
    <>
      <NepaliCalendar
        mode="single"
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        modifiers={{ holiday: (date) => holidayDates.has(formatBSDateKey(date)) }}
        modifiersClassNames={{ holiday: "patro-holiday-day" }}
      />
      <MonthlyHolidayList
        month={adToBS(visibleMonth).month}
        holidaysByMonth={holidaysByMonth}
      />
    </>
  )
}`}
              />
            </div>

            {/* Calendar with Festivals */}
            <div id="with-festivals">
              <DemoBlock
                title="With Festivals"
                description="Display Nepali festivals and holidays on the calendar. Red dots indicate national holidays, blue dots show other festivals."
                preview={<CalendarWithFestivals />}
                code={`import { useState } from "react"
import { NepaliCalendar, formatBSDate } from "@sushill/react-nepali-calendar"

export function CalendarWithFestivals() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col items-center gap-4">
      <NepaliCalendar
        mode="single"
        selected={date}
        onSelect={setDate}
        showFestivals={true}
        className="rounded-lg border"
      />
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>National Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Festival</span>
        </div>
      </div>
    </div>
  )
}`}
              />
            </div>

            {/* Basic */}
            <div id="basic">
              <DemoBlock
                title="Basic"
                description="A basic Nepali date picker. Displays Bikram Sambat dates; the selected value is a standard JS Date."
                preview={<DatePickerDemo />}
                code={`import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { NepaliCalendar, formatBSDate } from "@sushill/react-nepali-calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function DatePickerDemo() {
  const [date, setDate] = useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatBSDate(date) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <NepaliCalendar mode="single" selected={date} onSelect={setDate} initialFocus />
      </PopoverContent>
    </Popover>
  )
}`}
              />
            </div>

            {/* Range */}
            <div id="date-range">
              <DemoBlock
                title="Date Range"
                description={'Use mode="range" to enable range selection across two months.'}
                preview={<DateRangePickerDemo />}
                code={`import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { NepaliCalendar, formatBSDate } from "@sushill/react-nepali-calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRange | undefined>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[300px] justify-start text-left font-normal", !range && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range?.from ? (
            range.to ? <>{formatBSDate(range.from)} – {formatBSDate(range.to)}</> : formatBSDate(range.from)
          ) : <span>Pick a date range</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <NepaliCalendar
          initialFocus
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}`}
              />
            </div>

            {/* Presets */}
            <div id="with-presets">
              <DemoBlock
                title="With Presets"
                description="Combine a Select for quick presets with the calendar for manual selection."
                preview={<DatePickerWithPresets />}
                code={`import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { NepaliCalendar, formatBSDate } from "@sushill/react-nepali-calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function DatePickerWithPresets() {
  const [date, setDate] = useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatBSDate(date) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <Select onValueChange={(v) => { /* apply preset */ }}>
          <SelectTrigger><SelectValue placeholder="Select a preset" /></SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="in3days">In 3 days</SelectItem>
            <SelectItem value="in1week">In a week</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <NepaliCalendar mode="single" selected={date} onSelect={setDate} />
        </div>
      </PopoverContent>
    </Popover>
  )
}`}
              />
            </div>
            {/* Date of Birth */}
            <div id="date-of-birth">
              <DemoBlock
                title="Date of Birth"
                description="A date picker for selecting a date of birth in BS. Uses captionLayout='dropdown' for fast month and year navigation."
                preview={<DateOfBirthPicker />}
                code={`import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { NepaliCalendar, adToBS } from "@sushill/react-nepali-calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const FROM_DATE = new Date(2023, 3, 14) // BS 2080 Baisakh 1
const TO_DATE   = new Date(2144, 3, 15) // BS 2200 Chaitra last day

export function DateOfBirthPicker() {
  const [date, setDate] = useState<Date>()
  const bs = date ? adToBS(date) : null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {bs
            ? \`\${bs.year}/\${String(bs.month).padStart(2,"0")}/\${String(bs.day).padStart(2,"0")}\`
            : <span>Pick date of birth (BS)</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <NepaliCalendar
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={setDate}
          defaultMonth={FROM_DATE}
          startMonth={FROM_DATE}
          endMonth={TO_DATE}
          disabled={(d) => d < FROM_DATE || d > TO_DATE}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}`}
              />
            </div>

          </section>

          {/* Compatibility note */}
          <section className="rounded-lg border bg-muted/30 p-5 text-sm space-y-2">
            <p className="font-semibold">shadcn/ui compatible</p>
            <p className="text-muted-foreground">
              The calendar's CSS variables (
              <code className="rounded bg-muted px-1 text-xs">--nc-primary</code>,{" "}
              <code className="rounded bg-muted px-1 text-xs">--nc-accent</code>, …) are bridged to
              shadcn/ui's design tokens automatically. Drop{" "}
              <code className="rounded bg-muted px-1 text-xs">NepaliCalendar</code> anywhere you'd
              use shadcn's{" "}
              <code className="rounded bg-muted px-1 text-xs">Calendar</code> — it just works.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
