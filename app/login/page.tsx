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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 flex items-center justify-center mb-4">
            <img src="/logo-login.png" alt="HUBbooking" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">ברוך שובך</h1>
          <p className="text-sm text-zinc-500 mt-1">התחבר כדי לנהל הזמנות</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "התחבר"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          אין לך חשבון?{" "}
          <Link href="/register" className="text-zinc-900 font-medium hover:underline">
            הירשם עכשיו
          </Link>
        </p>
      </div>
    </div>
  )
}
