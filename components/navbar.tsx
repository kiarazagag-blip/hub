"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { CalendarDays, LayoutGrid, Plus, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  userName?: string | null
  currentView?: "daily" | "monthly"
  onViewChange?: (view: "daily" | "monthly") => void
}

export function Navbar({ userName, currentView, onViewChange }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { id: "daily", href: "/dashboard", label: "יומי", icon: CalendarDays },
    { id: "monthly", href: "/dashboard?view=monthly", label: "חודשי", icon: LayoutGrid },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
      <div className="w-full max-w-none px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
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
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            )
          })}

          <Link
            href="/book"
            className={cn(
              "flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all bg-zinc-900 text-white hover:bg-zinc-800",
              pathname === "/book" && "bg-zinc-700"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            הזמן
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="text-xs text-zinc-500 hidden sm:block">{userName}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700"
            title="התנתק"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
