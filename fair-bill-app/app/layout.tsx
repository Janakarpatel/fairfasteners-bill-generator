import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import LenisScroll from '@/components/LenisScroll'
import staticText from '@/lib/static-text.json'
import { jetbrainsMono } from '@/lib/fonts'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Invoice - Fair Fasteners',
  description: 'Create and export professional invoices',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geist.className} ${jetbrainsMono.variable} min-h-screen text-sm tracking-tight bg-white text-zinc-900 antialiased`}
      >
        <LenisScroll />
        {children}
        <div className="bg-[var(--brand-primary)] px-4 py-4 h-full">
          <footer className="bg-white text-zinc-900 flex items-center justify-between rounded-sm border border-[var(--brand-border)] shadow-sm overflow-hidden py-3 px-4">
            <div className="flex items-center gap-3">
              <img
                src="/company_logo.svg"
                alt="Fair Fasteners logo"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <span>Version {staticText.app.version}</span>
              <span>© {new Date().getFullYear()} Fair Fasteners. All rights reserved.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
