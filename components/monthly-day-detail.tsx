"use client"

import { useState } from "react"
import { format, isSameDay } from "date-fns"
import { he } from "date-fns/locale"
import { MonthlyView } from "@/components/monthly-view"
import { DailyView, type Booking } from "@/components/daily-view"
import { Clock } from "lucide-react"

interface MonthlyDayDetailProps {
  bookings: Booking[]
}

export function MonthlyDayDetail({ bookings }: MonthlyDayDetailProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const dayBookings = bookings.filter((b) =>
    isSameDay(new Date(b.startTime), selectedDate)
  )

  return (
    <div className="space-y-8">
      <MonthlyView
        bookings={bookings}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {format(selectedDate, "EEEE, d MMMM", { locale: he })}
          </h2>
          {dayBookings.length > 0 && (
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 rounded-full px-2.5 py-1">
              {dayBookings.length} {dayBookings.length === 1 ? "הזמנה" : "הזמנות"}
            </span>
          )}
        </div>

        {dayBookings.length === 0 ? (
          <div className="text-center py-10 text-zinc-400">
            <Clock className="w-7 h-7 mx-auto mb-2 opacity-40" />
            <p className="text-sm">אין הזמנות ביום זה</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-start justify-between rounded-2xl bg-zinc-50 border border-zinc-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{b.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{b.phone}</p>
                </div>
                <span className="text-xs font-mono text-zinc-600 bg-white border border-zinc-200 rounded-lg px-2 py-1 shrink-0 mr-3">
                  {format(new Date(b.startTime), "HH:mm")} –{" "}
                  {format(new Date(b.endTime), "HH:mm")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
