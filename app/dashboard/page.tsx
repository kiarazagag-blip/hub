import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Navbar } from "@/components/navbar"
import { DailyView } from "@/components/daily-view"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: { date?: string }
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const dateStr = searchParams.date || format(new Date(), "yyyy-MM-dd")
  const selectedDate = parseISO(dateStr)

  const prevDate = new Date(selectedDate)
  prevDate.setDate(prevDate.getDate() - 1)
  const nextDate = new Date(selectedDate)
  nextDate.setDate(nextDate.getDate() + 1)

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

  const dayCount = serialized.filter((b) => {
    const d = new Date(b.startTime)
    return d.toDateString() === selectedDate.toDateString()
  }).length

  return (
    <div className="min-h-screen bg-white">
      <Navbar userName={session.user?.name} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Date navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/dashboard?date=${format(prevDate, "yyyy-MM-dd")}`}
            className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-bold text-zinc-900">
              {format(selectedDate, "EEEE")}
            </h1>
            <p className="text-sm text-zinc-500">
              {format(selectedDate, "MMMM d, yyyy")}
            </p>
            {dayCount > 0 && (
              <span className="inline-block mt-1 text-xs font-medium text-zinc-900 bg-zinc-100 rounded-full px-2.5 py-0.5">
                {dayCount} booking{dayCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <Link
            href={`/dashboard?date=${format(nextDate, "yyyy-MM-dd")}`}
            className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <DailyView bookings={serialized} selectedDate={selectedDate} />
      </main>
    </div>
  )
}
