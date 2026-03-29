'use client'

import * as React from 'react'
import { Printer, FileText, HardDrive, Hourglass, Plus, Trash2, Building2, FileJson, Users, Package, Calculator, CreditCard, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// ============ Button Component ============
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]',
        secondary: 'bg-zinc-100 text-zinc-900 border border-[var(--brand-border)] hover:bg-zinc-200',
        danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300',
        ghost: 'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'default' | 'destructive' | 'outline' | 'link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  icon?: string | React.ReactNode
  children: React.ReactNode
}

const getIconComponent = (iconString: string): React.ReactNode => {
  if (!iconString) return null
  
  // Map solar icons to lucide-react icons
  const iconMap: Record<string, React.ReactNode> = {
    'solar:printer-linear': <Printer className="h-4 w-4" />,
    'solar:document-text-linear': <FileText className="h-4 w-4" />,
    'solar:file-download-linear': <HardDrive className="h-4 w-4" />,
    'solar:hourglass-linear': <Hourglass className="h-4 w-4" />,
    'solar:add-circle-linear': <Plus className="h-4 w-4" />,
    'solar:trash-bin-trash-linear': <Trash2 className="h-4 w-4" />,
    'solar:buildings-linear': <Building2 className="h-4 w-4" />,
    'solar:bill-list-linear': <FileJson className="h-4 w-4" />,
    'solar:user-id-linear': <Users className="h-4 w-4" />,
    'solar:box-linear': <Package className="h-4 w-4" />,
    'solar:calculator-linear': <Calculator className="h-4 w-4" />,
    'solar:card-linear': <CreditCard className="h-4 w-4" />,
    'solar:notes-linear': <StickyNote className="h-4 w-4" />,
  }
  
  return iconMap[iconString] || null
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    const iconComponent = typeof icon === 'string' ? getIconComponent(icon) : icon
    
    return (
      <button
        className={cn(buttonVariants({ variant: variant as ButtonVariant, size, className }))}
        ref={ref}
        {...props}
      >
        {iconComponent && <span className="flex items-center">{iconComponent}</span>}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ============ Input Component ============
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string
  value?: string | number
  onChange?: (value: string | number) => void
  error?: string
}

const NUMERIC_INPUT_PATTERN = /^-?\d*\.?\d*$/

function numericDraftToValue(raw: string): number {
  const t = raw.trim()
  if (t === '' || t === '-' || t === '.' || t === '-.') return 0
  const n = parseFloat(t)
  return Number.isNaN(n) ? 0 : n
}

/** True when the field shows a numeric zero — on focus we clear the input so typing starts fresh; blur restores 0 if left empty. */
function isNumericZeroDisplay(s: string): boolean {
  const t = s.trim()
  if (t === '') return false
  const n = parseFloat(t)
  return !Number.isNaN(n) && n === 0
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, disabled, value, onChange, error, onFocus, onBlur, ...props }, ref) => {
    const isNumeric = type === 'number'

    const propDisplay = React.useMemo(() => {
      if (value === undefined || value === null || value === '') return ''
      return String(value)
    }, [value])

    const [numericFocused, setNumericFocused] = React.useState(false)
    const [numericDraft, setNumericDraft] = React.useState('')

    const numericDisplay = numericFocused ? numericDraft : propDisplay

    const handleNumericFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setNumericFocused(true)
      // Click/focus on 0: show empty so the user can type; blur with no input restores 0.
      setNumericDraft(isNumericZeroDisplay(propDisplay) ? '' : propDisplay)
      onFocus?.(e)
    }

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw !== '' && !NUMERIC_INPUT_PATTERN.test(raw)) return
      setNumericDraft(raw)
      if (raw === '' || raw === '-' || raw === '.' || raw === '-.' || raw.endsWith('.')) {
        return
      }
      const n = parseFloat(raw)
      if (!Number.isNaN(n) && onChange) {
        onChange(n)
      }
    }

    const handleNumericBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setNumericFocused(false)
      const final = numericDraftToValue(numericDraft)
      if (onChange) {
        onChange(final)
      }
      setNumericDraft('')
      onBlur?.(e)
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm text-[var(--input-field-color)] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        {isNumeric ? (
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            disabled={disabled}
            value={numericDisplay}
            onChange={handleNumericChange}
            onFocus={handleNumericFocus}
            onBlur={handleNumericBlur}
            aria-invalid={error ? true : undefined}
            className={cn(
              'flex h-10 w-full rounded-md border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
        ) : (
          <input
            type={type}
            disabled={disabled}
            value={value ?? ''}
            onChange={handleTextChange}
            aria-invalid={error ? true : undefined}
            className={cn(
              'flex h-10 w-full rounded-md border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
        )}
        {error ? <p className="text-xs text-red-600 leading-snug">{error}</p> : null}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ============ Textarea Component ============
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label?: string
  value?: string
  onChange?: (value: string) => void
  rows?: number
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, disabled, value, onChange, rows = 3, error, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm text-[var(--input-field-color)] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <textarea
          disabled={disabled}
          value={value ?? ''}
          onChange={handleChange}
          rows={rows}
          aria-invalid={error ? true : undefined}
          className={cn(
            'flex w-full rounded-md border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? <p className="text-xs text-red-600 leading-snug">{error}</p> : null}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ============ Section Component (using Collapsible) ============
interface SectionProps {
  title: string
  icon?: string | React.ReactNode
  children: React.ReactNode
}

export const Section = ({ title, icon, children }: SectionProps) => {
  const iconComponent = typeof icon === 'string' ? getIconComponent(icon) : icon

  return (
    <div className="bg-white overflow-visible">
      <div className="w-full flex items-center py-2 mb-2">
        <div className="flex items-center gap-2 text-zinc-900">
          {iconComponent && <span className="flex items-center text-zinc-500">{iconComponent}</span>}
          <span className="font-semibold text-[18px] leading-none tracking-tight text-zinc-900">{title}</span>
        </div>
      </div>
      <div className="pt-3 pb-4">{children}</div>
    </div>
  )
}
