// lib/types.ts

import staticText from '@/lib/static-text.json'

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
  cgstRate: staticText.defaults.cgstRate ?? 0,
  sgstRate: staticText.defaults.sgstRate ?? 0,
  igstRate: staticText.defaults.igstRate ?? 0,
  paymentTerms: staticText.defaults.paymentTerms,
  bankName: '',
  bankBranch: '',
  bankAccountNo: '',
  bankIfscCode: '',
  termsAndConditions: staticText.defaults.termsAndConditions,
})
