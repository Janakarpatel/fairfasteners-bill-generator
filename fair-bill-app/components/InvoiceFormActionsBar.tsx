'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui'

export type InvoiceFormActionsBarProps = {
  showPreview: boolean
  onTogglePreview: () => void
  onClear: () => void
}

/** Pinned to the bottom of the invoice form column (outside the scroll region). */
export function InvoiceFormActionsBar({
  showPreview,
  onTogglePreview,
  onClear,
}: InvoiceFormActionsBarProps) {
  return (
    <div
      className="shrink-0 border-t border-[var(--brand-border)] bg-white px-5 py-3 md:px-6"
      role="toolbar"
      aria-label="Invoice form actions"
    >
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={onClear}
          className="h-7 px-3 text-sm justify-center bg-white text-zinc-900 hover:bg-zinc-50 border border-[var(--brand-border)]"
        >
          Clear
        </Button>
        <Button
          variant="outline"
          onClick={onTogglePreview}
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
  )
}
