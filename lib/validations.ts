import { z } from "zod"

export const bookingSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    date: z.string().min(1, "Date is required"),
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
    { message: "End time must be after start time", path: ["endHour"] }
  )
  .refine(
    (data) => {
      const start = data.startHour * 60 + data.startMinute
      const end = data.endHour * 60 + data.endMinute
      return end - start <= 180
    },
    { message: "Maximum booking duration is 3 hours", path: ["endHour"] }
  )
  .refine(
    (data) => data.endHour * 60 + data.endMinute <= 20 * 60,
    { message: "Booking must end by 20:00", path: ["endHour"] }
  )

export type BookingFormData = z.infer<typeof bookingSchema>

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
