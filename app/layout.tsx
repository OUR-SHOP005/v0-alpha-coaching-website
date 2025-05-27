import { Footer } from "@/components/footer"
import Navigation from "@/components/navigation"
import { SupabaseProvider } from "@/components/supabase-provider"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ALPHA JEE Coaching - Your Gateway to IIT Success",
  description: "Premier JEE coaching institute with expert faculty and proven results",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <SupabaseProvider>
              <Navigation />
              <main className="flex-grow">{children}</main>
              <Footer />
            </SupabaseProvider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
