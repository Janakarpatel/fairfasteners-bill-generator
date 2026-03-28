import type { QuantityUnit } from '@/lib/types'

export type { QuantityUnit }

/** UOM label (same as stored value: KG | PC). */
export function formatQuantityUnitLabel(unit: QuantityUnit): string {
  return unit
}

export function formatQuantityWithUnit(quantity: number, unit: QuantityUnit): string {
  return `${quantity} ${formatQuantityUnitLabel(unit)}`
}
