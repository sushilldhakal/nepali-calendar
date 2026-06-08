import type { DayButtonProps } from "react-day-picker"
import { adToBS, getFestivalsForDate } from "@sushill/bikram-sambat"
import { cn } from "./cn"

export type DualDateDayButtonProps = DayButtonProps & {
  showGregorianDate?: boolean
  showFestivals?: boolean
}

export function DualDateDayButton({
  day,
  modifiers,
  showGregorianDate = true,
  showFestivals = false,
  children,
  ...buttonProps
}: DualDateDayButtonProps) {
  const bs = adToBS(day.date)
  const gregorianDay = day.date.getDate()
  
  // Check for festivals on this date
  const festivals = showFestivals ? getFestivalsForDate(day.date) : []
  const hasFestival = festivals.length > 0
  const isHoliday = festivals.some(f => f.isNationalHoliday)
  
  // Debug logging for first render
  if (typeof window !== 'undefined' && !(window as any).__festivalDebugLogged) {
    const dateStr = day.date.toISOString().split('T')[0]
    if (dateStr === '2026-11-09' || dateStr === '2026-04-14') {
      console.log(`🔍 ${dateStr} (BS ${bs.monthName} ${bs.day}):`, {
        showFestivals,
        festivals: festivals.map(f => f.name),
        hasFestival,
        isHoliday
      })
    }
  }
  
  // Debug logging - remove after testing
  if (showFestivals && hasFestival) {
    console.log(`📅 ${day.date.toISOString().split('T')[0]} (BS ${bs.year}/${bs.month}/${bs.day}):`, 
      festivals.map(f => `${f.name}${f.isNationalHoliday ? '🔴' : '🔵'}`).join(', '))
  }

  return (
    <button type="button" {...buttonProps}>
      <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 leading-none relative">
        {hasFestival && (
          <span 
            className={cn(
              "absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full z-10",
              isHoliday ? "bg-red-500" : "bg-blue-500"
            )}
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isHoliday ? '#ef4444' : '#3b82f6',
              zIndex: 10
            }}
            title={festivals.map(f => f.name).join(", ")}
          />
        )}
        <span className={cn(
          "text-sm font-semibold",
          isHoliday && "text-red-600 dark:text-red-400"
        )}>
          {bs.day}
        </span>
        {showGregorianDate ? (
          <span
            aria-hidden="true"
            className={cn(
              "text-[0.62rem] font-normal leading-none opacity-60",
              modifiers.selected && "opacity-90",
            )}
          >
            {gregorianDay}
          </span>
        ) : (
          children
        )}
      </span>
    </button>
  )
}
