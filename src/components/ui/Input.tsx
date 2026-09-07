import { useId, type InputHTMLAttributes } from 'react'

import {
  errorStyles,
  fieldBase,
  fieldBorder,
  hintStyles,
  labelStyles,
} from '@/components/ui/fieldStyles'
import { cn } from '@/lib/utils/cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, className, ...props }: InputProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelStyles}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn(fieldBase, fieldBorder(Boolean(error)), className)}
        {...props}
      />
      {hint ? (
        <p id={hintId} className={hintStyles}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className={errorStyles}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
