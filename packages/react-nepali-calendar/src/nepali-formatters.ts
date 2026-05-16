import type { Formatters, Labels } from "react-day-picker"
import {
  BS_MONTH_NAMES,
  adToBS,
  formatBSDate,
  formatBSMonthYear,
  getBSMonthADRange,
} from "bikram-sambat"

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
const WEEKDAY_ARIA_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

function formatGregorianMonthSpan(date: Date) {
  const { start, end } = getBSMonthADRange(date)
  const formatter = new Intl.DateTimeFormat("en", { month: "short" })
  const startMonth = formatter.format(start)
  const endMonth = formatter.format(end)
  return startMonth === endMonth ? startMonth : `${startMonth}-${endMonth}`
}

function formatDualCalendarCaption(date: Date) {
  return `${formatBSMonthYear(date)} / ${formatGregorianMonthSpan(date)}`
}

export const nepaliFormatters: Partial<Formatters> = {
  formatCaption: (date) => formatDualCalendarCaption(date),
  formatDay: (date) => String(adToBS(date).day),
  formatMonthCaption: (date) => formatDualCalendarCaption(date),
  formatMonthDropdown: (date) => {
    const bsMonth = BS_MONTH_NAMES[adToBS(date).month - 1] ?? BS_MONTH_NAMES[0]
    return `${bsMonth} / ${formatGregorianMonthSpan(date)}`
  },
  formatWeekdayName: (date) => WEEKDAY_LABELS[date.getDay()] ?? "",
  formatYearCaption: (date) => String(adToBS(date).year),
  formatYearDropdown: (date) => String(adToBS(date).year),
}

export const nepaliLabels: Partial<Labels> = {
  labelGrid: (date) => `${formatBSMonthYear(date)} calendar`,
  labelGridcell: (date) => formatBSDate(date),
  labelDayButton: (date, modifiers) => {
    const selected = modifiers.selected ? ", selected" : ""
    const today = modifiers.today ? ", today" : ""
    return `${formatBSDate(date)}${selected}${today}`
  },
  labelMonthDropdown: () => "Choose Bikram Sambat month",
  labelYearDropdown: () => "Choose Bikram Sambat year",
  labelNext: () => "Go to the next Bikram Sambat month",
  labelPrevious: () => "Go to the previous Bikram Sambat month",
  labelWeekday: (date) => WEEKDAY_ARIA_LABELS[date.getDay()] ?? "",
}
