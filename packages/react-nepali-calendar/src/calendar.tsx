"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "./cn"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("nc-root", className)}
      classNames={{
        // ── structural ──────────────────────────────────────────────────────
        months:          "nc-months",
        month:           "nc-month",
        month_caption:   "nc-month-caption",
        caption_label:   "nc-caption-label",
        nav:             "nc-nav",
        button_previous: "nc-button-nav",
        button_next:     "nc-button-nav",
        dropdowns:       "nc-dropdowns",
        dropdown_root:   "nc-dropdown-root",
        dropdown:        "nc-dropdown",
        months_dropdown: "nc-months-dropdown",
        years_dropdown:  "nc-years-dropdown",
        chevron:         "nc-chevron",
        weeks:           "nc-weeks",
        weekdays:        "nc-weekdays",
        weekday:         "nc-weekday",
        week:            "nc-week",
        month_grid:      "nc-month-grid",
        // ── day cell — keep rdp- modifier classes so CSS can target them ───
        day:             "nc-day",
        day_button:      "nc-day-button",
        // ── modifiers — keep rdp- defaults so our CSS selectors work ───────
        selected:        "rdp-selected",
        today:           "rdp-today",
        outside:         "rdp-outside",
        disabled:        "rdp-disabled",
        range_start:     "rdp-range_start",
        range_end:       "rdp-range_end",
        range_middle:    "rdp-range_middle",
        hidden:          "rdp-hidden",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "down"
                ? ChevronDown
                : ChevronRight
          return <Icon {...chevronProps} className="nc-chevron-icon" />
        },
        ...components,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"
