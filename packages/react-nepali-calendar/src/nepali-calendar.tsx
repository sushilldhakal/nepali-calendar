"use client"

import * as React from "react"
import { Calendar, type CalendarProps } from "./calendar"
import { createNepaliDateLib } from "./create-nepali-date-lib"
import { DualDateDayButton } from "./dual-date-day-button"
import { nepaliFormatters, nepaliLabels } from "./nepali-formatters"

export type NepaliCalendarProps = CalendarProps & {
  /** Show small Gregorian day number under each BS day. Default: true */
  showGregorianDates?: boolean
  /** Show festival indicators on calendar days. Default: false */
  showFestivals?: boolean
}

export function NepaliCalendar({
  classNames,
  components,
  formatters,
  labels,
  showGregorianDates = true,
  showFestivals = false,
  weekStartsOn = 0,
  ...props
}: NepaliCalendarProps) {
  const dateLib = React.useMemo(() => createNepaliDateLib(), [])

  return (
    <Calendar
      weekStartsOn={weekStartsOn}
      dateLib={dateLib}
      classNames={{
        caption_label:  "nc-caption-label nc-caption-label--bs",
        dropdowns:      "nc-dropdowns nc-dropdowns--bs",
        dropdown_root:  "nc-dropdown-root nc-dropdown-root--bs",
        weekday:        "nc-weekday nc-weekday--bs",
        week:           "nc-week nc-week--bs",
        day:            "nc-day nc-day--bs",
        day_button:     "nc-day-button nc-day-button--bs",
        month_grid:     "nc-month-grid",
        ...classNames,
      }}
      components={{
        DayButton: (dayButtonProps) => (
          <DualDateDayButton
            {...dayButtonProps}
            showGregorianDate={showGregorianDates}
            showFestivals={showFestivals}
          />
        ),
        ...components,
      }}
      formatters={{ ...nepaliFormatters, ...formatters }}
      labels={{ ...nepaliLabels, ...labels }}
      {...props}
    />
  )
}

NepaliCalendar.displayName = "NepaliCalendar"
