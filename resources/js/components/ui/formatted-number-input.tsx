import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormattedNumberInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number | string
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
}

export function FormattedNumberInput({
  value,
  onChange,
  prefix,
  suffix,
  className,
  placeholder = "0",
  disabled,
  ...props
}: FormattedNumberInputProps) {
  // Format numeric value with dot separator (id-ID)
  const formatDisplay = (val: number | string): string => {
    if (val === "" || val === null || val === undefined) return ""
    const cleaned = String(val).replace(/\D/g, "")
    if (!cleaned) return ""
    const num = parseInt(cleaned, 10)
    if (isNaN(num)) return ""
    return new Intl.NumberFormat("id-ID").format(num)
  }

  const [displayValue, setDisplayValue] = React.useState<string>(() => formatDisplay(value))

  React.useEffect(() => {
    setDisplayValue(formatDisplay(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "")
    if (!rawVal) {
      setDisplayValue("")
      onChange(0)
      return
    }
    const numVal = parseInt(rawVal, 10)
    setDisplayValue(new Intl.NumberFormat("id-ID").format(numVal))
    onChange(numVal)
  }

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <span className="absolute left-3 text-xs font-bold text-slate-400 select-none pointer-events-none z-10">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#C89445] focus:outline-hidden focus:ring-2 focus:ring-[#C89445]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          prefix ? "pl-10" : "pl-3.5",
          suffix ? "pr-10" : "pr-3.5",
          className
        )}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 text-xs font-semibold text-slate-400 select-none pointer-events-none z-10">
          {suffix}
        </span>
      )}
    </div>
  )
}

export { FormattedNumberInput as CurrencyInput }
