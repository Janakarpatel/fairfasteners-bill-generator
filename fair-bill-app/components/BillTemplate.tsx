'use client'
// components/BillTemplate.tsx

import React from 'react'
import { BillData, Calculations } from '@/lib/types'
import { formatBillDateDisplay, formatCurrency, numberToWords } from '@/lib/utils'
import { formatBillingAddress } from '@/lib/billing/formatBillingAddress'
import { formatClientContactForDisplay } from '@/lib/billing/indianMobile'
import { toSingleLineDescription } from '@/lib/catalog/goodsCatalog'
import { formatQuantityUnitLabel } from '@/lib/billing/quantityUnit'
import { isIgstInterstateRule } from '@/lib/billing/taxRules'
import staticText from '@/lib/static-text.json'
import { jetbrainsMono } from '@/lib/fonts'
import { cn } from '@/lib/utils'

/** JetBrains Mono only for rupee / `formatCurrency` amounts (not dates, refs, qty, %, or codes). */
const money = cn(jetbrainsMono.className, 'invoice-numeric')

/** Single grid for header, line rows, and filler — column lines stay aligned (table + fr grid did not). */
const LINE_ITEM_GRID_COLS =
  'minmax(0,5%) minmax(0,32%) minmax(0,7%) minmax(0,5%) minmax(0,7%) minmax(0,7%) minmax(0,10%) minmax(0,1fr)'

interface BillTemplateProps {
  data: BillData
  calculations: Calculations
}

export const BillTemplate = ({ data, calculations }: BillTemplateProps) => {
  const clientContact = formatClientContactForDisplay(data.clientMobileDialCode, data.clientMobile)
  const billingAddressFormatted = formatBillingAddress(data)

  return (
    <div
      id="invoice-preview"
      className="invoice-a4-page bg-white border border-zinc-200 box-border shrink-0 w-[210mm] min-w-[210mm] max-w-none h-[297mm] min-h-[297mm] max-h-[297mm] flex flex-col text-[11px] text-zinc-900 leading-snug relative mx-auto rounded-md print:rounded-none"
    >
      {/* Header */}
      <div className="text-center p-4 border-b border-zinc-900">
        <h2 className="text-lg font-semibold tracking-tight uppercase mb-1">
          {data.companyName || 'COMPANY NAME'}
        </h2>
        {data.companyAddress && (
          <p className="whitespace-pre-wrap mb-1 text-zinc-700">{data.companyAddress}</p>
        )}
        <p className="text-zinc-700">
          {[
            data.companyMobile1 && `Mob: ${data.companyMobile1}`,
            data.companyMobile2,
            data.companyEmail && `Email: ${data.companyEmail}`,
            data.companyWebsite && `Web: ${data.companyWebsite}`,
          ]
            .filter(Boolean)
            .join(' | ')}
        </p>
        <div className="flex justify-center gap-4 mt-2 font-medium">
          {data.companyGstNo && <span>GSTIN: {data.companyGstNo}</span>}
          {data.companyUdyamNo && <span>UDYAM: {data.companyUdyamNo}</span>}
        </div>
      </div>

      <div className="border-b border-zinc-900 bg-zinc-50 text-center py-1.5">
        <span className="inline-block align-middle font-semibold uppercase text-[12px] tracking-[0.18em] leading-[1.1]">
          Tax Invoice
        </span>
      </div>

      {/* Meta & Client Grid */}
      <div className="grid grid-cols-2 border-b border-zinc-900 min-h-[120px]">
        {/* Billed To */}
        <div className="border-r border-zinc-900 p-3 flex flex-col">
          <span className="text-zinc-500 font-medium mb-1">Billed To:</span>
          <span className="font-semibold text-[12px]">{data.clientName || '-'}</span>
          {billingAddressFormatted ? (
            <span className="whitespace-pre-wrap mt-1">{billingAddressFormatted}</span>
          ) : null}
          <div className="mt-auto pt-2 grid grid-cols-1 gap-0.5">
            {data.clientGstNo && (
              <div>
                <span className="font-medium">GSTIN:</span> {data.clientGstNo}
              </div>
            )}
            {clientContact && (
              <div>
                <span className="font-medium">Contact No:</span> {clientContact}{' '}
                {data.clientContactName && `(${data.clientContactName})`}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-0 flex flex-col h-full min-h-0">
          <div className="grid grid-cols-2 border-b border-zinc-900">
            <div className="p-2 border-r border-zinc-900">
              <span className="font-medium">Bill No:</span> {data.billNo}
            </div>
            <div className="p-2">
              <span className="font-medium">Bill Date:</span> {formatBillDateDisplay(data.billDate)}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-zinc-900">
            <div className="p-2 border-r border-zinc-900">
              <span className="font-medium">Challan No:</span> {data.chNo}
            </div>
            <div className="p-2">
              <span className="font-medium">Challan Date:</span> {formatBillDateDisplay(data.chDate)}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-zinc-900">
            <div className="p-2 border-r border-zinc-900">
              <span className="font-medium">PO No:</span> {data.poNo}
            </div>
            <div className="p-2">
              <span className="font-medium">PO Date:</span> {formatBillDateDisplay(data.poDate)}
            </div>
          </div>
          <div className="border-b border-zinc-900 p-2">
            <span className="font-medium">Transport:</span> {data.transport}
          </div>
          <div className="grid grid-cols-2">
            <div className="p-2 border-r border-zinc-900">
              <span className="font-medium">LR No:</span> {data.lrNo}
            </div>
            <div className="p-2">
              <span className="font-medium">LR Date:</span> {formatBillDateDisplay(data.lrDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Line items: one CSS grid so header, rows, and filler share exact column tracks */}
      <div
        className="flex-1 min-h-0 border-zinc-900 grid text-left"
        style={{
          gridTemplateColumns: LINE_ITEM_GRID_COLS,
          gridTemplateRows: [
            ...Array(1 + calculations.items.length).fill('auto'),
            'minmax(2.5rem, 1fr)',
          ].join(' '),
        }}
      >
        <div className="p-2 border-b border-r border-zinc-900 bg-zinc-50 text-center font-medium">
          SN.
        </div>
        <div className="p-2 border-b border-r border-zinc-900 bg-zinc-50 min-w-0 font-medium">
          Description of Goods
        </div>
        <div className="p-2 border-b border-r border-zinc-900 bg-zinc-50 text-center font-medium">
          HSN
        </div>
        <div className="p-2 border-b border-r border-zinc-900 bg-zinc-50 text-center font-medium">
          Bags
        </div>
        <div className="p-2 border-b border-r border-zinc-900 bg-zinc-50 text-center font-medium">
          Qty
        </div>
        <div className="p-2 border-b border-r border-zinc-900 bg-zinc-50 text-center font-medium">
          Unit
        </div>
        <div className="p-2 border-b border-r border-zinc-900 bg-zinc-50 text-right font-medium">
          Rate
        </div>
        <div className="p-2 border-b border-zinc-900 bg-zinc-50 text-right font-medium">
          Amount
        </div>

        {calculations.items.map((item, index) => {
          const isLast = index === calculations.items.length - 1
          const rowBorder = isLast ? 'border-b border-zinc-900' : 'border-b border-zinc-200'
          return (
            <React.Fragment key={item.id}>
              <div className={`p-2 border-r border-zinc-900 text-center align-top ${rowBorder}`}>
                {index + 1}
              </div>
              <div className={`p-2 border-r border-zinc-900 min-w-0 align-top ${rowBorder}`}>
                <span
                  className="block truncate whitespace-nowrap"
                  title={toSingleLineDescription(item.description)}
                >
                  {toSingleLineDescription(item.description)}
                </span>
              </div>
              <div className={`p-2 border-r border-zinc-900 text-center align-top ${rowBorder}`}>
                {item.hsnCode}
              </div>
              <div className={`p-2 border-r border-zinc-900 text-center align-top ${rowBorder}`}>
                {Math.max(1, item.bags)}
              </div>
              <div
                className={`p-2 border-r border-zinc-900 text-center whitespace-nowrap align-top ${rowBorder}`}
              >
                {item.quantity}
              </div>
              <div
                className={`p-2 border-r border-zinc-900 text-center whitespace-nowrap align-top ${rowBorder}`}
              >
                {formatQuantityUnitLabel(item.quantityUnit)}
              </div>
              <div
                className={`p-2 border-r border-zinc-900 text-right whitespace-nowrap align-top ${rowBorder}`}
              >
                <span className={money}>{formatCurrency(item.rate).replace('₹', '')}</span>
              </div>
              <div className={`p-2 border-b border-zinc-900 text-right align-top ${rowBorder}`}>
                <span className={money}>{formatCurrency(item.amount).replace('₹', '')}</span>
              </div>
            </React.Fragment>
          )
        })}

        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={`filler-${i}`} className="border-r border-zinc-900 min-h-0" aria-hidden />
        ))}
        <div className="min-h-0" aria-hidden />
      </div>

      {/* Totals */}
      <div className="border-t border-zinc-900 grid grid-cols-12">
        {/* Left side: Amount in words, payment terms & Bank */}
        <div className="col-span-7 border-r border-zinc-900 p-3 flex flex-col justify-between">
          <div>
            <span className="font-medium text-zinc-500 block mb-1">Amount in Words:</span>
            <span className="font-medium">{numberToWords(calculations.grandTotal)}</span>
          </div>
          <div className="mt-3">
            <span className="font-medium text-zinc-500 block mb-1">Payment Terms:</span>
            <span className="text-zinc-800">{data.paymentTerms?.trim() || '—'}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-200">
            <span className="font-medium block mb-1 text-zinc-900">Bank Details:</span>
            <div className="grid grid-cols-1 gap-0.5 text-[10px]">
              {staticText.bank.name && (
                <div>
                  <span className="text-zinc-500">Bank Name:</span>{' '}
                  <span className="font-medium">{staticText.bank.name}</span>
                </div>
              )}
              {staticText.bank.accountNo && (
                <div>
                  <span className="text-zinc-500">A/C No:</span>{' '}
                  <span className="font-medium">{staticText.bank.accountNo}</span>
                </div>
              )}
              {staticText.bank.branch && (
                <div>
                  <span className="text-zinc-500">Branch:</span>{' '}
                  <span className="font-medium">{staticText.bank.branch}</span>
                </div>
              )}
              {staticText.bank.ifscCode && (
                <div>
                  <span className="text-zinc-500">IFSC:</span>{' '}
                  <span className="font-medium">{staticText.bank.ifscCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Calculation numbers */}
        <div className="col-span-5">
          <div className="flex justify-between p-2 border-b border-zinc-200">
            <span className="font-medium text-zinc-600">Sub Total</span>
            <span className={money}>{formatCurrency(calculations.subTotal)}</span>
          </div>
          {data.freight > 0 && (
            <div className="flex justify-between p-2 border-b border-zinc-200">
              <span className="font-medium text-zinc-600">Freight</span>
              <span className={money}>{formatCurrency(data.freight)}</span>
            </div>
          )}
          {!isIgstInterstateRule(data.igstRate) && data.cgstRate > 0 && (
            <div className="flex justify-between p-2 border-b border-zinc-200">
              <span className="font-medium text-zinc-600">CGST @ {data.cgstRate}%</span>
              <span className={money}>{formatCurrency(calculations.cgstAmount)}</span>
            </div>
          )}
          {!isIgstInterstateRule(data.igstRate) && data.sgstRate > 0 && (
            <div className="flex justify-between p-2 border-b border-zinc-200">
              <span className="font-medium text-zinc-600">SGST @ {data.sgstRate}%</span>
              <span className={money}>{formatCurrency(calculations.sgstAmount)}</span>
            </div>
          )}
          {isIgstInterstateRule(data.igstRate) && (
            <div className="flex justify-between p-2 border-b border-zinc-200">
              <span className="font-medium text-zinc-600">IGST @ {data.igstRate}%</span>
              <span className={money}>{formatCurrency(calculations.igstAmount)}</span>
            </div>
          )}
          <div className="flex justify-between p-2 border-b border-zinc-200">
            <span className="font-medium text-zinc-600">Round off</span>
            <span className={money}>{formatCurrency(calculations.roundOff)}</span>
          </div>
          <div className="flex justify-between p-2 bg-zinc-50 font-semibold text-[13px]">
            <span>Grand Total</span>
            <span className={money}>{formatCurrency(calculations.grandTotal)}</span>
          </div>
        </div>
      </div>

      {data.notes.trim() ? (
        <div className="border-t border-zinc-900 p-3 flex-none">
          <span className="font-medium text-zinc-900 block mb-1">Notes:</span>
          <div className="whitespace-pre-wrap text-[9px] text-zinc-600 leading-tight">
            {data.notes.trim()}
          </div>
        </div>
      ) : null}

      {/* Footer: Terms & Signature */}
      <div className="border-t border-zinc-900 grid grid-cols-2 flex-none">
        <div className="p-3 border-r border-zinc-900">
          <span className="font-medium text-zinc-900 block mb-1">Terms &amp; Conditions:</span>
          <div className="whitespace-pre-wrap text-[9px] text-zinc-600 leading-tight">
            {data.termsAndConditions}
          </div>
        </div>
        <div className="p-3 flex flex-col items-center justify-end min-h-[100px]">
          <div className="mt-auto w-full text-center border-t border-zinc-300 pt-1">
            <span className="font-medium text-zinc-900">
              For {data.companyName || 'Company Name'}
            </span>
            <span className="block text-[10px] text-zinc-500 mt-1">Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  )
}
