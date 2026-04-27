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
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Plus } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 1,
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
}

export function DashboardClient({ 
  userName, 
  bookings, 
  selectedDate, 
  prevDate,
  nextDate,
  initialView = "monthly" 
}: { 
  userName?: string | null; 
  bookings: any; 
  selectedDate: Date; 
  prevDate: Date;
  nextDate: Date;
  initialView?: "daily" | "monthly" 
}) {
  const [view, setView] = useState<"daily" | "monthly">(initialView)
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

  const [isSwiping, setIsSwiping] = useState(false)

  const handleDateSelect = (date: Date) => {
    if (isSwiping) return
    setActiveDate(date)
    setView("daily")
    window.history.replaceState(null, "", `/dashboard?date=${format(date, "yyyy-MM-dd")}`)
  }

  const handleMonthChange = (offset: number) => {
    const next = offset > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1)
    setCurrentMonth(next)
    
    // Also sync the active date to the same day in the new month
    const nextActive = offset > 0 ? addMonths(activeDate, 1) : subMonths(activeDate, 1)
    setActiveDate(nextActive)
  }

  const DAY_NAMES = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]

  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar userName={userName} currentView={view} onViewChange={setView} selectedDate={activeDate} />

      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col">
          {/* Header Section */}
          <div className="bg-brand-gray z-30 pb-4">
            <div className="flex items-center justify-between pt-6 mb-2">
              <button
                onClick={() => (view === "daily" ? setView("monthly") : handleMonthChange(-1))}
                className="p-2 rounded-xl hover:bg-white transition-colors text-brand-black/60"
              >
                {view === "daily" ? <CalendarIcon className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>

              <div className="text-center">
                <h1 className="text-xl font-bold text-brand-black tracking-tight">
                  {view === "daily"
                    ? format(activeDate, "EEEE d MMMM", { locale: he })
                    : format(currentMonth, "MMMM yyyy", { locale: he })}
                </h1>
                <p className="text-xs font-bold text-brand-black/30">
                  {view === "daily"
                    ? format(activeDate, "yyyy", { locale: he })
                    : `${bookings.length} הזמנות`}
                </p>
              </div>

              <button
                onClick={() => (view === "daily" ? setView("monthly") : handleMonthChange(1))}
                className="p-2 rounded-xl hover:bg-white transition-colors text-brand-black/60"
              >
                {view === "daily" ? <span className="text-xs font-bold px-2">סגור</span> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
            
            {view === "monthly" && (
              <div className="grid grid-cols-7 border-b border-brand-black/5 pb-2">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-brand-black/20 uppercase tracking-widest">
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Grid */}
          <motion.div 
            className="relative overflow-hidden"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragStart={() => setIsSwiping(false)}
            onDrag={(_, info) => {
              if (Math.abs(info.offset.x) > 10) setIsSwiping(true)
            }}
            onDragEnd={(_, info) => {
              if (view === "monthly" && isSwiping) {
                if (info.offset.x > 80) handleMonthChange(-1)
                else if (info.offset.x < -80) handleMonthChange(1)
              }
              // Small delay to ensure click doesn't fire immediately after drag
              setTimeout(() => setIsSwiping(false), 50)
            }}
          >
            <div className={cn("transition-all duration-300", view === "monthly" ? "pt-4" : "pt-0")}>
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
                      y: isDaily ? (isAbove ? -600 : (isAnchor ? 0 : 1000)) : 0,
                      opacity: isDaily ? (isAnchor ? 1 : 0) : 1,
                      height: isDaily ? (isAnchor ? "auto" : 0) : "auto",
                      marginBottom: isDaily ? (isAnchor ? 20 : 0) : 8,
                    }}
                    transition={TRANSITION}
                    className={cn(
                      "grid grid-cols-7 gap-2",
                      isDaily && !isAnchor && "pointer-events-none"
                    )}
                  >
                    {week.map((date, di) => {
                      const inMonth = isSameMonth(date, currentMonth)
                      const isSelected = isSameDay(date, activeDate)
                      const hasBooking = bookings.some((b: any) => isSameDay(new Date(b.startTime), date))
                      const today = isToday(date)

                      return (
                        <motion.button
                          key={di}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (isSwiping) return
                            if (isSelected && view === "daily") {
                              setView("monthly")
                            } else {
                              handleDateSelect(date)
                            }
                          }}
                          className={cn(
                            "relative aspect-[1/1.5] flex flex-col items-center justify-start group transition-all duration-200",
                            !inMonth && "text-brand-black/20"
                          )}
                        >
                          <div className="relative w-11 h-11 flex flex-col items-center justify-center shrink-0">
                            {isSelected && (
                              <motion.div
                                layoutId="active-date-bg"
                                className="absolute inset-0 bg-brand-blue rounded-2xl z-0"
                                transition={TRANSITION}
                              />
                            )}
                            {!isSelected && today && (
                              <div className="absolute inset-0 bg-[#ffbb0d]/20 rounded-2xl z-0" />
                            )}
                            <span className={cn(
                              "relative z-10 text-lg transition-all",
                              isSelected ? "text-white font-bold" : (inMonth ? "text-brand-black font-medium" : "text-brand-black/15 font-medium"),
                              today && !isSelected ? "text-[#ffbb0d] font-extrabold" : ""
                            )}>
                              {format(date, "d")}
                            </span>
                          </div>
                          
                          {hasBooking && (
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full mt-2 transition-colors",
                                isSelected ? "bg-[#BFE9FF]" : "bg-brand-black/20"
                              )}
                            />
                          )}
                        </motion.button>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ ...TRANSITION, delay: 0.05 }}
                  className="mt-2"
                >
                  <DailyView bookings={bookings} selectedDate={activeDate} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      {/* Floating Action Button */}
      <Link
        href={`/book?date=${format(activeDate, "yyyy-MM-dd")}`}
        className="fixed bottom-6 left-6 w-14 h-14 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 z-50 hover:bg-brand-blue/90"
      >
        <Plus className="w-8 h-8" />
      </Link>
    </div>
  )
}
