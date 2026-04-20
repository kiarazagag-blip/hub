"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { he } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  startTime: string
}

interface MonthlyViewProps {
  bookings: Booking[]
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
}

export function MonthlyView({ bookings, selectedDate, onDateSelect }: MonthlyViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  // Week starts on Sunday in Israel
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const weeks: Date[][] = []
  let day = calStart
  while (day <= calEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    weeks.push(week)
  }

  const countForDay = (date: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.startTime), date)).length

  // Hebrew day names starting from Sunday
  const DAY_NAMES = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-6">
        {/* In RTL: right chevron = go back */}
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-zinc-900">
          {format(currentMonth, "MMMM yyyy", { locale: he })}
        </h2>
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-zinc-400 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((date, di) => {
              const inMonth = isSameMonth(date, currentMonth)
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
              const count = countForDay(date)
              const today = isToday(date)

              return (
                <button
                  key={di}
                  onClick={() => onDateSelect?.(date)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-2xl text-sm transition-all",
                    !inMonth && "opacity-25",
                    isSelected && "bg-zinc-900 text-white shadow-sm",
                    !isSelected && today && "bg-zinc-100 font-semibold text-zinc-900",
                    !isSelected && !today && inMonth && "hover:bg-zinc-50 text-zinc-900",
                    !isSelected && !today && !inMonth && "text-zinc-400"
                  )}
                >
                  <span className="text-sm font-medium">{format(date, "d")}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "absolute bottom-1.5 w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-white/70" : "bg-zinc-900"
                      )}
                    />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
