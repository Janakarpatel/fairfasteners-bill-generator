import { BillData, Calculations } from '@/lib/types'
import { COLOR_FALLBACKS } from '@/lib/billing/constants'

/**
 * Export the rendered invoice DOM to a PDF file.
 * Keeps WYSIWYG parity between preview and downloaded file.
 */
export const exportBillAsPdf = async (data: BillData) => {
  const html2canvas = (await import('html2canvas')).default
  const jsPDF = (await import('jspdf')).jsPDF

  const element = document.getElementById('invoice-preview')
  if (!element) {
    throw new Error('Invoice preview element not found')
  }

  await document.fonts.ready
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  const root = document.documentElement
  const previousValues: Record<string, string> = {}
  Object.entries(COLOR_FALLBACKS).forEach(([key, value]) => {
    previousValues[key] = root.style.getPropertyValue(key)
    root.style.setProperty(key, value)
  })

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      onclone: (clonedDoc: Document) => {
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          const css = styleEl.textContent
          if (!css) return
          styleEl.textContent = css
            .replace(/oklch\([^)]*\)/g, 'rgb(0,0,0)')
            .replace(/lab\([^)]*\)/g, 'rgb(0,0,0)')
        })
      },
    })
  } finally {
    Object.entries(previousValues).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(key, value)
      } else {
        root.style.removeProperty(key)
      }
    })
  }

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgWidth = 210
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  pdf.save(`Invoice_${data.billNo || 'Draft'}.pdf`)
}

/**
 * Export invoice details and calculated totals to a multi-sheet Excel file.
 */
export const exportBillAsExcel = async (data: BillData, calculations: Calculations) => {
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

