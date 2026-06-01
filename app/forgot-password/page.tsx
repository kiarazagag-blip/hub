"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    setStatus("loading")
    setError("")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "שגיאה. נסה שוב.")
        setStatus("error")
      } else {
        setStatus("success")
      }
    } catch {
      setError("שגיאת רשת. נסה שוב.")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/login-bg.png" alt="Background" className="w-full h-full object-cover opacity-100 scale-105" />
      </div>

      <div className="w-full max-w-sm relative z-10 bg-white/10 backdrop-blur-sm p-8 rounded-[40px] border border-white/20 shadow-2xl">
        <div className="absolute inset-0 border border-white/10 rounded-[40px] pointer-events-none" />

        {status === "success" ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">בדוק את האימייל שלך</h1>
            <p className="text-sm text-white/60">
              אם קיים חשבון עם כתובת זו, שלחנו אליך קישור לאיפוס הסיסמה. הקישור תקף לשעה אחת.
            </p>
            <Link
              href="/login"
              className="mt-4 text-sm font-bold text-white/80 flex items-center gap-1"
            >
              <ArrowRight className="w-4 h-4" />
              חזור להתחברות
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">שכחת סיסמה?</h1>
              <p className="text-sm text-white/60 mt-2 text-center">
                הזן את האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70 text-xs font-bold mr-1">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...register("email", { required: "נדרשת כתובת אימייל" })}
                  className="bg-black/5 border-black/10 text-white placeholder:text-white/20 h-12 rounded-2xl"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 font-medium mt-1">{errors.email.message}</p>
                )}
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 h-14 bg-white text-brand-black rounded-2xl font-bold shadow-xl"
                disabled={status === "loading"}
              >
                {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "שלח קישור לאיפוס"}
              </Button>

              <Link
                href="/login"
                className="block text-center text-sm text-white/40 mt-4"
              >
                חזור להתחברות
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
