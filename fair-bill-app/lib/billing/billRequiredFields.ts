import { BillData } from '@/lib/types'
import {
  getClientMobileFieldError,
  getDialCodeFieldError,
  normalizeDialCodeInput,
} from '@/lib/billing/indianMobile'

export type BillRequiredFieldKey =
  | 'billNo'
  | 'billDate'
  | 'clientName'
  | 'clientAddress'
  | 'clientMobileDialCode'
  | 'clientMobile'

export function validateBillRequiredFields(
  data: BillData
): Partial<Record<BillRequiredFieldKey, string>> {
  const errors: Partial<Record<BillRequiredFieldKey, string>> = {}

  if (!data.billNo.trim()) {
    errors.billNo = 'Bill number is required.'
  }

  if (!data.billDate?.trim()) {
    errors.billDate = 'Bill date is required.'
  } else {
    const d = new Date(data.billDate)
    if (Number.isNaN(d.getTime())) {
      errors.billDate = 'Enter a valid bill date.'
    }
  }

  if (!data.clientName.trim()) {
    errors.clientName = 'Client name is required.'
  }

  if (!data.clientAddress.trim()) {
    errors.clientAddress = 'Address is required.'
  }

  const mobile = data.clientMobile.trim()
  const dial = normalizeDialCodeInput(data.clientMobileDialCode)

  if (!mobile) {
    errors.clientMobile = 'Mobile number is required.'
  }

  if (mobile && !dial) {
    errors.clientMobileDialCode = 'Country code is required.'
  }

  if (mobile && dial) {
    const dialErr = getDialCodeFieldError(data.clientMobileDialCode, data.clientMobile)
    if (dialErr) errors.clientMobileDialCode = dialErr
    const mobErr = getClientMobileFieldError(data.clientMobile, data.clientMobileDialCode)
    if (mobErr) errors.clientMobile = mobErr
  }

  return errors
}

export function hasBillRequiredFieldErrors(
  errors: Partial<Record<BillRequiredFieldKey, string>>
): boolean {
  return Object.keys(errors).length > 0
}
