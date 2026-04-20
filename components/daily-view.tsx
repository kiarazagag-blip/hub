"use client"

import { useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { he } from "date-fns/locale"
import { Clock, Phone } from "lucide-react"

export interface Booking {
  id: string
  name: string
  email: string
  phone: string
  startTime: string
  endTime: string
}

interface DailyViewProps {
  bookings: Booking[]
  selectedDate: Date
}

const HOUR_HEIGHT = 80

export function DailyView({ bookings, selectedDate }: DailyViewProps) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 8)

  const dayBookings = useMemo(
    () => bookings.filter((b) => isSameDay(new Date(b.startTime), selectedDate)),
    [bookings, selectedDate]
  )

  const getBookingStyle = (booking: Booking) => {
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    const startMinutes = (start.getHours() - 8) * 60 + start.getMinutes()
    const durationMinutes = (end.getTime() - start.getTime()) / 60000

    return {
      top: `${(startMinutes / 60) * HOUR_HEIGHT + 2}px`,
      height: `${Math.max((durationMinutes / 60) * HOUR_HEIGHT - 4, 36)}px`,
    }
  }

  return (
    <div className="w-full">
      {dayBookings.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <Clock className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">אין הזמנות ביום זה</p>
        </div>
      )}

      <div className="relative" style={{ height: `${12 * HOUR_HEIGHT}px` }}>
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute w-full flex items-start"
            style={{ top: `${(hour - 8) * HOUR_HEIGHT}px` }}
          >
            <span className="text-xs text-zinc-400 w-14 leading-none pl-3 text-right shrink-0 -mt-2">
              {hour.toString().padStart(2, "0")}:00
            </span>
            <div className="flex-1 border-t border-zinc-100" />
          </div>
        ))}

        {hours.slice(0, -1).map((hour) => (
          <div
            key={`${hour}-30`}
            className="absolute w-full flex items-start"
            style={{ top: `${(hour - 8) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
          >
            <span className="text-xs text-zinc-300 w-14 leading-none pl-3 text-right shrink-0 -mt-2">
              :30
            </span>
            <div className="flex-1 border-t border-dashed border-zinc-100" />
          </div>
        ))}

        <div className="absolute right-14 left-0 top-0 bottom-0 pr-2 z-10">
          {dayBookings.map((booking) => {
            const start = new Date(booking.startTime)
            const end = new Date(booking.endTime)
            const durationMin = (end.getTime() - start.getTime()) / 60000
            const isCompact = durationMin < 60

            return (
              <div
                key={booking.id}
                className="absolute right-2 left-2 bg-zinc-900 rounded-2xl px-3 py-2 overflow-hidden hover:bg-zinc-800 transition-colors cursor-default shadow-sm border border-zinc-800"
                style={getBookingStyle(booking)}
              >
                <p className="text-white text-sm font-semibold truncate leading-tight">
                  {booking.name}
                </p>
                <p className="text-white/90 text-xs mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  {format(start, "HH:mm")} – {format(end, "HH:mm")}
                </p>
                {!isCompact && (
                  <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1 truncate">
                    <Phone className="w-3 h-3 shrink-0" />
                    {booking.phone}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
