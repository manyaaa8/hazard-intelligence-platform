import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "SentinelRoad — Crowdsourced Road Hazard Console",
  description:
    "Operations console for evidence-scored road hazards detected across a public bus fleet in Bengaluru. Verify detections, inspect corroborating passes, and review network coverage.",
}

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
