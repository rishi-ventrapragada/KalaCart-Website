import { useId, type SelectHTMLAttributes } from 'react'

import { fieldBase, fieldBorder, hintStyles, labelStyles } from '@/components/ui/fieldStyles'
import { cn } from '@/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> {
  label: string
  options: SelectOption[]
  hint?: string
  /** Leading empty option, e.g. "All categories". */
  placeholder?: string
}

/**
 * A native select. It is keyboard accessible and screen-reader correct for
 * free, and the PRD 11.3 filters need nothing a custom listbox would add.
 */
export function Select({ label, options, hint, placeholder, className, ...props }: SelectProps) {
  const id = useId()
  const hintId = `${id}-hint`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelStyles}>
        {label}
      </label>
      <select
        id={id}
        aria-describedby={hint ? hintId : undefined}
        className={cn(fieldBase, fieldBorder(false), className)}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className={hintStyles}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
