import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Invoice - Fair Fasteners',
  description: 'Create and export professional invoices',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${geist.className} min-h-screen text-sm tracking-tight bg-white text-zinc-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
