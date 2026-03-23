// lib/types.ts

export interface LineItem {
  id: string
  description: string
  hsnCode: string
  bags: number
  quantity: number
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
  clientAddress: string
  clientGstNo: string
  clientMobile: string
  clientContactName: string
  lineItems: LineItem[]
  freight: number
  cgstRate: number
  sgstRate: number
  igstRate: number
  paymentTerms: string
  bankName: string
  bankBranch: string
  bankAccountNo: string
  bankIfscCode: string
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
  companyName: 'Fair Fasteners',
  companyAddress: 'Plot No. 42, Industrial Estate, Phase II\nNew Delhi, 110020, India',
  companyMobile1: '+91 98765 43210',
  companyMobile2: '+91 11 2345 6789',
  companyEmail: 'info@fairfasteners.com',
  companyWebsite: 'www.fairfasteners.com',
  companyGstNo: '07AAACF2345Q1Z8',
  companyUdyamNo: 'UDYAM-DL-01-1234567',
}

export const getInitialBillData = (): BillData => ({
  ...fixedCompanyData,
  bookNo: '',
  billNo: 'INV-001',
  billDate: new Date().toISOString().split('T')[0],
  chNo: '',
  chDate: '',
  poNo: '',
  poDate: '',
  transport: '',
  lrNo: '',
  lrDate: '',
  clientName: '',
  clientAddress: '',
  clientGstNo: '',
  clientMobile: '',
  clientContactName: '',
  lineItems: [
    { id: Date.now().toString(), description: '', hsnCode: '', bags: 0, quantity: 1, rate: 0 },
  ],
  freight: 0,
  cgstRate: 0,
  sgstRate: 0,
  igstRate: 0,
  paymentTerms: 'Due on Receipt',
  bankName: '',
  bankBranch: '',
  bankAccountNo: '',
  bankIfscCode: '',
  termsAndConditions:
    '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is delayed.',
})
