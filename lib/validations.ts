import { z } from "zod"

export const bookingSchema = z
  .object({
    name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
    email: z.string().email("כתובת אימייל לא תקינה"),
    phone: z.string().min(10, "מספר טלפון חייב להכיל לפחות 10 ספרות"),
    date: z.string().min(1, "יש לבחור תאריך"),
    startHour: z.number().min(8).max(20),
    startMinute: z.number().min(0).max(59),
    endHour: z.number().min(8).max(20),
    endMinute: z.number().min(0).max(59),
  })
  .refine(
    (data) => {
      const start = data.startHour * 60 + data.startMinute
      const end = data.endHour * 60 + data.endMinute
      return end > start
    },
    { message: "שעת הסיום חייבת להיות אחרי שעת ההתחלה", path: ["endHour"] }
  )
  .refine(
    (data) => {
      const start = data.startHour * 60 + data.startMinute
      const end = data.endHour * 60 + data.endMinute
      return end - start <= 180
    },
    { message: "משך ההזמנה המקסימלי הוא 3 שעות", path: ["endHour"] }
  )
  .refine(
    (data) => data.endHour * 60 + data.endMinute <= 20 * 60,
    { message: "ההזמנה חייבת להסתיים עד 20:00", path: ["endHour"] }
  )

export type BookingFormData = z.infer<typeof bookingSchema>

export const loginSchema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
})
