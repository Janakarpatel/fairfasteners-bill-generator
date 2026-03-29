import { BillData, LineItem } from '@/lib/types'
import { GOODS_CUSTOM_ID, getSizesForGoodsProduct } from '@/lib/catalog/goodsCatalog'
import { validateBillRequiredFields } from '@/lib/billing/billRequiredFields'
import { getGstinFieldError } from '@/lib/billing/gstin'

export const INVOICE_FORM_TAB_ORDER = [
  'invoice',
  'client',
  'line-items',
  'totals',
  'payment',
  'notes',
] as const

export type InvoiceFormTabId = (typeof INVOICE_FORM_TAB_ORDER)[number]

export function isInvoiceTabId(value: string): value is InvoiceFormTabId {
  return (INVOICE_FORM_TAB_ORDER as readonly string[]).includes(value)
}

function isInvoiceHeaderComplete(data: BillData): boolean {
  if (!data.billNo.trim()) return false
  if (!data.billDate?.trim()) return false
  const d = new Date(data.billDate)
  return !Number.isNaN(d.getTime())
}

function isClientSectionComplete(data: BillData): boolean {
  const err = validateBillRequiredFields(data)
  if (err.clientName || err.clientAddress || err.clientMobile || err.clientMobileDialCode) {
    return false
  }
  if (data.clientGstNo.trim() && getGstinFieldError(data.clientGstNo)) {
    return false
  }
  return true
}

function isLineItemRowComplete(item: LineItem): boolean {
  if (!item.goodsProductId) return false
  if (item.goodsProductId === GOODS_CUSTOM_ID) {
    if (!item.description.trim()) return false
  } else {
    const sizes = getSizesForGoodsProduct(item.goodsProductId)
    if (sizes.length > 0 && !item.goodsSize.trim()) return false
  }
  if (!item.hsnCode.trim()) return false
  if (!Number.isFinite(item.quantity) || item.quantity <= 0) return false
  if (!Number.isFinite(item.rate) || item.rate <= 0) return false
  if (!Number.isFinite(item.bags) || item.bags < 1) return false
  return true
}

function isLineItemsSectionComplete(data: BillData): boolean {
  if (data.lineItems.length === 0) return false
  return data.lineItems.every(isLineItemRowComplete)
}

function isTotalsSectionComplete(data: BillData): boolean {
  const { freight, cgstRate, sgstRate, igstRate } = data
  if (!Number.isFinite(freight) || freight < 0) return false
  if (!Number.isFinite(cgstRate) || cgstRate < 0) return false
  if (!Number.isFinite(sgstRate) || sgstRate < 0) return false
  if (!Number.isFinite(igstRate) || igstRate < 0) return false
  return true
}

function isPaymentSectionComplete(data: BillData): boolean {
  return data.paymentTerms.trim().length > 0
}

/** Notes are optional; section counts as complete for wizard flow. */
function isNotesSectionComplete(): boolean {
  return true
}

export function isInvoiceSectionComplete(data: BillData, tab: InvoiceFormTabId): boolean {
  switch (tab) {
    case 'invoice':
      return isInvoiceHeaderComplete(data)
    case 'client':
      return isClientSectionComplete(data)
    case 'line-items':
      return isLineItemsSectionComplete(data)
    case 'totals':
      return isTotalsSectionComplete(data)
    case 'payment':
      return isPaymentSectionComplete(data)
    case 'notes':
      return isNotesSectionComplete()
    default:
      return false
  }
}

export function getInvoiceSectionCompletionMap(
  data: BillData
): Record<InvoiceFormTabId, boolean> {
  return {
    invoice: isInvoiceSectionComplete(data, 'invoice'),
    client: isInvoiceSectionComplete(data, 'client'),
    'line-items': isInvoiceSectionComplete(data, 'line-items'),
    totals: isInvoiceSectionComplete(data, 'totals'),
    payment: isInvoiceSectionComplete(data, 'payment'),
    notes: isInvoiceSectionComplete(data, 'notes'),
  }
}

export function getNextInvoiceTabId(current: InvoiceFormTabId): InvoiceFormTabId | null {
  const i = INVOICE_FORM_TAB_ORDER.indexOf(current)
  if (i < 0 || i >= INVOICE_FORM_TAB_ORDER.length - 1) return null
  return INVOICE_FORM_TAB_ORDER[i + 1]
}

export function getPreviousInvoiceTabId(current: InvoiceFormTabId): InvoiceFormTabId | null {
  const i = INVOICE_FORM_TAB_ORDER.indexOf(current)
  if (i <= 0) return null
  return INVOICE_FORM_TAB_ORDER[i - 1]
}
