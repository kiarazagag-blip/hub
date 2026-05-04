"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { AlarmTimePicker } from "@/components/alarm-time-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { bookingSchema, type BookingFormData } from "@/lib/validations"
import { AlertCircle, CheckCircle2, Loader2, Calendar } from "lucide-react"

interface TimeValue {
  hour: number
  minute: number
}

interface BookingFormProps {
  initialDate?: string
}

export function BookingForm({ initialDate }: BookingFormProps) {
  const router = useRouter()
  const [startTime, setStartTime] = useState<TimeValue>({ hour: 9, minute: 0 })
  const [endTime, setEndTime] = useState<TimeValue>({ hour: 10, minute: 0 })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [isCancelling, setIsCancelling] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: initialDate || format(new Date(), "yyyy-MM-dd"),
      startHour: 9,
      startMinute: 0,
      endHour: 10,
      endMinute: 0,
    },
  })

  const handleStartChange = (val: TimeValue) => {
    setStartTime(val)
    setValue("startHour", val.hour, { shouldValidate: false })
    setValue("startMinute", val.minute, { shouldValidate: false })
  }

  const handleEndChange = (val: TimeValue) => {
    setEndTime(val)
    setValue("endHour", val.hour, { shouldValidate: false })
    setValue("endMinute", val.minute, { shouldValidate: false })
  }

  const onSubmit = async (data: BookingFormData) => {
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || "ההזמנה נכשלה.")
        setStatus("error")
        return
      }

      setStatus("success")
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch {
      setErrorMsg("שגיאת רשת. נסה שוב.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900">ההזמנה אושרה!</h2>
        <p className="text-zinc-700 text-sm">מעביר ללוח הבקרה…</p>
      </div>
    )
  }

  const durationMins =
    endTime.hour * 60 + endTime.minute - (startTime.hour * 60 + startTime.minute)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Info & Date */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-widest">
          הפרטים שלך
        </h2>

        <div className="space-y-2">
          <Label htmlFor="name">שם מלא</Label>
          <Input id="name" placeholder="ישראל ישראלי" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">כתובת אימייל</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">מספר טלפון</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="050-0000000"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">תאריך הזמנה</Label>
          <div className="relative h-9 w-full">
            <Input
              id="date"
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              {...register("date")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute inset-0 w-full h-full flex items-center justify-between px-3 border border-input rounded-md bg-white text-sm shadow-sm pointer-events-none z-0 transition-colors">
              <span className="text-zinc-900" dir="ltr">
                {watch("date") ? format(new Date(watch("date")), "dd/MM/yyyy") : ""}
              </span>
              <Calendar className="w-4 h-4 text-zinc-500" />
            </div>
          </div>
          {errors.date && (
            <p className="text-xs text-red-600">{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* Time pickers */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-widest text-center">
          ניתן לסמן עד 3 שעות
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <AlarmTimePicker
            label="התחלה"
            value={startTime}
            onChange={handleStartChange}
            minHour={8}
            maxHour={20}
          />
          <AlarmTimePicker
            label="סיום"
            value={endTime}
            onChange={handleEndChange}
            minHour={8}
            maxHour={20}
          />
        </div>

        {(errors.startHour || errors.endHour) && (
          <p className="text-xs text-red-600 text-center">
            {errors.endHour?.message || errors.startHour?.message}
          </p>
        )}
      </div>

      {/* Duration preview */}
      <div className="rounded-2xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-800">
        משך:{" "}
        <span className="font-semibold text-zinc-900">
          {durationMins <= 0
            ? "—"
            : `${Math.floor(durationMins / 60) > 0 ? `${Math.floor(durationMins / 60)} שע׳ ` : ""}${durationMins % 60 > 0 ? `${durationMins % 60} דק׳` : ""}`}
        </span>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="flex-1 rounded-2xl text-brand-black/60 hover:text-brand-black hover:bg-brand-gray"
          disabled={isCancelling || status === "loading"}
          onClick={() => {
            setIsCancelling(true)
            window.location.href = "/dashboard?view=monthly"
          }}
        >
          {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "ביטול"}
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-[2] bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl shadow-lg shadow-brand-blue/20"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              בודק זמינות…
            </>
          ) : (
            "אישור הזמנה"
          )}
        </Button>
      </div>
    </form>
  )
}
