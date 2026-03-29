import { JetBrains_Mono } from 'next/font/google'

/** Single instance — use `.className` on invoice numeric spans so the font actually applies (CSS var alone was overridden by Geist). */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})
