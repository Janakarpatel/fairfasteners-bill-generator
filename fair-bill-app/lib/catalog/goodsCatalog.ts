import catalog from '@/lib/catalog/goods-catalog.json'

export interface GoodsProduct {
  id: string
  name: string
  sizes: string[]
  /** HSN/SAC-style code from catalog; auto-filled on line items when this product is selected. */
  hsnCode: string
}

export const GOODS_CUSTOM_ID = '__custom__'

const products = catalog.items as GoodsProduct[]

export function getGoodsProducts(): readonly GoodsProduct[] {
  return products
}

export function getGoodsProductById(id: string): GoodsProduct | undefined {
  return products.find((p) => p.id === id)
}

export function getSizesForGoodsProduct(productId: string): string[] {
  return getGoodsProductById(productId)?.sizes ?? []
}

export function getHsnCodeForGoodsProduct(productId: string): string {
  if (!productId || productId === GOODS_CUSTOM_ID) return ''
  return getGoodsProductById(productId)?.hsnCode?.trim() ?? ''
}

/** Single-line description for invoice: "Name, size" or name only if no size yet. */
export function formatGoodsDescriptionLine(productId: string, size: string): string {
  if (!productId || productId === GOODS_CUSTOM_ID) return ''
  const p = getGoodsProductById(productId)
  if (!p) return ''
  const s = size.trim()
  if (!s) return p.name
  return `${p.name}, ${s}`.replace(/\s+/g, ' ').trim()
}

/** Collapse internal newlines/spaces for table display (one visual line). */
export function toSingleLineDescription(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
