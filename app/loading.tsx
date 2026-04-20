import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce border border-zinc-100">
        <Loader2 className="w-5 h-5 text-zinc-900 animate-spin" />
      </div>
    </div>
  )
}
