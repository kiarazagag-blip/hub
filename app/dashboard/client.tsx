"use client"

import { useState, useMemo } from "react"
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { he } from "date-fns/locale"
import { Navbar } from "@/components/navbar"
import { DailyView } from "@/components/daily-view"
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1], // iOS Standard "Fast Out, Slow In"
}

export function DashboardClient({ userName, bookings, selectedDate }: any) {
  const [view, setView] = useState<"daily" | "monthly">("monthly")
  const [activeDate, setActiveDate] = useState<Date>(new Date(selectedDate))
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate))

  // Generate weeks for the current month
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
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
    return weeks
  }, [currentMonth])

  // Find index of the week containing the active date
  const anchorWeekIndex = useMemo(() => {
    return weeks.findIndex((week) =>
      week.some((day) => isSameDay(day, activeDate))
    )
  }, [weeks, activeDate])

  const handleDateSelect = (date: Date) => {
    setActiveDate(date)
    setView("daily")
    window.history.replaceState(null, "", `/dashboard?date=${format(date, "yyyy-MM-dd")}`)
  }

  const handleMonthChange = (offset: number) => {
    const next = offset > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1)
    setCurrentMonth(next)
  }

  const DAY_NAMES = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]

  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar userName={userName} currentView={view} onViewChange={setView} selectedDate={activeDate} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => (view === "daily" ? setView("monthly") : handleMonthChange(1))}
              className="p-2 rounded-xl hover:bg-white transition-colors text-brand-black/60"
            >
              {view === "daily" ? <CalendarIcon className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            <motion.div
              layout
              className="text-center"
              transition={TRANSITION}
            >
              <h1 className="text-xl font-bold text-brand-black">
                {view === "daily"
                  ? format(activeDate, "EEEE", { locale: he })
                  : format(currentMonth, "MMMM yyyy", { locale: he })}
              </h1>
              <p className="text-sm text-brand-black/50">
                {view === "daily"
                  ? format(activeDate, "d MMMM yyyy", { locale: he })
                  : `${bookings.length} הזמנות החודש`}
              </p>
            </motion.div>

            <button
              onClick={() => (view === "daily" ? setView("monthly") : handleMonthChange(-1))}
              className="p-2 rounded-xl hover:bg-white transition-colors text-brand-black/60"
            >
              {view === "daily" ? <span className="text-xs font-bold px-2">סגור</span> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-brand-black/5 relative">
            {/* Day Labels */}
            <motion.div
              layout
              className="grid grid-cols-7 mb-2"
            >
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-brand-black/20 py-2 uppercase tracking-tighter">
                  {d}
                </div>
              ))}
            </motion.div>

            {/* Weeks Container */}
            <div className="space-y-1">
              {weeks.map((week, wi) => {
                const isAnchor = wi === anchorWeekIndex
                const isAbove = wi < anchorWeekIndex
                const isDaily = view === "daily"

                return (
                  <motion.div
                    key={wi}
                    layout
                    initial={false}
                    animate={{
                      y: isDaily ? (isAbove ? -200 : (isAnchor ? 0 : 400)) : 0,
                      opacity: isDaily ? (isAnchor ? 1 : 0) : 1,
                      height: isDaily ? (isAnchor ? "auto" : 0) : "auto",
                      marginBottom: isDaily ? (isAnchor ? 24 : 0) : 4,
                    }}
                    transition={TRANSITION}
                    className={cn(
                      "grid grid-cols-7 gap-1 overflow-hidden",
                      isDaily && !isAnchor && "pointer-events-none"
                    )}
                  >
                    {week.map((date, di) => {
                      const inMonth = isSameMonth(date, currentMonth)
                      const isSelected = isSameDay(date, activeDate)
                      const hasBooking = bookings.some((b: any) => isSameDay(new Date(b.startTime), date))
                      const today = isToday(date)

                      return (
                        <button
                          key={di}
                          onClick={() => {
                            if (isSelected && view === "daily") {
                              setView("monthly")
                            } else {
                              handleDateSelect(date)
                            }
                          }}
                          className={cn(
                            "relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-200",
                            !inMonth && "opacity-20",
                            isSelected ? "text-white" : "text-brand-black hover:bg-brand-gray",
                            !isSelected && today && "bg-brand-yellow/20 text-brand-black font-bold",
                            !isSelected && !inMonth && "text-brand-black/40"
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="active-date-bg"
                              className="absolute inset-1 bg-brand-blue rounded-xl z-0 shadow-lg shadow-brand-blue/30"
                              transition={TRANSITION}
                            />
                          )}
                          {!isSelected && today && (
                            <div className="absolute inset-1 bg-brand-yellow rounded-xl z-0" />
                          )}
                          <span className={cn("relative z-10 font-medium", isSelected && "font-bold")}>
                            {format(date, "d")}
                          </span>
                          {hasBooking && (
                            <span
                              className={cn(
                                "relative z-10 w-1 h-1 rounded-full mt-0.5",
                                isSelected ? "bg-white/80" : "bg-brand-black/20"
                              )}
                            />
                          )}
                        </button>
                      )
                    })}
                  </motion.div>
                )
              })}
            </div>

            {/* Daily View Accordion */}
            <AnimatePresence mode="wait">
              {view === "daily" && (
                <motion.div
                  key="daily-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ ...TRANSITION, delay: 0.1 }}
                  className="mt-4 pt-4 border-t border-brand-gray"
                >
                  <DailyView bookings={bookings} selectedDate={activeDate} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
