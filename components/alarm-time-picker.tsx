"use client"

import { useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface TimeValue {
  hour: number
  minute: number
}

interface AlarmTimePickerProps {
  value: TimeValue
  onChange: (value: TimeValue) => void
  minHour?: number
  maxHour?: number
  label?: string
}

const ITEM_HEIGHT = 52

export function AlarmTimePicker({
  value,
  onChange,
  minHour = 8,
  maxHour = 20,
  label,
}: AlarmTimePickerProps) {
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour)
  const minutes = [0, 15, 30, 45]

  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)
  const hourTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const minuteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToHour = useCallback(
    (h: number, smooth = true) => {
      if (!hourRef.current) return
      const index = hours.indexOf(h)
      if (index === -1) return
      hourRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: smooth ? "smooth" : "instant",
      })
    },
    [hours]
  )

  const scrollToMinute = useCallback(
    (m: number, smooth = true) => {
      if (!minuteRef.current) return
      const index = minutes.indexOf(m)
      if (index === -1) return
      minuteRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: smooth ? "smooth" : "instant",
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    const t = setTimeout(() => {
      scrollToHour(value.hour, false)
      scrollToMinute(value.minute, false)
    }, 50)
    return () => clearTimeout(t)
  }, []) // only on mount

  const handleHourScroll = useCallback(() => {
    if (!hourRef.current) return
    if (hourTimer.current) clearTimeout(hourTimer.current)
    hourTimer.current = setTimeout(() => {
      if (!hourRef.current) return
      const index = Math.round(hourRef.current.scrollTop / ITEM_HEIGHT)
      const clamped = Math.max(0, Math.min(hours.length - 1, index))
      const newHour = hours[clamped]
      if (newHour !== value.hour) onChange({ ...value, hour: newHour })
    }, 20)
  }, [hours, value, onChange])

  const handleMinuteScroll = useCallback(() => {
    if (!minuteRef.current) return
    if (minuteTimer.current) clearTimeout(minuteTimer.current)
    minuteTimer.current = setTimeout(() => {
      if (!minuteRef.current) return
      const index = Math.round(minuteRef.current.scrollTop / ITEM_HEIGHT)
      const clamped = Math.max(0, Math.min(minutes.length - 1, index))
      const newMinute = minutes[clamped]
      if (newMinute !== value.minute) onChange({ ...value, minute: newMinute })
    }, 20)
  }, [minutes, value, onChange])

  const VISIBLE = 3
  const containerHeight = VISIBLE * ITEM_HEIGHT

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <span className="text-xs font-semibold text-zinc-700 uppercase tracking-widest">
          {label}
        </span>
      )}

      <div className="flex items-center bg-zinc-50 rounded-3xl px-4 py-3 gap-0 shadow-inner border border-zinc-100" dir="ltr">
        {/* Hour drum */}
        <div className="relative" style={{ width: 56, height: containerHeight }}>
          {/* Fade top */}
          <div
            className="absolute inset-x-0 top-0 z-10 pointer-events-none rounded-t-2xl"
            style={{
              height: ITEM_HEIGHT,
              background: "linear-gradient(to bottom, rgb(250 250 250), transparent)",
            }}
          />
          {/* Fade bottom */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 pointer-events-none rounded-b-2xl"
            style={{
              height: ITEM_HEIGHT,
              background: "linear-gradient(to top, rgb(250 250 250), transparent)",
            }}
          />
          {/* Selection ring */}
          <div
            className="absolute inset-x-0 z-0 bg-white rounded-2xl shadow-sm border border-zinc-200 pointer-events-none"
            style={{
              top: ITEM_HEIGHT,
              height: ITEM_HEIGHT,
            }}
          />
          <div
            ref={hourRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative z-20"
            onScroll={handleHourScroll}
          >
            <div style={{ paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT }}>
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: ITEM_HEIGHT }}
                  className={cn(
                    "flex items-center justify-center snap-center cursor-pointer select-none transition-all duration-150",
                    value.hour === h
                      ? "text-zinc-900 text-2xl font-bold"
                      : "text-zinc-500 text-xl font-light"
                  )}
                  onClick={() => {
                    onChange({ ...value, hour: h })
                    scrollToHour(h)
                  }}
                >
                  {h.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colon */}
        <span className="text-2xl font-bold text-zinc-900 w-6 text-center select-none">
          :
        </span>

        {/* Minute drum */}
        <div className="relative" style={{ width: 56, height: containerHeight }}>
          <div
            className="absolute inset-x-0 top-0 z-10 pointer-events-none rounded-t-2xl"
            style={{
              height: ITEM_HEIGHT,
              background: "linear-gradient(to bottom, rgb(250 250 250), transparent)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 z-10 pointer-events-none rounded-b-2xl"
            style={{
              height: ITEM_HEIGHT,
              background: "linear-gradient(to top, rgb(250 250 250), transparent)",
            }}
          />
          <div
            className="absolute inset-x-0 z-0 bg-white rounded-2xl shadow-sm border border-zinc-200 pointer-events-none"
            style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
          />
          <div
            ref={minuteRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative z-20"
            onScroll={handleMinuteScroll}
          >
            <div style={{ paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT }}>
              {minutes.map((m) => (
                <div
                  key={m}
                  style={{ height: ITEM_HEIGHT }}
                  className={cn(
                    "flex items-center justify-center snap-center cursor-pointer select-none transition-all duration-150",
                    value.minute === m
                      ? "text-zinc-900 text-2xl font-bold"
                      : "text-zinc-500 text-xl font-light"
                  )}
                  onClick={() => {
                    onChange({ ...value, minute: m })
                    scrollToMinute(m)
                  }}
                >
                  {m.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time readout */}
      <span className="text-xs font-mono text-zinc-700" dir="ltr">
        {value.hour.toString().padStart(2, "0")}:{value.minute.toString().padStart(2, "0")}
      </span>
    </div>
  )
}
