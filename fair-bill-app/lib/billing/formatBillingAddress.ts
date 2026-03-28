import type { BillData } from '@/lib/types'

type BillingAddressFields = Pick<
  BillData,
  'clientAddress' | 'clientCity' | 'clientState' | 'clientPincode'
>

/**
 * Builds display lines: street block, then "City, State - PIN" (omit empty parts).
 */
export function formatBillingAddress(data: BillingAddressFields): string {
  const street = data.clientAddress.trim()
  const city = data.clientCity.trim()
  const state = data.clientState.trim()
  const pin = data.clientPincode.trim()

  const cityState = [city, state].filter(Boolean).join(', ')
  const secondLine =
    cityState && pin ? `${cityState} - ${pin}` : cityState || pin

  return [street, secondLine].filter(Boolean).join('\n')
}

/** Pincode / postal code: allow alphanumeric (some countries); trim length cap. */
export function normalizePincodeInput(raw: string, maxLen = 12): string {
  return raw.replace(/[\s-]/g, '').slice(0, maxLen)
}
