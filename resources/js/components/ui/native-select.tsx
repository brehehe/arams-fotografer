import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string | number
  label: string
}

export interface NativeSelectProps extends React.ComponentProps<"select"> {
  label?: string
  error?: string
  helperText?: string
  options?: SelectOption[]
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
      <div className="w-full text-xs space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block font-semibold text-slate-700 text-xs">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            data-slot="native-select"
            className={cn(
              "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 appearance-none transition-all outline-hidden pr-10 cursor-pointer",
              "focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20",
              "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-[11px] font-medium text-rose-500 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
