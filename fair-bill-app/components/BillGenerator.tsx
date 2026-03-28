'use client'
// components/BillGenerator.tsx

import React, { useState, useEffect, useMemo } from 'react'
import {
  CalendarDays,
  ChevronDown,
  Eye,
  EyeOff,
  GripVertical,
  Printer,
  Trash2,
  User,
} from 'lucide-react'
import {
  BillData,
  Calculations,
  fixedCompanyData,
  getDefaultQuantityUnit,
  getInitialBillData,
  type LineItem,
} from '@/lib/types'
import { calculateBillTotals } from '@/lib/billing/calculations'
import { exportBillAsExcel, exportBillAsPdf } from '@/lib/billing/exports'
import { loadPersistedBillFields, savePersistedBillFields } from '@/lib/billing/storage'
import { isIgstInterstateRule } from '@/lib/billing/taxRules'
import {
  PAYMENT_TERMS_CUSTOM_VALUE,
  PAYMENT_TERMS_PRESETS,
  paymentTermsSelectValue,
} from '@/lib/billing/paymentTermsOptions'
import staticText from '@/lib/static-text.json'
import {
  formatGoodsDescriptionLine,
  getGoodsProducts,
  getSizesForGoodsProduct,
  GOODS_CUSTOM_ID,
} from '@/lib/catalog/goodsCatalog'
import { formatBillingAddress, normalizePincodeInput } from '@/lib/billing/formatBillingAddress'
import { getGstinFieldError, normalizeGstinInput } from '@/lib/billing/gstin'
import {
  COUNTRY_DIAL_OPTIONS,
  CUSTOM_DIAL_VALUE,
  isPresetDialCode,
} from '@/lib/billing/countryDialCodes'
import {
  getClientMobileFieldError,
  getDialCodeFieldError,
  INDIA_DIAL_CODE,
  normalizeDialCodeInput,
  normalizeNationalMobileInput,
} from '@/lib/billing/indianMobile'
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

/** Fixed min column widths — avoids 18× equal fr columns crushing inputs (overlap). */
const LINE_ITEMS_GRID_STYLE: React.CSSProperties = {
  gridTemplateColumns:
    '2.25rem minmax(17rem, 2.25fr) minmax(5.5rem, 0.52fr) minmax(5.5rem, 0.52fr) minmax(6.5rem, 0.42fr) minmax(5.25rem, 0.36fr) minmax(6.75rem, 0.52fr) 2.5rem',
}

export default function BillGenerator() {
  const [data, setData] = useState<BillData>(getInitialBillData)
  const [isExporting, setIsExporting] = useState(false)
  const [draggedLineItemId, setDraggedLineItemId] = useState<string | null>(null)
  const [dragOverLineItemId, setDragOverLineItemId] = useState<string | null>(null)
  const [openDateField, setOpenDateField] = useState<keyof BillData | null>(null)
  const [showPreview, setShowPreview] = useState(false)

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
          className="flex h-10 w-full items-center justify-start gap-3 rounded-md border border-[var(--brand-border)] bg-white px-3 text-sm text-zinc-900 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
  }, [data.termsAndConditions])

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

  const lineItemProductSelectValue = (item: (typeof data.lineItems)[0]) => {
    if (item.goodsProductId) return item.goodsProductId
    if (item.description.trim()) return GOODS_CUSTOM_ID
    return ''
  }

  const onLineItemProductChange = (id: string, productId: string) => {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => {
        if (item.id !== id) return item
        if (productId === GOODS_CUSTOM_ID) {
          return { ...item, goodsProductId: GOODS_CUSTOM_ID, goodsSize: '' }
        }
        if (!productId) {
          return { ...item, goodsProductId: '', goodsSize: '', description: '' }
        }
        return {
          ...item,
          goodsProductId: productId,
          goodsSize: '',
          description: formatGoodsDescriptionLine(productId, ''),
        }
      }),
    }))
  }

  const onLineItemSizeChange = (id: string, size: string) => {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => {
        if (item.id !== id) return item
        if (item.goodsProductId === GOODS_CUSTOM_ID || !item.goodsProductId) return item
        return {
          ...item,
          goodsSize: size,
          description: formatGoodsDescriptionLine(item.goodsProductId, size),
        }
      }),
    }))
  }

  const addLineItem = () => {
    const row: LineItem = {
      id: Date.now().toString(),
      goodsProductId: '',
      goodsSize: '',
      description: '',
      hsnCode: '',
      bags: 0,
      quantity: 1,
      quantityUnit: getDefaultQuantityUnit(),
      rate: 0,
    }
    setData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, row],
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

  const clientGstError = useMemo(() => getGstinFieldError(data.clientGstNo), [data.clientGstNo])
  const clientDialCodeError = useMemo(
    () => getDialCodeFieldError(data.clientMobileDialCode, data.clientMobile),
    [data.clientMobileDialCode, data.clientMobile]
  )
  const clientMobileError = useMemo(
    () => getClientMobileFieldError(data.clientMobile, data.clientMobileDialCode),
    [data.clientMobile, data.clientMobileDialCode]
  )

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
      <main className="h-screen overflow-hidden rounded-sm border border-[var(--brand-border)] bg-white flex flex-col shadow-sm">
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
            className={`${showPreview ? "w-[45%] border-r border-[var(--brand-border)]" : "w-full"} h-full min-h-0 overflow-y-auto overflow-x-hidden hide-scrollbar bg-white pt-5 px-0 pb-0 md:pt-6 md:px-0 md:pb-0 touch-pan-y`}
          >
          <div className="w-full flex flex-col gap-3 px-5 md:px-6">
            <div className="mb-1">
              <h1 className="text-2xl font-semibold">Create New Invoice</h1>
              <p className="text-sm text-zinc-500">Fill in invoice details</p>
            </div>

            <Section title="Invoice Details">
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
                  label="Street / building / area"
                  value={data.clientAddress}
                  onChange={(v) => updateField('clientAddress', v)}
                  className="col-span-full resize-none overflow-y-auto"
                  rows={2}
                  placeholder="Door no., street, area, landmark…"
                />
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={data.clientCity}
                    onChange={(v) => updateField('clientCity', v as string)}
                    placeholder="City"
                  />
                  <Input
                    label="State"
                    value={data.clientState}
                    onChange={(v) => updateField('clientState', v as string)}
                    placeholder="State"
                  />
                  <Input
                    label="PIN / Postal code"
                    value={data.clientPincode}
                    onChange={(v) => updateField('clientPincode', normalizePincodeInput(String(v)))}
                    placeholder="e.g. 110020"
                    inputMode="text"
                  />
                </div>
                {formatBillingAddress(data) ? (
                  <p className="col-span-full text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap border border-dashed border-[var(--brand-border)] rounded-md px-3 py-2 bg-zinc-50/80">
                    <span className="font-medium text-[var(--input-field-color)]">Preview: </span>
                    {formatBillingAddress(data)}
                  </p>
                ) : null}
                <Input
                  label="GST No."
                  value={data.clientGstNo}
                  onChange={(v) => updateField('clientGstNo', normalizeGstinInput(String(v)))}
                  error={clientGstError ?? undefined}
                  placeholder="15 chars, A-Z and 0-9"
                  maxLength={15}
                  spellCheck={false}
                  autoCapitalize="characters"
                />
                <Input label="Contact Person" value={data.clientContactName} onChange={(v) => updateField('clientContactName', v as string)} />
                <div className="col-span-full grid grid-cols-1 sm:grid-cols-[minmax(0,260px)_1fr] gap-3 items-end">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-[var(--input-field-color)] font-medium leading-none">
                      Country code
                    </label>
                    <div className="relative">
                      <select
                        value={
                          isPresetDialCode(data.clientMobileDialCode)
                            ? normalizeDialCodeInput(data.clientMobileDialCode)
                            : CUSTOM_DIAL_VALUE
                        }
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === CUSTOM_DIAL_VALUE) {
                            updateField('clientMobileDialCode', '')
                          } else {
                            updateField('clientMobileDialCode', v)
                          }
                        }}
                        aria-invalid={clientDialCodeError ? true : undefined}
                        className={
                          'h-10 w-full cursor-pointer appearance-none rounded-md border border-[var(--brand-border)] bg-white py-2 pl-3 pr-9 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white' +
                          (clientDialCodeError
                            ? ' border-red-500 focus-visible:ring-red-500'
                            : '')
                        }
                      >
                        {COUNTRY_DIAL_OPTIONS.map(({ dial, label }) => (
                          <option key={dial} value={dial}>
                            {label} (+{dial})
                          </option>
                        ))}
                        <option value={CUSTOM_DIAL_VALUE}>Other…</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    </div>
                    {normalizeDialCodeInput(data.clientMobileDialCode) === '' ||
                    !isPresetDialCode(data.clientMobileDialCode) ? (
                      <div
                        className={
                          'flex h-10 w-full rounded-md border border-[var(--brand-border)] bg-white overflow-hidden focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-white' +
                          (clientDialCodeError ? ' border-red-500 focus-within:ring-red-500' : '')
                        }
                      >
                        <span className="flex items-center border-r border-[var(--brand-border)] bg-zinc-50 px-2.5 text-sm text-zinc-600">
                          +
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="tel-country-code"
                          value={data.clientMobileDialCode}
                          onChange={(e) =>
                            updateField('clientMobileDialCode', normalizeDialCodeInput(e.target.value))
                          }
                          placeholder="Code"
                          maxLength={4}
                          spellCheck={false}
                          className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                        />
                      </div>
                    ) : null}
                    {clientDialCodeError ? (
                      <p className="text-xs text-red-600 leading-snug">{clientDialCodeError}</p>
                    ) : null}
                  </div>
                  <Input
                    label="Mobile"
                    type="tel"
                    inputMode="numeric"
                    value={data.clientMobile}
                    onChange={(v) =>
                      updateField(
                        'clientMobile',
                        normalizeNationalMobileInput(String(v), data.clientMobileDialCode)
                      )
                    }
                    error={clientMobileError ?? undefined}
                    placeholder={
                      normalizeDialCodeInput(data.clientMobileDialCode) === INDIA_DIAL_CODE
                        ? '10-digit number (starts with 6-9)'
                        : 'National mobile number'
                    }
                    maxLength={
                      normalizeDialCodeInput(data.clientMobileDialCode) === INDIA_DIAL_CODE ? 10 : 15
                    }
                  />
                </div>
              </div>
            </Section>

            <Section title="Line Items" icon="solar:box-linear">
              <div className="border border-[var(--brand-border)] rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto overscroll-x-auto touch-pan-x">
                  <div className="min-w-[56rem]">
                    {/* Header */}
                    <div
                      className="grid gap-x-3 gap-y-1 px-3 py-2.5 text-xs font-medium text-[var(--input-field-color)] bg-zinc-50 border-b border-[var(--brand-border)] items-end"
                      style={LINE_ITEMS_GRID_STYLE}
                    >
                      <div className="min-h-[2.5rem]" aria-hidden />
                      <div className="min-w-0 pb-0.5">
                        <div className="font-medium text-zinc-700">Description of Goods</div>
                        <div className="mt-1 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-wide text-zinc-500">
                          <span>Item</span>
                          <span>Size</span>
                        </div>
                      </div>
                      <div className="pb-0.5">HSN</div>
                      <div className="pb-0.5">Bags</div>
                      <div className="min-w-0 pb-0.5">Qty</div>
                      <div className="pb-0.5">Unit</div>
                      <div className="pb-0.5">Rate (₹)</div>
                      <div className="min-h-[2.5rem]" aria-hidden />
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
                          onDragLeave={() =>
                            setDragOverLineItemId((prev) => (prev === item.id ? null : prev))
                          }
                          onDrop={() => {
                            if (draggedLineItemId) {
                              reorderLineItems(draggedLineItemId, item.id)
                            }
                            setDragOverLineItemId(null)
                            setDraggedLineItemId(null)
                          }}
                          data-dragging={draggedLineItemId === item.id}
                          data-dragover={dragOverLineItemId === item.id}
                          style={LINE_ITEMS_GRID_STYLE}
                          className={`grid gap-x-3 gap-y-2 items-start px-3 py-3 transition-colors bg-white border-b border-[var(--brand-border)] last:border-b-0 cursor-grab ${
                            draggedLineItemId === item.id ? 'opacity-60' : ''
                          } ${
                            dragOverLineItemId === item.id
                              ? 'bg-[var(--brand-primary)]/5 border-b-[var(--brand-primary)]'
                              : ''
                          }`}
                        >
                          {/* Drag handle */}
                          <div className="flex items-center justify-center pt-2 shrink-0">
                            <GripVertical className="w-4 h-4 text-zinc-500" />
                          </div>

                          {/* Description */}
                          <div className="min-w-0 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="relative min-w-0">
                                <select
                                  value={lineItemProductSelectValue(item)}
                                  onChange={(e) =>
                                    onLineItemProductChange(item.id, e.target.value)
                                  }
                                  className="h-10 w-full min-w-0 max-w-full cursor-pointer appearance-none rounded-md border border-[var(--brand-border)] bg-white py-2 pl-2.5 pr-8 text-sm text-zinc-900 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                >
                                  <option value="">Select item…</option>
                                  {getGoodsProducts().map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
                                    </option>
                                  ))}
                                  <option value={GOODS_CUSTOM_ID}>Custom description…</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                              </div>
                              <div className="relative min-w-0">
                                <select
                                  value={item.goodsSize}
                                  disabled={
                                    !item.goodsProductId ||
                                    item.goodsProductId === GOODS_CUSTOM_ID
                                  }
                                  onChange={(e) => onLineItemSizeChange(item.id, e.target.value)}
                                  className="h-10 w-full min-w-0 max-w-full cursor-pointer appearance-none rounded-md border border-[var(--brand-border)] bg-white py-2 pl-2.5 pr-8 text-sm text-zinc-900 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                                >
                                  <option value="">
                                    {item.goodsProductId &&
                                    item.goodsProductId !== GOODS_CUSTOM_ID
                                      ? 'Select size…'
                                      : '—'}
                                  </option>
                                  {getSizesForGoodsProduct(item.goodsProductId).map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                              </div>
                            </div>
                            {item.goodsProductId === GOODS_CUSTOM_ID ? (
                              <div className="min-w-0 w-full">
                                <Input
                                  placeholder="Type description (one line on invoice)"
                                  value={item.description}
                                  onChange={(v) =>
                                    updateLineItem(item.id, 'description', v as string)
                                  }
                                />
                              </div>
                            ) : item.goodsProductId ? (
                              <p className="text-[11px] leading-tight text-zinc-500 line-clamp-2">
                                <span className="font-medium text-zinc-400">On invoice: </span>
                                {item.description || '—'}
                              </p>
                            ) : null}
                          </div>

                          <div className="min-w-0 w-full">
                            <Input
                              placeholder="HSN"
                              value={item.hsnCode}
                              onChange={(v) => updateLineItem(item.id, 'hsnCode', v as string)}
                            />
                          </div>

                          <div className="min-w-0 w-full">
                            <Input
                              placeholder="Bags"
                              type="number"
                              value={item.bags}
                              onChange={(v) => updateLineItem(item.id, 'bags', v as number)}
                            />
                          </div>

                          <div className="min-w-0 w-full">
                            <Input
                              placeholder="Qty"
                              type="number"
                              value={item.quantity}
                              onChange={(v) =>
                                updateLineItem(item.id, 'quantity', v as number)
                              }
                            />
                          </div>

                          <div className="relative min-w-0 w-full self-stretch">
                            <select
                              value={item.quantityUnit}
                              onChange={(e) =>
                                updateLineItem(
                                  item.id,
                                  'quantityUnit',
                                  e.target.value as 'KG' | 'PC'
                                )
                              }
                              className="box-border h-10 w-full min-w-0 cursor-pointer appearance-none rounded-md border border-[var(--brand-border)] bg-white py-2 pl-2.5 pr-8 text-sm text-zinc-900 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                              aria-label="Unit (KG or PC)"
                            >
                              <option value="PC">PC</option>
                              <option value="KG">KG</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          </div>

                          <div className="min-w-0 w-full">
                            <Input
                              placeholder="Rate"
                              type="number"
                              value={item.rate}
                              onChange={(v) =>
                                updateLineItem(item.id, 'rate', v as number)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-center pt-2 shrink-0">
                            {data.lineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLineItem(item.id)}
                                className="w-8 h-8 bg-white border border-[var(--brand-border)] rounded-full text-red-600 flex items-center justify-center hover:bg-red-50"
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
                  </div>
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
                <Input
                  label="IGST Rate (%)"
                  type="number"
                  step="any"
                  value={data.igstRate}
                  onChange={(v) => {
                    const igst = typeof v === 'number' ? v : Number(v)
                    if (Number.isNaN(igst)) {
                      updateField('igstRate', v as number)
                      return
                    }
                    if (isIgstInterstateRule(igst)) {
                      setData((prev) => ({
                        ...prev,
                        igstRate: igst,
                        cgstRate: 0,
                        sgstRate: 0,
                      }))
                      return
                    }
                    if (igst === 0) {
                      setData((prev) => ({
                        ...prev,
                        igstRate: 0,
                        cgstRate: staticText.defaults.cgstRate ?? 9,
                        sgstRate: staticText.defaults.sgstRate ?? 9,
                      }))
                      return
                    }
                    updateField('igstRate', igst)
                  }}
                />
              </div>
            </Section>

            <Section title="Payment" icon="solar:card-linear">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full flex flex-col gap-2">
                  <label className="text-sm font-medium leading-none text-[var(--input-field-color)]">
                    Payment Terms
                  </label>
                  <div className="relative">
                    <select
                      value={paymentTermsSelectValue(data.paymentTerms)}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === PAYMENT_TERMS_CUSTOM_VALUE) {
                          updateField('paymentTerms', '')
                        } else {
                          updateField('paymentTerms', v)
                        }
                      }}
                      className="h-10 w-full cursor-pointer appearance-none rounded-md border border-[var(--brand-border)] bg-white py-2 pl-3 pr-9 text-sm text-zinc-900 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      {PAYMENT_TERMS_PRESETS.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                      <option value={PAYMENT_TERMS_CUSTOM_VALUE}>Custom…</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  </div>
                  {paymentTermsSelectValue(data.paymentTerms) === PAYMENT_TERMS_CUSTOM_VALUE && (
                    <Input
                      placeholder="Type custom payment terms"
                      value={data.paymentTerms}
                      onChange={(v) => updateField('paymentTerms', v as string)}
                    />
                  )}
                </div>
              </div>
            </Section>

            <Section title="Notes" icon="solar:notes-linear">
              <Textarea
                label="Additional notes"
                value={data.notes}
                onChange={(v) => updateField('notes', v)}
                className="col-span-full resize-y min-h-[4.5rem]"
                rows={3}
                placeholder="Optional — delivery instructions, references, or other remarks (shown on the invoice when filled)"
              />
            </Section>

          </div>

          <div className="sticky bottom-0 z-20 w-full px-3 py-3 border-t border-[var(--brand-border)] bg-white/95 backdrop-blur flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={handleReset}
              className="h-7 px-3 text-sm justify-center bg-white text-zinc-900 hover:bg-zinc-50 border border-[var(--brand-border)]"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview((prev) => !prev)}
              className="h-7 px-3 text-sm justify-center border-[var(--brand-border)] text-zinc-900 hover:bg-zinc-100"
              icon={
                showPreview ? (
                  <EyeOff className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
                ) : (
                  <Eye className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
                )
              }
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
          </div>

          {/* RIGHT: PREVIEW */}
          {showPreview && (
            <div
              data-lenis-scroll="true"
              className="w-[55%] h-full min-h-0 overflow-y-auto overflow-x-hidden bg-[var(--brand-primary-soft)] touch-pan-y"
            >
              <div className="flex min-h-full flex-col">
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
                          <span className="px-3">{isExporting ? 'Downloading...' : 'Download'}</span>
                        </ShadButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={exportExcel}>.xlsx</DropdownMenuItem>
                        <DropdownMenuItem onClick={exportPDF}>.pdf</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4 md:p-8 flex flex-1 justify-center bg-[var(--brand-primary-soft)]">
                  <BillTemplate data={data} calculations={calculations} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* footer moved to app/layout.tsx */}
    </div>
  )
}
