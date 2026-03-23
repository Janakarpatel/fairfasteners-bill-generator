'use client'

import * as React from 'react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ChevronDown, Printer, FileText, HardDrive, Hourglass, Plus, Trash2, Building2, FileJson, Users, Package, Calculator, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// ============ Button Component ============
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm',
        secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm',
        danger: 'bg-white text-red-600 border border-zinc-200 hover:bg-red-50 hover:border-red-200',
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
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  value?: string | number
  onChange?: (value: string | number) => void
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, disabled, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        const newValue = type === 'number' ? Number(e.target.value) : e.target.value
        onChange(newValue)
      }
    }

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300 dark:text-zinc-300">
            {label}
          </label>
        )}
        <input
          type={type}
          disabled={disabled}
          value={value ?? ''}
          onChange={handleChange}
          className={cn(
            'flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

// ============ Textarea Component ============
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  value?: string
  onChange?: (value: string) => void
  rows?: number
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, disabled, value, onChange, rows = 3, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300 dark:text-zinc-300">
            {label}
          </label>
        )}
        <textarea
          disabled={disabled}
          value={value ?? ''}
          onChange={handleChange}
          rows={rows}
          className={cn(
            'flex w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 ring-offset-background placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            className
          )}
          ref={ref}
          {...props}
        />
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
  defaultOpen?: boolean
}

export const Section = ({ title, icon, children, defaultOpen = false }: SectionProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  
  const iconComponent = typeof icon === 'string' ? getIconComponent(icon) : icon

  return (
    <CollapsiblePrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-zinc-700 rounded-lg bg-zinc-900 overflow-hidden shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <CollapsiblePrimitive.Trigger asChild>
          <button className="w-full flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 transition-colors border-b border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            <div className="flex items-center gap-2.5 text-zinc-50 dark:text-zinc-50">
              {iconComponent && <span className="flex items-center text-zinc-400 dark:text-zinc-400">{iconComponent}</span>}
              <span className="font-medium text-sm">{title}</span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-zinc-400 transition-transform duration-200 dark:text-zinc-400 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content className="p-4 bg-zinc-900 dark:bg-zinc-900">
          {children}
        </CollapsiblePrimitive.Content>
      </div>
    </CollapsiblePrimitive.Root>
  )
}
