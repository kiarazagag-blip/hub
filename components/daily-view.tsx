"use client"

import { useState, useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { he } from "date-fns/locale"
import { Clock, Phone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  currentUserEmail?: string | null
}

const HOUR_HEIGHT = 80

export function DailyView({ bookings, selectedDate, currentUserEmail }: DailyViewProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const hours = Array.from({ length: 16 }, (_, i) => i + 8)

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את ההזמנה?")) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" })
      if (res.ok) {
        window.location.reload()
      } else {
        alert("שגיאה בביטול ההזמנה")
        setIsDeleting(false)
      }
    } catch (e) {
      console.error(e)
      alert("שגיאה בביטול ההזמנה")
      setIsDeleting(false)
    }
  }

  const dayBookings = useMemo(
    () => bookings.filter((b) => isSameDay(new Date(b.startTime), selectedDate)),
    [bookings, selectedDate]
  )

  const getBookingStyle = (booking: Booking) => {
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    
    // Use UTC hours — times are stored as UTC matching what the user entered
    const startDecimal = start.getUTCHours() + start.getUTCMinutes() / 60
    const endDecimal = end.getUTCHours() + end.getUTCMinutes() / 60
    
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
        <div className="text-center pt-2 pb-8 text-brand-black/30">
          <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">אין הזמנות ביום זה</p>
        </div>
      )}

      <div className="relative border-r border-brand-black/10 mr-14" style={{ height: `${(hours.length - 1) * HOUR_HEIGHT}px` }}>
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: `${(hour - 8) * HOUR_HEIGHT}px` }}
          >
            <span className="absolute -right-14 w-12 text-[11px] font-bold text-brand-black/60 text-right leading-none -mt-1.5 pr-1 font-mono">
              {hour.toString().padStart(2, "0")}:00
            </span>
            <div className="flex-1 border-t border-brand-black/10" />
          </div>
        ))}

        {hours.slice(0, -1).map((hour) => (
          <div
            key={`${hour}-30`}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: `${(hour - 8) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
          >
            <span className="absolute -right-14 w-12 text-[10px] font-bold text-brand-black/30 text-right leading-none -mt-1.5 pr-1 font-mono">
              {hour.toString().padStart(2, "0")}:30
            </span>
            <div className="flex-1 border-t border-dashed border-brand-black/5" />
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
                onClick={() => setSelectedBooking(booking)}
                className="absolute left-1 right-1 bg-brand-black rounded-xl px-3 py-2 overflow-hidden border border-white/5 transition-all hover:brightness-110 flex flex-col justify-center cursor-pointer shadow-sm active:scale-[0.98]"
                style={getBookingStyle(booking)}
              >
                <div className="flex flex-col gap-0.5 w-full">
                  <p className="text-white text-[13px] font-bold truncate text-right w-full">
                    {booking.name}
                  </p>
                  <p 
                    className="text-white/90 text-[11px] font-medium flex items-center justify-end gap-1.5 w-full"
                    dir="ltr"
                  >
                    <span className="opacity-40 text-[8px]">●</span>
                    <span>{`${String(start.getUTCHours()).padStart(2,"0")}:${String(start.getUTCMinutes()).padStart(2,"0")}`} – {`${String(end.getUTCHours()).padStart(2,"0")}:${String(end.getUTCMinutes()).padStart(2,"0")}`}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-black/40 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-right flex-1">
                  <h3 className="text-xl font-black text-brand-black mb-1">{selectedBooking.name}</h3>
                  <p className="text-sm font-bold text-brand-black/40" dir="ltr" style={{ textAlign: "right" }}>
                    {format(new Date(selectedBooking.startTime), "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#BFE9FF] rounded-full flex items-center justify-center text-brand-blue font-bold text-lg shrink-0 ml-4">
                  {selectedBooking.name.charAt(0)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-brand-gray rounded-2xl">
                  <div className="flex-1" dir="ltr" style={{ textAlign: "right" }}>
                    <p className="text-[11px] font-bold text-brand-black/40 uppercase tracking-wider mb-0.5 text-right">שעות</p>
                    <p className="text-sm font-bold text-brand-black">
                      {`${String(new Date(selectedBooking.startTime).getUTCHours()).padStart(2,"0")}:${String(new Date(selectedBooking.startTime).getUTCMinutes()).padStart(2,"0")}`} – {`${String(new Date(selectedBooking.endTime).getUTCHours()).padStart(2,"0")}:${String(new Date(selectedBooking.endTime).getUTCMinutes()).padStart(2,"0")}`}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <Clock className="w-5 h-5 text-brand-blue" />
                  </div>
                </div>

                <a href={`tel:${selectedBooking.phone}`} className="flex items-center gap-4 p-4 bg-[#ffbb0d]/10 rounded-2xl active:scale-95 transition-transform">
                  <div className="flex-1 text-right">
                    <p className="text-[11px] font-bold text-[#ffbb0d] uppercase tracking-wider mb-0.5 text-right">טלפון (לחץ לחיוג)</p>
                    <p className="text-lg font-black text-brand-black" dir="ltr" style={{ textAlign: "right" }}>{selectedBooking.phone}</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <Phone className="w-5 h-5 text-[#ffbb0d]" fill="currentColor" />
                  </div>
                </a>
              </div>

              <button 
                onClick={() => setSelectedBooking(null)}
                className="w-full mt-6 py-3.5 bg-brand-black text-white rounded-xl font-bold active:scale-95 transition-transform"
              >
                סגור
              </button>

              {currentUserEmail && currentUserEmail === selectedBooking.email && (
                <button
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  disabled={isDeleting}
                  className="w-full mt-3 py-3.5 bg-red-50 text-red-600 rounded-xl font-bold active:scale-95 transition-transform border border-red-100 flex justify-center items-center"
                >
                  {isDeleting ? "מבטל..." : "ביטול הזמנה"}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
