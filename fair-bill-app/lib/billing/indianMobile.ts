/** Client mobile: optional country dial code + national number. India (+91): 10 digits, first 6–9. */

export const INDIAN_MOBILE_LENGTH = 10

export const INDIA_DIAL_CODE = '91'

const DIGITS_ONLY = /^\d*$/

const INDIAN_MOBILE_FULL = /^[6-9]\d{9}$/

/** ITU-style dial digits only, max length 4 (covers valid country calling codes). */
export function normalizeDialCodeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 4)
}

const INTL_MOBILE_MAX = 15

/** National number digits; length cap depends on selected country code (India = 10). */
export function normalizeNationalMobileInput(raw: string, dialCode: string): string {
  const digits = raw.replace(/\D/g, '')
  if (normalizeDialCodeInput(dialCode) === INDIA_DIAL_CODE) {
    return digits.slice(0, INDIAN_MOBILE_LENGTH)
  }
  return digits.slice(0, INTL_MOBILE_MAX)
}

export function getDialCodeFieldError(dialCode: string, mobile?: string): string | null {
  const d = normalizeDialCodeInput(dialCode)
  const hasMobile = mobile !== undefined && mobile.trim() !== ''
  if (!d) {
    if (hasMobile) return 'Select or enter a country code.'
    return null
  }
  if (!/^\d{1,4}$/.test(d)) return 'Enter a valid country code (digits only).'
  if (/^0+$/.test(d)) return 'Country code cannot be all zeros.'
  return null
}

function getIndianMobileFieldError(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  if (!DIGITS_ONLY.test(v)) {
    return 'Use digits only (no spaces or symbols).'
  }
  if (v.length !== INDIAN_MOBILE_LENGTH) {
    return `Mobile number must be exactly ${INDIAN_MOBILE_LENGTH} digits.`
  }
  if (!INDIAN_MOBILE_FULL.test(v)) {
    return 'Indian mobile numbers start with 6, 7, 8, or 9.'
  }
  return null
}

/** National number for non-India: 4–15 digits, first digit 1–9. */
const INTL_NATIONAL_RE = /^[1-9]\d{3,14}$/

function getInternationalMobileFieldError(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  if (!DIGITS_ONLY.test(v)) {
    return 'Use digits only (no spaces or symbols).'
  }
  if (!INTL_NATIONAL_RE.test(v)) {
    return 'Enter a valid mobile number (4–15 digits).'
  }
  return null
}

export function getClientMobileFieldError(mobile: string, dialCode: string): string | null {
  const m = mobile.trim()
  if (!m) return null
  const d = normalizeDialCodeInput(dialCode)
  if (!d) return null
  if (d === INDIA_DIAL_CODE) {
    return getIndianMobileFieldError(m)
  }
  return getInternationalMobileFieldError(m)
}

export function formatClientContactForDisplay(dialCode: string, mobile: string): string {
  const m = mobile.trim()
  if (!m) return ''
  const d = normalizeDialCodeInput(dialCode)
  if (!d) return m
  return `+${d} ${m}`
}
