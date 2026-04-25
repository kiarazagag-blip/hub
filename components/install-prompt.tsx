"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share, PlusSquare, X, Smartphone, Download, ChevronRight } from "lucide-react"

export function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // 0. Register Service Worker for Android Installability
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(err => console.log("SW failed", err))
    }

    // 1. Detect Platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isAndroid = /Android/.test(navigator.userAgent)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches

    if (isStandalone) return // Already installed

    // 2. Check if dismissed recently
    const dismissed = localStorage.getItem("install-prompt-dismissed")
    const oneDay = 24 * 60 * 60 * 1000
    if (dismissed && Date.now() - parseInt(dismissed) < oneDay) return

    setPlatform(isIOS ? "ios" : isAndroid ? "android" : "other")

    // 3. Handle Android Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // 4. Show Prompt after a short delay
    if (isIOS || isAndroid) {
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem("install-prompt-dismissed", Date.now().toString())
  }

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      handleDismiss()
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center pointer-events-none">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-brand-black/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Prompt Card */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 left-4 p-2 rounded-full bg-brand-gray text-brand-black/40 hover:text-brand-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 flex flex-col items-center text-center">
              {/* Logo */}
              <div className="w-20 h-20 mb-6 flex items-center justify-center">
                <img src="/logo-app.png" alt="HUBbooking" className="w-full h-full object-contain" />
              </div>

              <h2 className="text-2xl font-bold text-brand-black mb-2">התקן את HUBbooking</h2>
              <p className="text-brand-black/50 text-sm leading-relaxed mb-8">
                התקן את האפליקציה על מסך הבית שלך לגישה מהירה ונוחה יותר להזמנת חדרים.
              </p>

              {platform === "ios" ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-4 bg-brand-gray/50 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      <Share className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-black">שלב 1</p>
                      <p className="text-sm text-brand-black/60">לחץ על כפתור ה-Share בדפדפן</p>
                    </div>
                    <ChevronRight className="w-4 h-4 mr-auto text-brand-black/20" />
                  </div>

                  <div className="flex items-center gap-4 bg-brand-gray/50 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      <PlusSquare className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-black">שלב 2</p>
                      <p className="text-sm text-brand-black/60">גלול מטה ובחר ב-&quot;Add to Home Screen&quot;</p>
                    </div>
                    <ChevronRight className="w-4 h-4 mr-auto text-brand-black/20" />
                  </div>
                </div>
              ) : deferredPrompt ? (
                <button
                  onClick={handleAndroidInstall}
                  className="w-full bg-brand-black text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-black/90 active:scale-[0.98] transition-all"
                >
                  <Download className="w-5 h-5" />
                  התקן עכשיו
                </button>
              ) : (
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-4 bg-brand-gray/50 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      <Smartphone className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-black">שלב 1</p>
                      <p className="text-sm text-brand-black/60">לחץ על שלוש הנקודות (תפריט) בדפדפן</p>
                    </div>
                    <ChevronRight className="w-4 h-4 mr-auto text-brand-black/20" />
                  </div>

                  <div className="flex items-center gap-4 bg-brand-gray/50 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      <PlusSquare className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-black">שלב 2</p>
                      <p className="text-sm text-brand-black/60">בחר ב-&quot;התקן אפליקציה&quot;</p>
                    </div>
                    <ChevronRight className="w-4 h-4 mr-auto text-brand-black/20" />
                  </div>
                </div>
              )}

              <p className="mt-8 text-[10px] uppercase tracking-widest text-brand-black/20 font-bold">
                Experience HUBbooking as a Native App
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
