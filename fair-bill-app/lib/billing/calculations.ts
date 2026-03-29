import { BillData, Calculations } from '@/lib/types'
import { isIgstInterstateRule } from '@/lib/billing/taxRules'

/**
 * Compute all derived invoice amounts from raw line items and tax rates.
 * IGST 18% or 0.1%: only IGST applies (CGST/SGST amounts zero).
 * Otherwise: CGST + SGST from rates; IGST line amount stays zero.
 */
export const calculateBillTotals = (data: BillData): Calculations => {
  const itemsWithAmount = data.lineItems.map((item) => ({
    ...item,
    amount: item.quantity * item.rate,
  }))

  const subTotal = itemsWithAmount.reduce((sum, item) => sum + item.amount, 0)
  /** GST is applied on line subtotal plus freight (taxable value). */
  const gstBase = subTotal + data.freight

  let cgstAmount: number
  let sgstAmount: number
  let igstAmount: number

  if (isIgstInterstateRule(data.igstRate)) {
    cgstAmount = 0
    sgstAmount = 0
    igstAmount = (gstBase * data.igstRate) / 100
  } else {
    cgstAmount = (gstBase * data.cgstRate) / 100
    sgstAmount = (gstBase * data.sgstRate) / 100
    igstAmount = 0
  }

  const totalBeforeRoundOff = Number(
    (subTotal + data.freight + cgstAmount + sgstAmount + igstAmount).toFixed(2)
  )
  const grandTotal = Math.round(totalBeforeRoundOff)
  const roundOff = Number((grandTotal - totalBeforeRoundOff).toFixed(2))

  return {
    items: itemsWithAmount,
    subTotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalBeforeRoundOff,
    roundOff,
    grandTotal,
  }
}

