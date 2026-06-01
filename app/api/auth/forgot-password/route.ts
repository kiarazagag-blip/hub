import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { randomBytes } from "crypto"
import { Resend } from "resend"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "נדרשת כתובת אימייל" }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (user) {
      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email: email.toLowerCase() } })

      // Create new token
      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: { token, email: email.toLowerCase(), expiresAt },
      })

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "איפוס סיסמה — HUBbooking",
        html: `
          <div dir="rtl" style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f8f8; border-radius: 16px;">
            <h1 style="font-size: 22px; font-weight: 800; color: #111; margin-bottom: 8px;">איפוס סיסמה</h1>
            <p style="color: #555; font-size: 15px; margin-bottom: 24px;">קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הכפתור למטה לבחירת סיסמה חדשה:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px;">
              אפס סיסמה
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">הקישור תקף לשעה אחת. אם לא ביקשת איפוס סיסמה, ניתן להתעלם מהודעה זו.</p>
          </div>
        `,
      })
    }

    // Always return the same response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("forgot-password error:", error)
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 })
  }
}
