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
  const [showPreview, setShowPreview] = useState(true)

  const handleReset = () => {
    setIsExporting(false)
    setDraggedLineItemId(null)
    setDragOverLineItemId(null)
    setOpenDateField(null)
    setData(getInitialBillData())
  }

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
        <label className="text-sm font-medium leading-none text-[var(--input-field-color)]">{label}</label>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-start gap-3 rounded-md border border-[var(--brand-border)] bg-white px-3 text-sm text-zinc-900"
          onClick={() => setOpenDateField((prev) => (prev === field ? null : field))}
        >
          <CalendarDays className="h-4 w-4 text-zinc-500" />
          <span>{value || 'Select date'}</span>
        </button>
        {openDateField === field && (
          <div className="absolute left-0 top-15 z-50 mt-1 rounded-md border border-[var(--brand-border)] bg-white shadow-sm">
            <Calendar
              mode="single"
              selected={parseDate(value)}
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
    <div className="h-screen overflow-y-auto bg-[var(--brand-primary)] p-4 shadow-lg flex flex-col">
      <main className="h-screen overflow-hidden rounded-lg border border-[var(--brand-border)] bg-white flex flex-col shadow-sm">
        {/* TOP NAVBAR */}
        <header className="h-auto border-b border-[var(--brand-border)] bg-white px-6 py-3 flex items-center justify-between">
          <div className="h-9 flex gap-3 items-center justify-center">
            {/* <img
              src="/company_logo.svg"
              alt="Fair Fasteners logo"
              className="h-7 w-auto object-contain"
            />
            <span className="h-7 w-[1px] border border-black" /> */}
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
          <div
            data-lenis-scroll="true"
            className={`${showPreview ? "w-[45%] border-r border-[var(--brand-border)]" : "w-full"} h-full overflow-y-auto hide-scrollbar bg-white pt-5 px-0 pb-0 md:pt-6 md:px-0 md:pb-0`}
          >
          <div className="w-full flex flex-col gap-3 px-5 md:px-6">
            <div className="mb-1">
              <h1 className="text-2xl font-semibold">Create New Invoice</h1>
              <p className="text-sm text-zinc-500">Fill in invoice details</p>
            </div>

            <Section title="Invoice Details" icon="solar:bill-list-linear">
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
              <div className="border border-[var(--brand-border)] rounded-lg overflow-hidden bg-white">
                {/* Header */}
                <div className="grid grid-cols-16 gap-3 px-3 py-2 text-xs font-medium text-zinc-500 bg-zinc-50 border-b border-[var(--brand-border)]">
                  <div className="col-span-1" />
                  <div className="col-span-6">Description of Goods</div>
                  <div className="col-span-2">HSN</div>
                  <div className="col-span-2">Bags</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-1" />
                </div>

                {/* Rows */}
                <div className="flex flex-col">
                  {data.lineItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedLineItemId(item.id)
                        e.dataTransfer.effectAllowed = 'move'
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
                      className={`grid grid-cols-16 gap-3 items-center px-3 py-4 cursor-grab transition-all duration-200 bg-white border-b border-[var(--brand-border)] ${
                        draggedLineItemId === item.id ? 'opacity-60 scale-[0.99]' : 'opacity-100'
                      } ${dragOverLineItemId === item.id ? 'bg-[var(--brand-primary)]/5 border-b-[var(--brand-primary)]' : ''}`}
                    >
                      {/* Drag handle */}
                      <div className="col-span-1 flex items-center justify-center">
                        <GripVertical className="w-4 h-4 text-zinc-500" />
                      </div>

                      {/* Description */}
                      <div className="col-span-6">
                        <Input
                          placeholder="Description of Goods"
                          value={item.description}
                          onChange={(v) => updateLineItem(item.id, 'description', v as string)}
                        />
                      </div>

                      {/* HSN */}
                      <div className="col-span-2">
                        <Input
                          placeholder="HSN"
                          value={item.hsnCode}
                          onChange={(v) => updateLineItem(item.id, 'hsnCode', v as string)}
                        />
                      </div>

                      {/* Bags */}
                      <div className="col-span-2">
                        <Input
                          placeholder="Bags"
                          type="number"
                          value={item.bags}
                          onChange={(v) => updateLineItem(item.id, 'bags', v as number)}
                        />
                      </div>

                      {/* Qty */}
                      <div className="col-span-2">
                        <Input
                          placeholder="Qty"
                          type="number"
                          value={item.quantity}
                          onChange={(v) => updateLineItem(item.id, 'quantity', v as number)}
                        />
                      </div>

                      {/* Rate */}
                      <div className="col-span-2">
                        <Input
                          placeholder="Rate"
                          type="number"
                          value={item.rate}
                          onChange={(v) => updateLineItem(item.id, 'rate', v as number)}
                        />
                      </div>

                      {/* Delete */}
                      <div className="col-span-1 flex items-center justify-center">
                        {data.lineItems.length > 1 && (
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="w-7 h-7 bg-white border border-[var(--brand-border)] rounded-full text-red-600 flex items-center justify-center hover:bg-red-50"
                            aria-label="Remove line item"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white px-0 py-0">
                  <Button
                    variant="ghost"
                    onClick={addLineItem}
                    icon="solar:add-circle-linear"
                    className="w-full justify-start text-[14px] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
                  >
                    Add item
                  </Button>
                </div>
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

          <div className="sticky bottom-0 z-20 w-full px-3 py-3 border-t border-[var(--brand-border)] bg-white/95 backdrop-blur flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={handleReset}
              className="h-7 px-3 text-sm justify-center bg-white text-zinc-900 hover:bg-zinc-50 border border-[var(--brand-border)]"
            >
              Reset
            </Button>
            {/* <Button
              variant="outline"
              onClick={() => setShowPreview((prev) => !prev)}
              className="h-7 px-3 text-sm justify-center border-[var(--brand-border)] text-zinc-900 hover:bg-zinc-100"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button> */}
          </div>
          </div>

          {/* RIGHT: PREVIEW */}
          {showPreview && (
            <div
              data-lenis-scroll="true"
              className="w-[55%] h-full overflow-y-auto bg-[var(--brand-primary-soft)]"
            >
            <div className="sticky top-0 z-10 border-b border-[var(--brand-border)] bg-white px-4 md:px-6 py-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Preview</h2>
              <div className="flex items-center gap-2">
                <ShadButton
                  variant="outline"
                  size="default"
                  onClick={() => window.print()}
                className="h-8 border-[var(--brand-border)] bg-white px-3 text-zinc-700 hover:bg-zinc-50"
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
                    className="h-8 px-0 overflow-hidden bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white border border-[var(--brand-border)]"
                  >
                    <span className="px-3">{isExporting ? 'Generating...' : 'Download'}</span>
                    <span className="h-full w-px bg-white/35" />
                    <span className="w-9 h-full flex items-center justify-center">
                      <ChevronDown className="h-3 w-3" />
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
          )}
        </div>
      </main>
      {/* footer moved to app/layout.tsx */}
    </div>
  )
}
