'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'

export type InvoiceSectionNavProps = {
  showBack: boolean
  isLastStep: boolean
  canProceed: boolean
  onBack: () => void
  onSaveAndNext: () => void
  onSaveProgress: () => void
}

export function InvoiceSectionNav({
  showBack,
  isLastStep,
  canProceed,
  onBack,
  onSaveAndNext,
  onSaveProgress,
}: InvoiceSectionNavProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--brand-border)] pt-4">
      {showBack ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="h-9 min-w-[5.5rem] justify-center border border-[var(--brand-border)] bg-white text-sm text-zinc-900 hover:bg-zinc-50"
        >
          <ArrowLeft className="mr-1 h-4 w-4 shrink-0" aria-hidden />
          Back
        </Button>
      ) : null}
      {isLastStep ? (
        <Button type="button" variant="primary" onClick={onSaveProgress} className="h-9 min-w-[9rem] justify-center text-sm">
          Save progress
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          disabled={!canProceed}
          onClick={onSaveAndNext}
          title={canProceed ? undefined : 'Complete this section to continue'}
          className="h-9 min-w-[10rem] justify-center text-sm disabled:pointer-events-auto disabled:opacity-40"
        >
          Save &amp; next
          <ArrowRight className="ml-1 h-4 w-4 shrink-0" aria-hidden />
        </Button>
      )}
    </div>
  )
}
