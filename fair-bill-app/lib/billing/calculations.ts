import { BillData, Calculations } from '@/lib/types'

/**
 * Compute all derived invoice amounts from raw line items and tax rates.
 */
export const calculateBillTotals = (data: BillData): Calculations => {
  const itemsWithAmount = data.lineItems.map((item) => ({
    ...item,
    amount: item.quantity * item.rate,
  }))

  const subTotal = itemsWithAmount.reduce((sum, item) => sum + item.amount, 0)
  const cgstAmount = (subTotal * data.cgstRate) / 100
  const sgstAmount = (subTotal * data.sgstRate) / 100
  const igstAmount = (subTotal * data.igstRate) / 100
  const grandTotal = subTotal + data.freight + cgstAmount + sgstAmount + igstAmount

  return { items: itemsWithAmount, subTotal, cgstAmount, sgstAmount, igstAmount, grandTotal }
}

