import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero'

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const thousands = ['', 'Thousand', 'Lakh', 'Crore', 'Arab']

  function convertToWords(n: number): string {
    if (n === 0) return ''
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertToWords(n % 100) : '')
    return ''
  }

  let billionth = 0
  const billions = Math.floor(num / 10000000)
  if (billions > 0) {
    billionth = billions
  }

  const millions = Math.floor((num % 10000000) / 100000)
  const thousands_val = Math.floor((num % 100000) / 1000)
  const hundreds = Math.floor((num % 1000) / 1)

  let result = ''

  if (billionth > 0) {
    result += convertToWords(billionth) + ' Crore '
  }

  if (millions > 0) {
    result += convertToWords(millions) + ' Lakh '
  }

  if (thousands_val > 0) {
    result += convertToWords(thousands_val) + ' Thousand '
  }

  if (hundreds > 0) {
    result += convertToWords(hundreds)
  }

  return result.trim() + ' Only'
}
