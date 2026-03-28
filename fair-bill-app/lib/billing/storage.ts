import { BillData } from '@/lib/types'
import { BILL_STORAGE_KEY } from '@/lib/billing/constants'

type PersistedBillFields = Pick<BillData, 'termsAndConditions'>

/**
 * Load only persisted, user-editable fields from localStorage.
 */
export const loadPersistedBillFields = (): Partial<PersistedBillFields> => {
  const raw = localStorage.getItem(BILL_STORAGE_KEY)
  if (!raw) return {}

  try {
    return JSON.parse(raw) as PersistedBillFields
  } catch {
    return {}
  }
}

/**
 * Persist frequently reused fields so users don't re-enter them for each bill.
 */
export const savePersistedBillFields = (data: BillData) => {
  const saveableData: PersistedBillFields = {
    termsAndConditions: data.termsAndConditions,
  }

  localStorage.setItem(BILL_STORAGE_KEY, JSON.stringify(saveableData))
}

