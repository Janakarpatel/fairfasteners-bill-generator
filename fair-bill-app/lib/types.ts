// lib/types.ts

import staticText from '@/lib/static-text.json'

/** Quantity UOM on line items (matches invoice labels). */
export type QuantityUnit = 'KG' | 'PC'

export const getDefaultQuantityUnit = (): QuantityUnit =>
  staticText.defaults.defaultQuantityUnit === 'PC' ? 'PC' : 'KG'

export interface LineItem {
  id: string
  /** Catalog product id, empty if not chosen, `__custom__` for free-text description. */
  goodsProductId: string
  /** Selected size from catalog for this product. */
  goodsSize: string
  description: string
  hsnCode: string
  bags: number
  quantity: number
  /** Sold by weight or count. */
  quantityUnit: QuantityUnit
  /** Rate per unit (₹); line amount = qty × rate. */
  rate: number
}

export interface LineItemWithAmount extends LineItem {
  amount: number
}

export interface BillData {
  companyName: string
  companyAddress: string
  companyMobile1: string
  companyMobile2: string
  companyEmail: string
  companyWebsite: string
  companyGstNo: string
  companyUdyamNo: string
  bookNo: string
  billNo: string
  billDate: string
  chNo: string
  chDate: string
  poNo: string
  poDate: string
  transport: string
  lrNo: string
  lrDate: string
  clientName: string
  /** Street, building, area (first block of billing address). */
  clientAddress: string
  clientCity: string
  clientState: string
  clientPincode: string
  clientGstNo: string
  /** Country calling code digits only, e.g. "91" for India (no +). */
  clientMobileDialCode: string
  clientMobile: string
  clientContactName: string
  lineItems: LineItem[]
  freight: number
  cgstRate: number
  sgstRate: number
  igstRate: number
  paymentTerms: string
  /** Optional free-text remarks shown on the invoice (e.g. delivery notes). */
  notes: string
  termsAndConditions: string
}

export interface Calculations {
  items: LineItemWithAmount[]
  subTotal: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  grandTotal: number
}

export const fixedCompanyData = {
  companyName: staticText.company.name,
  companyAddress: staticText.company.address,
  companyMobile1: staticText.company.mobile1,
  companyMobile2: staticText.company.mobile2,
  companyEmail: staticText.company.email,
  companyWebsite: staticText.company.website,
  companyGstNo: staticText.company.gstNo,
  companyUdyamNo: staticText.company.udyamNo,
}

export const getInitialBillData = (): BillData => ({
  ...fixedCompanyData,
  bookNo: '',
  billNo: staticText.defaults.initialBillNo,
  billDate: new Date().toISOString().split('T')[0],
  chNo:
    staticText.defaults.initialChallanNo ?? staticText.defaults.initialBillNo,
  chDate: '',
  poNo: staticText.defaults.defaultPoNo ?? '',
  poDate: '',
  transport: '',
  lrNo: '',
  lrDate: '',
  clientName: '',
  clientAddress: '',
  clientCity: '',
  clientState: '',
  clientPincode: '',
  clientGstNo: '',
  clientMobileDialCode:
    staticText.defaults.defaultClientMobileDialCode ?? '91',
  clientMobile: '',
  clientContactName: '',
  lineItems: [
    {
      id: Date.now().toString(),
      goodsProductId: '',
      goodsSize: '',
      description: '',
      hsnCode: '',
      bags: 0,
      quantity: 1,
      quantityUnit: getDefaultQuantityUnit(),
      rate: 0,
    },
  ],
  freight: 0,
  cgstRate: staticText.defaults.cgstRate ?? 0,
  sgstRate: staticText.defaults.sgstRate ?? 0,
  igstRate: staticText.defaults.igstRate ?? 0,
  paymentTerms: staticText.defaults.paymentTerms,
  notes: '',
  termsAndConditions: staticText.defaults.termsAndConditions,
})
