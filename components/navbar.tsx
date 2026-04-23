"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { format } from "date-fns"
import { CalendarDays, LayoutGrid, Plus, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  userName?: string | null
  currentView?: "daily" | "monthly"
  onViewChange?: (view: "daily" | "monthly") => void
  selectedDate?: Date
}

export function Navbar({ userName, currentView, onViewChange, selectedDate }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { id: "daily", href: "/dashboard", label: "יומי", icon: CalendarDays },
    { id: "monthly", href: "/dashboard?view=monthly", label: "חודשי", icon: LayoutGrid },
  ]

  return (
    <header className="sticky top-0 z-50 bg-brand-white/80 backdrop-blur-xl border-b border-brand-black/5">
      <div className="w-full max-w-none px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 group">
          <div className="w-8 h-8 bg-brand-black rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-brand-blue/20 transition-all">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-brand-black tracking-tight text-lg">HUB<span className="text-brand-blue">booking</span></span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ id, href, label, icon: Icon }) => {
            const isActive = currentView ? currentView === id : pathname === "/dashboard" && id === "daily"

            return (
              <button
                key={id}
                onClick={() => {
                  if (onViewChange) {
                    onViewChange(id as "daily" | "monthly")
                  } else {
                    router.push(href)
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-brand-black text-white shadow-md"
                    : "text-brand-black/50 hover:text-brand-black hover:bg-brand-gray"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            )
          })}

          <Link
            href={selectedDate ? `/book?date=${format(selectedDate, "yyyy-MM-dd")}` : "/book"}
            className={cn(
              "flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20",
              pathname === "/book" && "ring-2 ring-brand-blue ring-offset-2"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            הזמן
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="text-xs font-medium text-brand-black/40 hidden sm:block">{userName}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-xl hover:bg-brand-gray transition-colors text-brand-black/20 hover:text-brand-black/60"
            title="התנתק"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
