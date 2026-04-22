"use client"

import { useState } from "react"
import { format, addDays, subDays } from "date-fns"
import { he } from "date-fns/locale"
import { Navbar } from "@/components/navbar"
import { DailyView } from "@/components/daily-view"
import { MonthlyView } from "@/components/monthly-view"
import { ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"

export function DashboardClient({
  userName,
  bookings,
  selectedDate,
  prevDate,
  nextDate,
}: any) {
  const [view, setView] = useState<"daily" | "monthly">("daily")
  const [activeDate, setActiveDate] = useState<Date>(new Date(selectedDate))

  const dayCount = bookings.filter((b: any) => {
    const d = new Date(b.startTime)
    return d.toDateString() === activeDate.toDateString()
  }).length

  const handleDateSelect = (date: Date) => {
    setActiveDate(date)
    setView("daily")
    window.history.replaceState(null, "", `/dashboard?date=${format(date, "yyyy-MM-dd")}`)
  }

  const handlePrevDay = () => {
    const newDate = subDays(activeDate, 1)
    setActiveDate(newDate)
    window.history.replaceState(null, "", `/dashboard?date=${format(newDate, "yyyy-MM-dd")}`)
  }

  const handleNextDay = () => {
    const newDate = addDays(activeDate, 1)
    setActiveDate(newDate)
    window.history.replaceState(null, "", `/dashboard?date=${format(newDate, "yyyy-MM-dd")}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar userName={userName} currentView={view} onViewChange={setView} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {view === "daily" ? (
          <div key="daily" className="animate-in zoom-in-95 fade-in duration-300 ease-out">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleNextDay}
                className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="text-center">
                <h1 className="text-xl font-bold text-zinc-900">
                  {format(activeDate, "EEEE", { locale: he })}
                </h1>
                <p className="text-sm text-zinc-500">
                  {format(activeDate, "d MMMM yyyy", { locale: he })}
                </p>
                {dayCount > 0 && (
                  <span className="inline-block mt-1 text-xs font-medium text-zinc-900 bg-zinc-100 rounded-full px-2.5 py-0.5">
                    {dayCount} {dayCount === 1 ? "הזמנה" : "הזמנות"}
                  </span>
                )}
              </div>

              <button
                onClick={handlePrevDay}
                className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <DailyView bookings={bookings} selectedDate={activeDate} />
          </div>
        ) : (
          <div key="monthly" className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-zinc-900">סקירה חודשית</h1>
              <p className="text-sm text-zinc-500 mt-1">
                {bookings.length} {bookings.length === 1 ? "הזמנה" : "הזמנות"} בסך הכל
              </p>
            </div>
            <MonthlyView
              bookings={bookings}
              selectedDate={activeDate}
              onDateSelect={handleDateSelect}
            />
          </div>
        )}
      </main>
    </div>
  )
}
