'use client'
// components/BillTemplate.tsx

import React from 'react'
import { BillData, Calculations } from '@/lib/types'
import { formatCurrency, numberToWords } from '@/lib/utils'

interface BillTemplateProps {
  data: BillData
  calculations: Calculations
}

export const BillTemplate = ({ data, calculations }: BillTemplateProps) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-GB')
  }

  return (
    <div
      id="invoice-preview"
      className="bg-white shadow-sm border border-zinc-200 w-full max-w-[210mm] min-h-[297mm] flex flex-col text-[11px] text-zinc-900 leading-snug relative mx-auto"
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

      <div className="text-center border-b border-zinc-900 bg-zinc-50 py-1">
        <span className="font-medium uppercase tracking-widest text-xs">Tax Invoice</span>
      </div>

      {/* Meta & Client Grid */}
      <div className="grid grid-cols-2 border-b border-zinc-900 min-h-[120px]">
        {/* Billed To */}
        <div className="border-r border-zinc-900 p-3 flex flex-col">
          <span className="text-zinc-500 font-medium mb-1">Billed To:</span>
          <span className="font-semibold text-[12px]">{data.clientName || '-'}</span>
          <span className="whitespace-pre-wrap mt-1">{data.clientAddress}</span>
          <div className="mt-auto pt-2 grid grid-cols-1 gap-0.5">
            {data.clientGstNo && (
              <div>
                <span className="font-medium">GSTIN:</span> {data.clientGstNo}
              </div>
            )}
            {data.clientMobile && (
              <div>
                <span className="font-medium">Contact:</span> {data.clientMobile}{' '}
                {data.clientContactName && `(${data.clientContactName})`}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-0 flex flex-col">
          <div className="grid grid-cols-2 border-b border-zinc-900">
            <div className="p-2 border-r border-zinc-900">
              <span className="font-medium">Bill No:</span> {data.billNo}
            </div>
            <div className="p-2">
              <span className="font-medium">Date:</span> {formatDate(data.billDate)}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-zinc-900">
            <div className="p-2 border-r border-zinc-900">
              <span className="font-medium">Book No:</span> {data.bookNo}
            </div>
            <div className="p-2">
              <span className="font-medium">PO No:</span> {data.poNo}
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-zinc-900">
            <div className="p-2 border-r border-zinc-900">
              <span className="font-medium">Challan No:</span> {data.chNo}
            </div>
            <div className="p-2">
              <span className="font-medium">Transport:</span> {data.transport}
            </div>
          </div>
          <div className="grid grid-cols-2 flex-1">
            <div className="p-2 border-r border-zinc-900">
              <span className="font-medium">LR No:</span> {data.lrNo}
            </div>
            <div className="p-2">
              <span className="font-medium">LR Date:</span> {formatDate(data.lrDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-50">
              <th className="p-2 border-r border-zinc-900 w-10 text-center font-medium">SR.</th>
              <th className="p-2 border-r border-zinc-900 font-medium">Description of Goods</th>
              <th className="p-2 border-r border-zinc-900 w-20 text-center font-medium">HSN</th>
              <th className="p-2 border-r border-zinc-900 w-16 text-center font-medium">Bags</th>
              <th className="p-2 border-r border-zinc-900 w-16 text-center font-medium">Qty</th>
              <th className="p-2 border-r border-zinc-900 w-24 text-right font-medium">Rate</th>
              <th className="p-2 w-28 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {calculations.items.map((item, index) => (
              <tr key={item.id} className="border-b border-zinc-200 align-top">
                <td className="p-2 border-r border-zinc-900 text-center">{index + 1}</td>
                <td className="p-2 border-r border-zinc-900 whitespace-pre-wrap">
                  {item.description}
                </td>
                <td className="p-2 border-r border-zinc-900 text-center">{item.hsnCode}</td>
                <td className="p-2 border-r border-zinc-900 text-center">{item.bags || '-'}</td>
                <td className="p-2 border-r border-zinc-900 text-center">{item.quantity}</td>
                <td className="p-2 border-r border-zinc-900 text-right">
                  {formatCurrency(item.rate).replace('₹', '')}
                </td>
                <td className="p-2 text-right">{formatCurrency(item.amount).replace('₹', '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t border-zinc-900 grid grid-cols-12">
        {/* Left side: Amount in words & Bank */}
        <div className="col-span-7 border-r border-zinc-900 p-3 flex flex-col justify-between">
          <div>
            <span className="font-medium text-zinc-500 block mb-1">Amount in Words:</span>
            <span className="font-medium">{numberToWords(calculations.grandTotal)}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-200">
            <span className="font-medium block mb-1 text-zinc-900">Bank Details:</span>
            <div className="grid grid-cols-1 gap-0.5 text-[10px]">
              {data.bankName && (
                <div>
                  <span className="text-zinc-500">Bank Name:</span>{' '}
                  <span className="font-medium">{data.bankName}</span>
                </div>
              )}
              {data.bankAccountNo && (
                <div>
                  <span className="text-zinc-500">A/C No:</span>{' '}
                  <span className="font-medium">{data.bankAccountNo}</span>
                </div>
              )}
              {data.bankBranch && (
                <div>
                  <span className="text-zinc-500">Branch:</span>{' '}
                  <span className="font-medium">{data.bankBranch}</span>
                </div>
              )}
              {data.bankIfscCode && (
                <div>
                  <span className="text-zinc-500">IFSC:</span>{' '}
                  <span className="font-medium">{data.bankIfscCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Calculation numbers */}
        <div className="col-span-5">
          <div className="flex justify-between p-2 border-b border-zinc-200">
            <span className="font-medium text-zinc-600">Sub Total</span>
            <span>{formatCurrency(calculations.subTotal)}</span>
          </div>
          {data.freight > 0 && (
            <div className="flex justify-between p-2 border-b border-zinc-200">
              <span className="font-medium text-zinc-600">Freight</span>
              <span>{formatCurrency(data.freight)}</span>
            </div>
          )}
          {data.cgstRate > 0 && (
            <div className="flex justify-between p-2 border-b border-zinc-200">
              <span className="font-medium text-zinc-600">CGST @ {data.cgstRate}%</span>
              <span>{formatCurrency(calculations.cgstAmount)}</span>
            </div>
          )}
          {data.sgstRate > 0 && (
            <div className="flex justify-between p-2 border-b border-zinc-200">
              <span className="font-medium text-zinc-600">SGST @ {data.sgstRate}%</span>
              <span>{formatCurrency(calculations.sgstAmount)}</span>
            </div>
          )}
          {data.igstRate > 0 && (
            <div className="flex justify-between p-2 border-b border-zinc-200">
              <span className="font-medium text-zinc-600">IGST @ {data.igstRate}%</span>
              <span>{formatCurrency(calculations.igstAmount)}</span>
            </div>
          )}
          <div className="flex justify-between p-2 bg-zinc-50 font-semibold text-[13px]">
            <span>Grand Total</span>
            <span>{formatCurrency(calculations.grandTotal)}</span>
          </div>
        </div>
      </div>

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
