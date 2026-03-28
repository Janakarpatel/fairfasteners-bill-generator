/**
 * Common B2B / trade payment terms (wording aligned with typical invoices & accounting practice).
 */
export const PAYMENT_TERMS_PRESETS = [
  // 'Due on Receipt',
  // 'Net 7',
  // 'Net 15',
  // 'Net 30',
  // 'Net 45',
  // 'Net 60',
  // 'Net 90',
  'Against Delivery (30 Days)',
  'Against Delivery (45 Days)',
  'Against Delivery (60 Days)',
  'Cash',
  'Cash on Delivery (COD)',
  'Advance Payment',
  '50% Advance — Balance on Delivery',
  'Payable by Cheque',
  'Payable by Bank Transfer (NEFT/RTGS)',
  'Letter of Credit (L/C)',
] as const

export const PAYMENT_TERMS_CUSTOM_VALUE = '__custom__'

const PRESET_SET = new Set<string>(PAYMENT_TERMS_PRESETS)

export function isPresetPaymentTerm(value: string): boolean {
  return PRESET_SET.has(value.trim())
}

export function paymentTermsSelectValue(stored: string): string {
  const v = stored.trim()
  if (!v) return PAYMENT_TERMS_CUSTOM_VALUE
  return isPresetPaymentTerm(v) ? v : PAYMENT_TERMS_CUSTOM_VALUE
}
