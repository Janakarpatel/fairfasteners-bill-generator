import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Bill Generator - Fair Fasteners',
  description: 'Create and export professional invoices',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${inter.className} min-h-screen text-sm bg-white text-zinc-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
