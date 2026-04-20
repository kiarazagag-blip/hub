import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MonthlyDayDetail } from "@/components/monthly-day-detail"

export default async function MonthlyPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: "asc" },
  })

  const serialized = bookings.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar userName={session.user?.name} />

      <main className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-zinc-900">סקירה חודשית</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {bookings.length} {bookings.length === 1 ? "הזמנה" : "הזמנות"} בסך הכל
          </p>
        </div>

        <MonthlyDayDetail bookings={serialized} />
      </main>
    </div>
  )
}
