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
  const hours = Array.from({ length: 16 }, (_, i) => i + 8)

  const dayBookings = useMemo(
    () => bookings.filter((b) => isSameDay(new Date(b.startTime), selectedDate)),
    [bookings, selectedDate]
  )

  const getBookingStyle = (booking: Booking) => {
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    
    // Use decimal hours for precise positioning
    const startDecimal = start.getHours() + start.getMinutes() / 60
    const endDecimal = end.getHours() + end.getMinutes() / 60
    
    const topMinutes = (startDecimal - 8) * 60
    const durationMinutes = (endDecimal - startDecimal) * 60

    return {
      top: `${(topMinutes / 60) * HOUR_HEIGHT}px`,
      height: `${Math.max((durationMinutes / 60) * HOUR_HEIGHT - 2, 28)}px`,
    }
  }

  return (
    <div className="w-full relative select-none">
      {dayBookings.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">אין הזמנות ביום זה</p>
        </div>
      )}

      <div className="relative border-r border-zinc-100/50 mr-14" style={{ height: `${(hours.length - 1) * HOUR_HEIGHT}px` }}>
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: `${(hour - 8) * HOUR_HEIGHT}px` }}
          >
            <span className="absolute -right-14 w-12 text-[11px] font-medium text-zinc-400 text-right leading-none -mt-1.5 pr-1">
              {hour.toString().padStart(2, "0")}:00
            </span>
            <div className="flex-1 border-t border-zinc-100" />
          </div>
        ))}

        {hours.slice(0, -1).map((hour) => (
          <div
            key={`${hour}-30`}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: `${(hour - 8) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
          >
            <span className="absolute -right-14 w-12 text-[10px] font-medium text-zinc-300 text-right leading-none -mt-1.5 pr-1">
              {hour.toString().padStart(2, "0")}:30
            </span>
            <div className="flex-1 border-t border-dashed border-zinc-50" />
          </div>
        ))}

        <div className="absolute inset-0 z-10">
          {dayBookings.map((booking) => {
            const start = new Date(booking.startTime)
            const end = new Date(booking.endTime)
            const durationMin = (end.getTime() - start.getTime()) / 60000
            const isCompact = durationMin <= 45

            return (
              <div
                key={booking.id}
                className="absolute left-1 right-1 bg-brand-black rounded-xl px-3 py-2 overflow-hidden shadow-sm border border-white/5 transition-all hover:brightness-110 flex flex-col justify-center"
                style={getBookingStyle(booking)}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-white text-[13px] font-bold truncate">
                    {booking.name}
                  </p>
                  <p 
                    className="text-white/60 text-[10px] font-medium flex items-center gap-1.5"
                    dir="ltr"
                  >
                    <span className="opacity-40">●</span>
                    {format(start, "HH:mm")} – {format(end, "HH:mm")}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
