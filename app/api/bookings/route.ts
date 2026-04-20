import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { bookingSchema } from "@/lib/validations"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: "asc" },
  })

  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = bookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, phone, date, startHour, startMinute, endHour, endMinute } =
      parsed.data

    // Construct Date objects
    const startTime = new Date(`${date}T${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:00`)
    const endTime = new Date(`${date}T${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`)

    // Double-booking conflict check
    const conflicts = await prisma.booking.findMany({
      where: {
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    })

    if (conflicts.length > 0) {
      const c = conflicts[0]
      return NextResponse.json(
        {
          error: `Time slot conflicts with an existing booking (${new Date(c.startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} – ${new Date(c.endTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}).`,
        },
        { status: 409 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        phone,
        startTime,
        endTime,
        userId: session.user.id,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
