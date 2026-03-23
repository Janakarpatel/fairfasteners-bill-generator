'use client'
// components/BillGenerator.tsx

import React, { useState, useEffect, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { BillData, Calculations, fixedCompanyData, getInitialBillData } from '@/lib/types'
import { Input, Textarea, Section, Button } from '@/components/ui'
import { BillTemplate } from '@/components/BillTemplate'

export default function BillGenerator() {
  const [data, setData] = useState<BillData>(getInitialBillData)
  const [isExporting, setIsExporting] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('billOtherData')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setData((prev) => ({ ...prev, ...parsed, ...fixedCompanyData }))
      } catch {}
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    const saveableData = {
      bankName: data.bankName,
      bankBranch: data.bankBranch,
      bankAccountNo: data.bankAccountNo,
      bankIfscCode: data.bankIfscCode,
      termsAndConditions: data.termsAndConditions,
    }
    localStorage.setItem('billOtherData', JSON.stringify(saveableData))
  }, [data.bankName, data.bankBranch, data.bankAccountNo, data.bankIfscCode, data.termsAndConditions])

  const updateField = <K extends keyof BillData>(field: K, value: BillData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const updateLineItem = (id: string, field: string, value: string | number) => {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addLineItem = () => {
    setData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: Date.now().toString(), description: '', hsnCode: '', bags: 0, quantity: 1, rate: 0 },
      ],
    }))
  }

  const removeLineItem = (id: string) => {
    if (data.lineItems.length === 1) return
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }))
  }

  // Calculations
  const calculations: Calculations = useMemo(() => {
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
  }, [data.lineItems, data.freight, data.cgstRate, data.sgstRate, data.igstRate])

  // PDF Export
  const exportPDF = async () => {
    setIsExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).jsPDF

      const element = document.getElementById('invoice-preview')
      if (!element) return

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false })
      const imgData = canvas.toDataURL('image/jpeg', 1.0)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Invoice_${data.billNo || 'Draft'}.pdf`)
    } catch (error) {
      console.error('PDF Export failed', error)
    }
    setIsExporting(false)
  }

  // Excel Export
  const exportExcel = async () => {
    const XLSX = await import('xlsx')

    const wb = XLSX.utils.book_new()

    const summaryData = [
      ['Company Details', ''],
      ['Name', data.companyName],
      ['Address', data.companyAddress],
      ['GST No', data.companyGstNo],
      ['', ''],
      ['Invoice Metadata', ''],
      ['Bill No', data.billNo],
      ['Bill Date', data.billDate],
      ['', ''],
      ['Client Details', ''],
      ['Name', data.clientName],
      ['GST No', data.clientGstNo],
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    const itemsData = [
      ['SR', 'Description', 'HSN', 'Bags', 'Qty', 'Rate', 'Amount'],
      ...calculations.items.map((item, i) => [
        i + 1,
        item.description,
        item.hsnCode,
        item.bags,
        item.quantity,
        item.rate,
        item.amount,
      ]),
      ['', '', '', '', '', 'Sub Total', calculations.subTotal],
      ['', '', '', '', '', 'Freight', data.freight],
      ['', '', '', '', '', `CGST (${data.cgstRate}%)`, calculations.cgstAmount],
      ['', '', '', '', '', `SGST (${data.sgstRate}%)`, calculations.sgstAmount],
      ['', '', '', '', '', `IGST (${data.igstRate}%)`, calculations.igstAmount],
      ['', '', '', '', '', 'Grand Total', calculations.grandTotal],
    ]
    const wsItems = XLSX.utils.aoa_to_sheet(itemsData)
    XLSX.utils.book_append_sheet(wb, wsItems, 'Line Items')

    XLSX.writeFile(wb, `Invoice_${data.billNo || 'Draft'}.xlsx`)
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-medium text-sm tracking-tight">
            FF
          </div>
          <div>
            <h1 className="text-base font-medium tracking-tight text-zinc-50 leading-none">
              Bill Generator
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Create and export professional invoices</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => window.print()} icon="solar:printer-linear">
            Print
          </Button>
          <Button variant="secondary" onClick={exportExcel} icon="solar:document-text-linear">
            Export Excel
          </Button>
          <Button
            onClick={exportPDF}
            disabled={isExporting}
            icon={isExporting ? 'solar:hourglass-linear' : 'solar:file-download-linear'}
          >
            {isExporting ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* LEFT: FORM */}
        <div className="w-full md:w-[45%] lg:w-[40%] h-full overflow-y-auto border-r border-zinc-800 bg-zinc-900 p-6">
          <div className="max-w-xl mx-auto flex flex-col gap-4 pb-20">

            <Section title="Company Details" icon="solar:buildings-linear" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Company Name" value={data.companyName} disabled className="col-span-full" />
                <Textarea label="Address" value={data.companyAddress} disabled className="col-span-full" rows={2} />
                <Input label="Mobile 1" value={data.companyMobile1} disabled />
                <Input label="Mobile 2" value={data.companyMobile2} disabled />
                <Input label="Email" type="email" value={data.companyEmail} disabled />
                <Input label="Website" value={data.companyWebsite} disabled />
                <Input label="GST No." value={data.companyGstNo} disabled />
                <Input label="UDYAM No." value={data.companyUdyamNo} disabled />
              </div>
            </Section>

            <Section title="Invoice Metadata" icon="solar:bill-list-linear" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Bill No." value={data.billNo} onChange={(v) => updateField('billNo', v as string)} />
                <Input label="Bill Date" type="date" value={data.billDate} onChange={(v) => updateField('billDate', v as string)} />
                <Input label="Book No." value={data.bookNo} onChange={(v) => updateField('bookNo', v as string)} />
                <Input label="Challan No." value={data.chNo} onChange={(v) => updateField('chNo', v as string)} />
                <Input label="Challan Date" type="date" value={data.chDate} onChange={(v) => updateField('chDate', v as string)} />
                <Input label="PO No." value={data.poNo} onChange={(v) => updateField('poNo', v as string)} />
                <Input label="PO Date" type="date" value={data.poDate} onChange={(v) => updateField('poDate', v as string)} />
                <Input label="Transport" value={data.transport} onChange={(v) => updateField('transport', v as string)} className="col-span-full" />
                <Input label="LR No." value={data.lrNo} onChange={(v) => updateField('lrNo', v as string)} />
                <Input label="LR Date" type="date" value={data.lrDate} onChange={(v) => updateField('lrDate', v as string)} />
              </div>
            </Section>

            <Section title="Client Details" icon="solar:user-id-linear" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Client Name" value={data.clientName} onChange={(v) => updateField('clientName', v as string)} className="col-span-full" />
                <Textarea label="Billing Address" value={data.clientAddress} onChange={(v) => updateField('clientAddress', v)} className="col-span-full" rows={2} />
                <Input label="GST No." value={data.clientGstNo} onChange={(v) => updateField('clientGstNo', v as string)} />
                <Input label="Contact Person" value={data.clientContactName} onChange={(v) => updateField('clientContactName', v as string)} />
                <Input label="Mobile" value={data.clientMobile} onChange={(v) => updateField('clientMobile', v as string)} className="col-span-full" />
              </div>
            </Section>

            <Section title="Line Items" icon="solar:box-linear" defaultOpen={true}>
              <div className="flex flex-col gap-6">
                {data.lineItems.map((item) => (
                  <div key={item.id} className="relative p-4 border border-zinc-700 bg-zinc-800 rounded-lg group">
                    {data.lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full text-red-400 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900 hover:border-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12">
                        <Input
                          placeholder="Description of Goods"
                          value={item.description}
                          onChange={(v) => updateLineItem(item.id, 'description', v as string)}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input label="HSN" value={item.hsnCode} onChange={(v) => updateLineItem(item.id, 'hsnCode', v as string)} />
                      </div>
                      <div className="col-span-2">
                        <Input label="Bags" type="number" value={item.bags} onChange={(v) => updateLineItem(item.id, 'bags', v as number)} />
                      </div>
                      <div className="col-span-3">
                        <Input label="Qty" type="number" value={item.quantity} onChange={(v) => updateLineItem(item.id, 'quantity', v as number)} />
                      </div>
                      <div className="col-span-3">
                        <Input label="Rate" type="number" value={item.rate} onChange={(v) => updateLineItem(item.id, 'rate', v as number)} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" onClick={addLineItem} icon="solar:add-circle-linear" className="w-full border-dashed">
                  Add Line Item
                </Button>
              </div>
            </Section>

            <Section title="Totals & Taxes" icon="solar:calculator-linear" defaultOpen={true}>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Freight Charges (₹)" type="number" value={data.freight} onChange={(v) => updateField('freight', v as number)} />
                <Input label="CGST Rate (%)" type="number" value={data.cgstRate} onChange={(v) => updateField('cgstRate', v as number)} />
                <Input label="SGST Rate (%)" type="number" value={data.sgstRate} onChange={(v) => updateField('sgstRate', v as number)} />
                <Input label="IGST Rate (%)" type="number" value={data.igstRate} onChange={(v) => updateField('igstRate', v as number)} />
              </div>
            </Section>

            <Section title="Payment & Bank Details" icon="solar:card-linear">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Payment Terms" value={data.paymentTerms} onChange={(v) => updateField('paymentTerms', v as string)} className="col-span-full" />
                <Input label="Bank Name" value={data.bankName} onChange={(v) => updateField('bankName', v as string)} className="col-span-full" />
                <Input label="Branch" value={data.bankBranch} onChange={(v) => updateField('bankBranch', v as string)} />
                <Input label="Account No." value={data.bankAccountNo} onChange={(v) => updateField('bankAccountNo', v as string)} />
                <Input label="IFSC Code" value={data.bankIfscCode} onChange={(v) => updateField('bankIfscCode', v as string)} className="col-span-full" />
              </div>
            </Section>

            <Section title="Terms & Conditions" icon="solar:document-text-linear">
              <Textarea value={data.termsAndConditions} onChange={(v) => updateField('termsAndConditions', v)} rows={4} />
            </Section>

          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="w-full md:w-[55%] lg:w-[60%] h-full overflow-y-auto bg-zinc-950 p-4 md:p-8 flex justify-center">
          <BillTemplate data={data} calculations={calculations} />
        </div>
      </main>
    </div>
  )
}
