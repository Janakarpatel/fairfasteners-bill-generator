/**
 * When IGST is 18% or 0.1%, use IGST-only mode: CGST/SGST inputs and amounts are zero.
 * Default remains CGST + SGST (e.g. 9+9) with IGST 0.
 */
export function isIgstInterstateRule(igstRate: number): boolean {
  if (igstRate === 18) return true
  return Math.abs(igstRate - 0.1) < 1e-9
}
