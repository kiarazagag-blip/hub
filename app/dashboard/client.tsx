"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import {
  format,
  addDays,
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
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Plus, Loader2, Phone, Clock } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Curtain: snappy tween for date open/close
const CURTAIN = {
  duration: 0.15,
  ease: [0.25, 0.46, 0.45, 0.94],
}

// Carousel: crisp Instagram-like snap
const SLIDE = {
  type: "spring",
  stiffness: 600,
  damping: 45,
  mass: 0.6,
}

// RTL: next month enters from LEFT
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", zIndex: 1 }),
  center: { x: 0, zIndex: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", zIndex: 0 }),
}

export function DashboardClient({
  userName,
  userEmail,
  bookings,
  selectedDate,
  initialView = "monthly",
}: {
  userName?: string | null
  userEmail?: string | null
  bookings: any
  selectedDate: Date
  initialView?: "daily" | "monthly"
}) {
  const [view, setView] = useState<"daily" | "monthly">(initialView)
  const [activeDate, setActiveDate] = useState<Date>(new Date(selectedDate))
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate))
  const [[monthPage, slideDir], setMonthPage] = useState([0, 0])
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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



  // Lock body scroll in monthly view
  useEffect(() => {
    if (view === "monthly") {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [view])

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

  const anchorWeekIndex = useMemo(() => {
    return weeks.findIndex((week) => week.some((day) => isSameDay(day, activeDate)))
  }, [weeks, activeDate])

  const handleDateSelect = (date: Date) => {
    setActiveDate(date)
    setView("daily")
    window.history.replaceState(null, "", `/dashboard?date=${format(date, "yyyy-MM-dd")}`)
  }

  const handleMonthChange = (offset: number) => {
    setMonthPage(([page]) => [page + offset, offset])
    const next = offset > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1)
    setCurrentMonth(next)
  }

  const DAY_NAMES = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]

  return (
    <div className={cn("bg-brand-gray w-full overscroll-none", view === "monthly" ? "h-[100dvh] overflow-hidden touch-none" : "min-h-[100dvh]")}>
      <Navbar userName={userName} currentView={view} onViewChange={setView} selectedDate={activeDate} />

      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col">

          {/* Header — sticky, clips anything sliding behind it */}
          <div className="sticky top-0 bg-brand-gray z-50 pb-2">
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

          {/* Calendar carousel */}
          <div className="relative z-0 overflow-hidden grid" style={{ gridTemplateAreas: "'carousel'" }}>
            <AnimatePresence initial={false} custom={slideDir}>
              <motion.div
                key={monthPage}
                custom={slideDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={SLIDE}
                drag={view === "monthly" ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const power = offset.x + velocity.x * 0.3
                  // RTL: right = next month, left = previous month
                  if (power > 50) handleMonthChange(1)
                  else if (power < -50) handleMonthChange(-1)
                }}
                style={{ gridArea: "carousel", touchAction: view === "monthly" ? "pan-x" : "pan-y" }}
                className="w-full pt-4 bg-brand-gray"
              >
                {/* Week rows with curtain animation */}
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
                        y: isDaily ? (isAbove ? -600 : isAnchor ? 0 : 1000) : 0,
                        opacity: isDaily ? (isAnchor ? 1 : 0) : 1,
                        height: isDaily ? (isAnchor ? "auto" : 0) : "auto",
                        marginBottom: isDaily ? (isAnchor ? 20 : 0) : 8,
                      }}
                      transition={CURTAIN}
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
                            whileTap={{ scale: 0.92 }}
                            onClick={() => {
                              if (isSelected && view === "daily") setView("monthly")
                              else handleDateSelect(date)
                            }}
                            className={cn(
                              "relative aspect-[1/1.5] flex flex-col items-center justify-start transition-all duration-200",
                              !inMonth && "text-brand-black/20"
                            )}
                          >
                            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                              {isSelected && (
                                <motion.div
                                  className="absolute inset-0 bg-brand-blue rounded-2xl z-0"
                                  initial={{ scale: 0.6, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              )}
                              {!isSelected && today && (
                                <div className="absolute inset-0 bg-[#ffbb0d]/20 rounded-2xl z-0" />
                              )}
                              <span className={cn(
                                "relative z-10 text-lg",
                                isSelected
                                  ? "text-white font-bold"
                                  : inMonth
                                  ? "text-brand-black font-medium"
                                  : "text-brand-black/15 font-medium",
                                today && !isSelected && "text-[#ffbb0d] font-extrabold"
                              )}>
                                {format(date, "d")}
                              </span>
                            </div>

                            {hasBooking && (
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full mt-2 transition-colors",
                                isSelected ? "bg-[#BFE9FF]" : "bg-brand-black/20"
                              )} />
                            )}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )
                })}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Daily view — outside the drag carousel so touch-action never interferes */}
          <AnimatePresence mode="wait">
            {view === "daily" && (
              <motion.div
                key="daily-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="mt-2 pb-24"
              >
                <DailyView bookings={bookings} selectedDate={activeDate} onBookingClick={setSelectedBooking} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Floating Action Button */}
      <Link
        href={`/book?date=${format(activeDate, "yyyy-MM-dd")}`}
        className="fixed bottom-6 left-6 w-14 h-14 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-2xl z-50 touch-manipulation active:scale-90 active:brightness-90 transition-transform"
      >
        <Plus className="w-8 h-8" />
      </Link>

      {/* Booking Details Modal - Lifted to Root to break out of z-index/overflow bounds */}
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

              {userEmail && selectedBooking?.email && userEmail.toLowerCase() === selectedBooking.email.toLowerCase() && (
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
