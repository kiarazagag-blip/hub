import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { BookingForm } from "@/components/booking-form"

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const { date } = await searchParams
  const initialDate = date

  return (
    <div className="min-h-screen bg-white">
      <Navbar userName={session.user?.name} />

      <main className="max-w-lg mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-zinc-900">הזמנה חדשה</h1>
          <p className="text-sm text-zinc-500 mt-1">
            הזמנת חדר ישיבות · 08:00 – 20:00 · עד 3 שעות
          </p>
        </div>

        <BookingForm initialDate={initialDate} />
      </main>
    </div>
  )
}
