import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "הסיסמה חייבת להכיל לפחות 6 תווים" }, { status: 400 })
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken) {
      return NextResponse.json({ error: "הקישור אינו תקין" }, { status: 400 })
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json({ error: "הקישור פג תוקף. אנא בקש קישור חדש" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: resetToken.email } })
    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    // Delete the used token
    await prisma.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("reset-password error:", error)
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 })
  }
}
