"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...iconProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...iconProps} />
          ),
      }}
      classNames={{
        month: "relative space-y-3",
        caption: "relative flex h-9 items-center justify-center",
        month_caption: "relative flex h-9 items-center justify-center",
        caption_label: "pointer-events-none text-sm font-medium text-zinc-900",
        nav: "absolute left-0 right-0 top-0 z-10 flex h-9 items-center justify-between px-1",
        chevron: "!bg-transparent",
        button_previous:
          "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-zinc-600 hover:bg-transparent hover:text-zinc-900",
        button_next:
          "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-zinc-600 hover:bg-transparent hover:text-zinc-900",
        weekdays: "grid grid-cols-7 gap-1",
        weekday: "h-8 w-8 text-center text-xs font-medium text-zinc-500",
        week: "grid grid-cols-7 gap-1",
        day: "h-8 w-8 p-0",
        day_button:
          "h-8 w-8 rounded-md text-sm text-zinc-900 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400",
        today:
          "[&>button]:rounded-md [&>button]:bg-[var(--brand-primary)] [&>button]:text-white [&>button]:hover:bg-[var(--brand-primary-hover)]",
        selected: "text-white",
        outside: "text-zinc-400 opacity-60",
        disabled: "text-zinc-400 opacity-50",
      }}
      {...props}
    />
  )
}

export { Calendar }

