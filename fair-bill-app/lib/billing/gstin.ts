/** Client GSTIN field: exactly 15 chars, uppercase A–Z and digits 0–9 only. */

export const GSTIN_LENGTH = 15

const GSTIN_CHAR_RE = /^[0-9A-Z]*$/

export function normalizeGstinInput(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .slice(0, GSTIN_LENGTH)
}

export function isValidGstin(value: string): boolean {
  const v = value.trim()
  if (!v) return true
  return v.length === GSTIN_LENGTH && GSTIN_CHAR_RE.test(v)
}

export function getGstinFieldError(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  if (!GSTIN_CHAR_RE.test(v)) {
    return 'Only uppercase letters (A–Z) and digits (0–9); no spaces or symbols.'
  }
  if (v.length !== GSTIN_LENGTH) {
    return `GSTIN must be exactly ${GSTIN_LENGTH} characters.`
  }
  return null
}
