import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Analytics } from "@vercel/analytics/next"

const polin = localFont({
  src: [
    { path: "./fonts/Polin-Thin.otf", weight: "100", style: "normal" },
    { path: "./fonts/Polin-Extralight.otf", weight: "200", style: "normal" },
    { path: "./fonts/Polin-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/Polin-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Polin-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Polin-Semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/Polin-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/Polin-Extrabold.otf", weight: "800", style: "normal" },
    { path: "./fonts/Polin-Black.otf", weight: "900", style: "normal" },
  ],
})

export const metadata: Metadata = {
  title: "HUBbooking",
  description: "מערכת הזמנת חדר ישיבות מודרנית",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HUBbooking",
  },
  icons: {
    icon: "/logo-app.png",
    apple: "/logo-app.png",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  themeColor: "#202020",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { InstallPrompt } from "@/components/install-prompt"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${polin.className} overscroll-none`}>
        <Providers>
          {children}
          <InstallPrompt />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
