/**
 * Centralized constants for billing flows.
 * Keeping these values in one place makes PDF/export
 * behavior easier to debug and tune.
 */
export const BILL_STORAGE_KEY = 'billOtherData'

/**
 * html2canvas currently fails to parse modern color functions
 * like lab()/oklch() in some environments.
 * We temporarily map known Tailwind color vars to hex fallbacks
 * during PDF capture.
 */
export const COLOR_FALLBACKS: Record<string, string> = {
  '--color-zinc-50': '#fafafa',
  '--color-zinc-100': '#f4f4f5',
  '--color-zinc-200': '#e4e4e7',
  '--color-zinc-300': '#d4d4d8',
  '--color-zinc-400': '#a1a1aa',
  '--color-zinc-500': '#71717a',
  '--color-zinc-600': '#52525b',
  '--color-zinc-700': '#3f3f46',
  '--color-zinc-800': '#27272a',
  '--color-zinc-900': '#18181b',
  '--color-red-50': '#fef2f2',
  '--color-red-100': '#fee2e2',
  '--color-red-200': '#fecaca',
  '--color-red-300': '#fca5a5',
  '--color-red-600': '#dc2626',
  '--color-red-700': '#b91c1c',
  '--color-blue-500': '#3b82f6',
}

