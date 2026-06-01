"use client"

import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<{
    newPassword: string
    confirmPassword: string
  }>()

  const onSubmit = async (data: { newPassword: string; confirmPassword: string }) => {
    if (!token) {
      setError("הקישור אינו תקין")
      setStatus("error")
      return
    }
    setStatus("loading")
    setError("")
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "שגיאה. נסה שוב.")
        setStatus("error")
      } else {
        setStatus("success")
        setTimeout(() => router.push("/login"), 2500)
      }
    } catch {
      setError("שגיאת רשת. נסה שוב.")
      setStatus("error")
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h1 className="text-xl font-bold text-white">קישור לא תקין</h1>
        <p className="text-sm text-white/60">הקישור שבו השתמשת אינו תקין או שפג תוקפו.</p>
        <Link href="/forgot-password" className="text-sm font-bold text-white/80 underline mt-2">
          בקש קישור חדש
        </Link>
      </div>
    )
  }

  return (
    <>
      {status === "success" ? (
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">הסיסמה עודכנה!</h1>
          <p className="text-sm text-white/60">מעביר אותך להתחברות…</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">סיסמה חדשה</h1>
            <p className="text-sm text-white/60 mt-2 text-center">בחר סיסמה חדשה לחשבונך</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white/70 text-xs font-bold mr-1">סיסמה חדשה</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="לפחות 6 תווים"
                  {...register("newPassword", {
                    required: "נדרשת סיסמה",
                    minLength: { value: 6, message: "הסיסמה חייבת להכיל לפחות 6 תווים" },
                  })}
                  className="bg-black/5 border-black/10 text-white placeholder:text-white/20 h-12 rounded-2xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-400 font-medium mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/70 text-xs font-bold mr-1">אימות סיסמה</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="הזן שוב את הסיסמה"
                {...register("confirmPassword", {
                  required: "נדרש אימות סיסמה",
                  validate: (val) => val === watch("newPassword") || "הסיסמאות אינן תואמות",
                })}
                className="bg-black/5 border-black/10 text-white placeholder:text-white/20 h-12 rounded-2xl"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 font-medium mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
                {error.includes("פג תוקף") && (
                  <Link href="/forgot-password" className="underline mr-1 shrink-0">בקש חדש</Link>
                )}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 h-14 bg-white text-brand-black rounded-2xl font-bold shadow-xl"
              disabled={status === "loading"}
            >
              {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "עדכן סיסמה"}
            </Button>
          </form>
        </>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/login-bg.png" alt="Background" className="w-full h-full object-cover opacity-100 scale-105" />
      </div>
      <div className="w-full max-w-sm relative z-10 bg-white/10 backdrop-blur-sm p-8 rounded-[40px] border border-white/20 shadow-2xl">
        <div className="absolute inset-0 border border-white/10 rounded-[40px] pointer-events-none" />
        <Suspense fallback={<div className="text-white text-center">טוען…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
