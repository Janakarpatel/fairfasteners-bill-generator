'use client'
// components/BillGenerator.tsx

import React, { useState, useEffect, useMemo } from 'react'
import { CalendarDays, ChevronDown, GripVertical, Printer, Trash2, User } from 'lucide-react'
import { BillData, Calculations, fixedCompanyData, getInitialBillData } from '@/lib/types'
import { calculateBillTotals } from '@/lib/billing/calculations'
import { exportBillAsExcel, exportBillAsPdf } from '@/lib/billing/exports'
import { loadPersistedBillFields, savePersistedBillFields } from '@/lib/billing/storage'
import { Input, Textarea, Section, Button } from '@/components/ui'
import { BillTemplate } from '@/components/BillTemplate'
import { Calendar } from '@/components/ui/calendar'
import { Button as ShadButton } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function BillGenerator() {
  const [data, setData] = useState<BillData>(getInitialBillData)
  const [isExporting, setIsExporting] = useState(false)
  const [draggedLineItemId, setDraggedLineItemId] = useState<string | null>(null)
  const [dragOverLineItemId, setDragOverLineItemId] = useState<string | null>(null)
  const [openDateField, setOpenDateField] = useState<keyof BillData | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-date-field-container="true"]')) return
      setOpenDateField(null)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDateField(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const parseDate = (value: string) => {
    if (!value) return undefined
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  }

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const renderDateField = (label: string, field: keyof BillData, className?: string) => {
    const value = data[field] as string
    return (
      <div className={`relative flex flex-col gap-2 ${className ?? ''}`} data-date-field-container="true">
        <label className="text-sm font-medium leading-none text-zinc-900">{label}</label>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--brand-border)] bg-white px-3 text-sm text-zinc-900"
          onClick={() => setOpenDateField((prev) => (prev === field ? null : field))}
        >
          <span>{value || 'Select date'}</span>
          <CalendarDays className="h-4 w-4 text-zinc-500" />
        </button>
        {openDateField === field && (
          <div className="absolute z-50 mt-2 rounded-md border border-[var(--brand-border)] bg-white shadow-sm">
            <Calendar
              mode="single"
              selected={parseDate(value)}
              className="rounded-lg border border-[var(--brand-border)]"
              onSelect={(selectedDate) => {
                if (!selectedDate) return
                updateField(field, formatDateForInput(selectedDate) as BillData[keyof BillData])
                setOpenDateField(null)
              }}
            />
          </div>
        )}
      </div>
    )
  }

  // Load from localStorage
  useEffect(() => {
    const persisted = loadPersistedBillFields()
    setData((prev) => ({ ...prev, ...persisted, ...fixedCompanyData }))
  }, [])

  // Save to localStorage
  useEffect(() => {
    savePersistedBillFields(data)
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

  const reorderLineItems = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return

    setData((prev) => {
      const sourceIndex = prev.lineItems.findIndex((item) => item.id === sourceId)
      const targetIndex = prev.lineItems.findIndex((item) => item.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return prev

      const reordered = [...prev.lineItems]
      const [moved] = reordered.splice(sourceIndex, 1)
      reordered.splice(targetIndex, 0, moved)

      return { ...prev, lineItems: reordered }
    })
  }

  // Calculations
  const calculations: Calculations = useMemo(() => {
    return calculateBillTotals(data)
  }, [data.lineItems, data.freight, data.cgstRate, data.sgstRate, data.igstRate])

  // PDF Export
  const exportPDF = async () => {
    setIsExporting(true)
    try {
      await exportBillAsPdf(data)
    } catch (error) {
      console.error('PDF Export failed', error)
    }
    setIsExporting(false)
  }

  // Excel Export
  const exportExcel = async () => {
    await exportBillAsExcel(data, calculations)
  }

  return (
    <div className="h-screen bg-white">
      <main className="h-full border border-[var(--brand-border)] bg-white flex flex-col">
        {/* TOP NAVBAR */}
        <header className="h-14 border-b border-[var(--brand-border)] bg-white px-6 py-8 flex items-center justify-between">
          <div className="h-9 flex gap-3 items-center justify-center">
            <img
              src="/company_logo.svg"
              alt="Fair Fasteners logo"
              className="h-7 w-auto object-contain"
            />
            <span className="h-7 w-px border-l border-[var(--brand-border)]" />
            <img
              src="/invoice_logo.svg"
              alt="Invoice logo"
              className="h-7 w-auto object-contain"
            />
            {/* <h1 className="text-xl font-semibold">Invoice</h1> */}
          </div>
          <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 border border-[var(--brand-border)]">
            <User className="h-4 w-4" />
          </div>
        </header>

        <div className="flex-1 min-h-0 flex">
          {/* LEFT: FORM */}
          <div className="w-[45%] h-full overflow-y-auto border-r border-[var(--brand-border)] bg-white p-5 md:p-6">
          <div className="w-full flex flex-col gap-3">
            <div className="mb-1">
              <h1 className="text-2xl font-semibold">Create New Invoice</h1>
              <p className="text-sm text-zinc-500">Fill in invoice details</p>
            </div>

            <Section title="Invoice Metadata" icon="solar:bill-list-linear">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Bill No." value={data.billNo} onChange={(v) => updateField('billNo', v as string)} />
                {renderDateField('Bill Date', 'billDate')}
                <Input label="Book No." value={data.bookNo} onChange={(v) => updateField('bookNo', v as string)} />
                <Input label="Challan No." value={data.chNo} onChange={(v) => updateField('chNo', v as string)} />
                {renderDateField('Challan Date', 'chDate')}
                <Input label="PO No." value={data.poNo} onChange={(v) => updateField('poNo', v as string)} />
                {renderDateField('PO Date', 'poDate')}
                <Input label="Transport" value={data.transport} onChange={(v) => updateField('transport', v as string)} className="col-span-full" />
                <Input label="LR No." value={data.lrNo} onChange={(v) => updateField('lrNo', v as string)} />
                {renderDateField('LR Date', 'lrDate')}
              </div>
            </Section>

            <Section title="Client Details" icon="solar:user-id-linear">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Client Name" value={data.clientName} onChange={(v) => updateField('clientName', v as string)} className="col-span-full" />
                <Textarea
                  label="Billing Address"
                  value={data.clientAddress}
                  onChange={(v) => updateField('clientAddress', v)}
                  className="col-span-full resize-none overflow-y-auto"
                  rows={2}
                />
                <Input label="GST No." value={data.clientGstNo} onChange={(v) => updateField('clientGstNo', v as string)} />
                <Input label="Contact Person" value={data.clientContactName} onChange={(v) => updateField('clientContactName', v as string)} />
                <Input label="Mobile" value={data.clientMobile} onChange={(v) => updateField('clientMobile', v as string)} className="col-span-full" />
              </div>
            </Section>

            <Section title="Line Items" icon="solar:box-linear">
              <div className="flex flex-col gap-6">
                {data.lineItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedLineItemId(item.id)
                      e.dataTransfer.effectAllowed = 'move'
                      // Show full card ghost image instead of just the drag handle.
                      e.dataTransfer.setDragImage(e.currentTarget, 20, 20)
                    }}
                    onDragEnd={() => {
                      setDraggedLineItemId(null)
                      setDragOverLineItemId(null)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      setDragOverLineItemId(item.id)
                    }}
                    onDragLeave={() => setDragOverLineItemId((prev) => (prev === item.id ? null : prev))}
                    onDrop={() => {
                      if (draggedLineItemId) {
                        reorderLineItems(draggedLineItemId, item.id)
                      }
                      setDragOverLineItemId(null)
                      setDraggedLineItemId(null)
                    }}
                    data-dragging={draggedLineItemId === item.id}
                    data-dragover={dragOverLineItemId === item.id}
                    className={`relative p-4 border bg-white rounded-lg group transition-all duration-200 cursor-grab ${
                      draggedLineItemId === item.id ? 'opacity-60 scale-[0.99]' : 'opacity-100'
                    } ${dragOverLineItemId === item.id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-[var(--brand-border)]'}`}
                  >
                    <button
                      type="button"
                      className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 bg-white rounded-md text-zinc-500 flex items-center justify-center hover:bg-zinc-100 transition-colors pointer-events-none"
                      aria-label="Drag to reorder item"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    {data.lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white border border-[var(--brand-border)] rounded-full text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-12 gap-3 pl-10">
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
                <Button variant="secondary" onClick={addLineItem} icon="solar:add-circle-linear" className="w-full bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]">
                  Add Line Item
                </Button>
              </div>
            </Section>

            <Section title="Totals & Taxes" icon="solar:calculator-linear">
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

          </div>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="w-[55%] h-full overflow-y-auto bg-[var(--brand-primary-soft)]">
            <div className="sticky top-0 z-10 border-b border-[var(--brand-border)] bg-white px-4 md:px-6 py-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Preview</h2>
              <div className="flex items-center gap-2">
                <ShadButton
                  variant="outline"
                  size="default"
                  onClick={() => window.print()}
                className="h-9 border-[var(--brand-border)] bg-white px-4 text-zinc-700 hover:bg-zinc-50"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </ShadButton>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <ShadButton
                    variant="default"
                    size="sm"
                    disabled={isExporting}
                    className="h-9 px-0 overflow-hidden bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white border border-[var(--brand-border)]"
                  >
                    <span className="px-4">{isExporting ? 'Generating...' : 'Download'}</span>
                    <span className="h-full w-px bg-white/35" />
                    <span className="w-10 h-full flex items-center justify-center">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </ShadButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportExcel}>.xlsx</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportPDF}>.pdf</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
            <div className="p-4 md:p-8 flex justify-center bg-[var(--brand-primary-soft)]">
              <BillTemplate data={data} calculations={calculations} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
