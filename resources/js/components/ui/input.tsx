import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode
  suffix?: React.ReactNode
  error?: string
  label?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, suffix, error, label, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
      <div className="w-full text-xs space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block font-semibold text-slate-700 text-xs">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            data-slot="input"
            className={cn(
              "w-full h-[42px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all outline-hidden",
              "focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20",
              "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
              icon && "pl-10",
              suffix && "pr-10",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20",
              className
            )}
            {...props}
          />

          {suffix && (
            <div className="absolute right-3.5 text-slate-400 flex items-center justify-center">
              {suffix}
            </div>
          )}
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
Input.displayName = "Input"

export { Input }
