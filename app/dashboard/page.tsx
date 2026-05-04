import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { format, parseISO } from "date-fns"
import { DashboardClient } from "./client"

type SearchParams = Promise<{ date?: string; view?: string }>

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const { date: dateParam, view: viewParam } = await searchParams
  const dateStr = dateParam || format(new Date(), "yyyy-MM-dd")
  const selectedDate = parseISO(dateStr)
  const initialView = (viewParam === "daily" || viewParam === "monthly") ? viewParam : "monthly"

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

  return (
    <DashboardClient
      userName={session.user?.name}
      userEmail={session.user?.email}
      bookings={serialized}
      selectedDate={selectedDate}
      initialView={initialView}
    />
  )
}
