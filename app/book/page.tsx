import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { BookingForm } from "@/components/booking-form"

export default async function BookPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-white">
      <Navbar userName={session.user?.name} />

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-zinc-900">הזמנה חדשה</h1>
          <p className="text-sm text-zinc-500 mt-1">
            הזמנת חדר ישיבות · 08:00 – 20:00 · עד 3 שעות
          </p>
        </div>

        <BookingForm />
      </main>
    </div>
  )
}
