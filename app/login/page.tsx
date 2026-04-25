"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema } from "@/lib/validations"
import type { z } from "zod"
import { Loader2, CalendarDays, AlertCircle } from "lucide-react"

type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError("אימייל או סיסמה שגויים.")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Image - Zero Tint */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/login-bg.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-100 scale-105" 
        />
      </div>

      <div className="w-full max-w-sm relative z-10 bg-white/10 backdrop-blur-sm p-8 rounded-[40px] border border-white/20 shadow-2xl overflow-hidden group">
        {/* Subtle glass edge highlight */}
        <div className="absolute inset-0 border border-white/10 rounded-[40px] pointer-events-none" />
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 flex items-center justify-center mb-6">
            <img src="/logo-login.png" alt="HUBbooking" className="w-full h-full object-contain drop-shadow-2xl brightness-0" />
          </div>
          <h1 className="text-3xl font-bold text-brand-black tracking-tight">ברוך שובך</h1>
          <p className="text-sm text-brand-black/60 mt-2 font-medium">התחבר כדי לנהל הזמנות</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-brand-black/70 text-xs font-bold mr-1">אימייל</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register("email")}
              className="bg-black/5 border-black/10 text-brand-black placeholder:text-brand-black/20 h-12 rounded-2xl focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
            />
            {errors.email && (
              <p className="text-xs text-red-600 font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-brand-black/70 text-xs font-bold mr-1">סיסמה</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              className="bg-black/5 border-black/10 text-brand-black placeholder:text-brand-black/20 h-12 rounded-2xl focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
            />
            {errors.password && (
              <p className="text-xs text-red-600 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            size="lg" 
            className="w-full mt-4 h-14 bg-brand-black hover:bg-brand-black/90 text-white rounded-2xl font-bold shadow-xl shadow-brand-black/20 active:scale-[0.98] transition-all" 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "התחבר"}
          </Button>
        </form>

        <p className="text-center text-sm text-brand-black/40 mt-8">
          אין לך חשבון?{" "}
          <Link href="/register" className="text-brand-black font-bold hover:text-brand-blue transition-colors underline underline-offset-4 decoration-black/10">
            הירשם עכשיו
          </Link>
        </p>
      </div>
    </div>
  )
}
