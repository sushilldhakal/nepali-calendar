import type { DayButtonProps } from "react-day-picker"
import { adToBS } from "@sushill/bikram-sambat"
import { cn } from "./cn"

export type DualDateDayButtonProps = DayButtonProps & {
  showGregorianDate?: boolean
}

export function DualDateDayButton({
  day,
  modifiers,
  showGregorianDate = true,
  children,
  ...buttonProps
}: DualDateDayButtonProps) {
  const bs = adToBS(day.date)
  const gregorianDay = day.date.getDate()

  return (
    <button type="button" {...buttonProps}>
      <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 leading-none">
        <span className="text-sm font-semibold">{bs.day}</span>
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
