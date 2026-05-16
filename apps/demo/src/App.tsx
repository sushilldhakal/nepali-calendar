import { useState } from "react"
import { format, subDays } from "date-fns"
import { CalendarIcon, GitFork, Package } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { NepaliCalendar, adToBS, formatBSDate } from "react-nepali-calendar"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

// Supported range: BS 2080–2090 (AD 2023–2033)
// AD boundaries for the supported BS range
const DOB_FROM_DATE = new Date(2023, 3, 14)  // BS 2080 Baisakh 1
const DOB_TO_DATE   = new Date(2033, 3, 13)  // BS 2090 Chaitra 30

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
  { label: "Basic" },
  { label: "Date Range" },
  { label: "With Presets" },
  { label: "Date of Birth" },
]

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {
  const today = new Date()
  const todayBS = adToBS(today)

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
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <GitFork className="h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://npmjs.com" target="_blank" rel="noreferrer">
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
        <main className="flex-1 min-w-0 px-6 py-10 max-w-3xl">
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
              <code>{`import { NepaliCalendar, formatBSDate } from "react-nepali-calendar"
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
import { NepaliCalendar, formatBSDate } from "react-nepali-calendar"

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

            {/* Basic */}
            <div id="basic">
              <DemoBlock
                title="Basic"
                description="A basic Nepali date picker. Displays Bikram Sambat dates; the selected value is a standard JS Date."
                preview={<DatePickerDemo />}
                code={`import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { NepaliCalendar, formatBSDate } from "react-nepali-calendar"
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
import { NepaliCalendar, formatBSDate } from "react-nepali-calendar"
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
import { NepaliCalendar, formatBSDate } from "react-nepali-calendar"
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
import { NepaliCalendar, adToBS } from "react-nepali-calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const FROM_DATE = new Date(2023, 3, 14) // BS 2080 Baisakh 1
const TO_DATE   = new Date(2033, 3, 13) // BS 2090 Chaitra 30

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
