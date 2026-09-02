import * as React from "react"
import { Search, ChevronDown, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectSearchOption {
  value: string
  label: string
  subtitle?: string
  icon?: React.ReactNode
}

export interface SelectSearchProps {
  options: SelectSearchOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
  disabled?: boolean
  className?: string
  clearable?: boolean
  isLoading?: boolean
  error?: string
  required?: boolean
  variant?: 'light' | 'dark'
}

export function SelectSearch({
  options = [],
  value = "",
  onChange,
  placeholder = "Pilih salah satu...",
  searchPlaceholder = "Cari opsi...",
  label,
  disabled = false,
  className,
  clearable = true,
  isLoading = false,
  error,
  required = false,
  variant = 'light',
}: SelectSearchProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(query))
    )
  }, [options, searchQuery])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setSearchQuery("")
  }

  return (
    <div className={cn("relative w-full text-xs", className)} ref={dropdownRef}>
      {label && (
        <label
          className={cn(
            "block font-semibold mb-1.5 text-xs flex items-center justify-between",
            variant === 'dark' ? "text-slate-300" : "text-slate-700"
          )}
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
          {isLoading && (
            <span
              className={cn(
                "text-[10px] font-normal flex items-center gap-1",
                variant === 'dark' ? "text-amber-400" : "text-amber-600"
              )}
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Memuat...</span>
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        className={cn(
          "w-full h-[38px] px-3.5 rounded-xl text-left flex items-center justify-between transition-all duration-150 outline-hidden cursor-pointer",
          variant === 'dark'
            ? "bg-black/30 border border-white/10 text-white focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20"
            : "bg-white border border-slate-200 text-slate-900 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20",
          isOpen && "border-[#C89445] ring-2 ring-[#C89445]/20 shadow-xs",
          error && "border-rose-400 ring-1 ring-rose-300",
          (disabled || isLoading) && (variant === 'dark' ? "bg-white/5 cursor-not-allowed opacity-50" : "bg-slate-50 cursor-not-allowed opacity-65")
        )}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {isLoading ? (
            <span className={cn("font-normal italic text-xs", variant === 'dark' ? "text-slate-500" : "text-slate-400")}>
              Memuat daftar pilihan...
            </span>
          ) : selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon}
              <span className={cn("font-bold text-xs truncate", variant === 'dark' ? "text-white" : "text-slate-900")}>
                {selectedOption.label}
              </span>
              {selectedOption.subtitle && (
                <span className={cn("text-[10px] font-medium shrink-0", variant === 'dark' ? "text-slate-400" : "text-slate-500")}>
                  ({selectedOption.subtitle})
                </span>
              )}
            </div>
          ) : (
            <span className={cn("font-normal text-xs", variant === 'dark' ? "text-slate-500" : "text-slate-400")}>
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {isLoading ? (
            <Loader2 className={cn("w-3.5 h-3.5 animate-spin", variant === 'dark' ? "text-slate-500" : "text-slate-400")} />
          ) : (
            <>
              {clearable && selectedOption && !disabled && (
                <span
                  onClick={handleClear}
                  className={cn(
                    "w-5 h-5 flex items-center justify-center rounded-md transition-colors cursor-pointer",
                    variant === 'dark' ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-150",
                  variant === 'dark' ? "text-slate-400" : "text-slate-400",
                  isOpen && "rotate-180 text-[#C89445]"
                )}
              />
            </>
          )}
        </div>
      </button>

      {error && (
        <span className="text-[10px] text-rose-500 font-semibold block mt-1">
          {error}
        </span>
      )}

      {/* Dropdown Popup */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100",
            variant === 'dark'
              ? "bg-[#1C132E] border border-white/15 text-white"
              : "bg-white border border-slate-200/90"
          )}
        >
          {/* Search Input Box inside Dropdown */}
          <div className={cn("p-2 border-b", variant === 'dark' ? "border-white/10 bg-black/40" : "border-slate-100 bg-slate-50/50")}>
            <div className="relative flex items-center">
              <Search className={cn("w-3.5 h-3.5 absolute left-2.5 pointer-events-none", variant === 'dark' ? "text-slate-400" : "text-slate-400")} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  "w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-hidden transition-all",
                  variant === 'dark'
                    ? "bg-black/30 border border-white/10 text-white placeholder-slate-500 focus:border-[#C89445]"
                    : "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#C89445]"
                )}
              />
            </div>
          </div>

          {/* Options List */}
          <div className={cn("max-h-56 overflow-y-auto p-1 divide-y", variant === 'dark' ? "divide-white/5" : "divide-slate-50")}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "w-full px-3 py-2 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer text-xs",
                      isSelected
                        ? "bg-[#C89445]/20 text-[#C89445] font-bold"
                        : variant === 'dark'
                          ? "hover:bg-white/10 text-slate-200 font-medium"
                          : "hover:bg-slate-50 text-slate-700 font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon}
                      <div>
                        <span className="block truncate">{opt.label}</span>
                        {opt.subtitle && (
                          <span className={cn("text-[10px] block font-normal", variant === 'dark' ? "text-slate-400" : "text-slate-400")}>
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C89445] shrink-0 ml-2" />}
                  </button>
                )
              })
            ) : (
              <div className={cn("p-4 text-center text-xs", variant === 'dark' ? "text-slate-400" : "text-slate-400")}>
                Tidak ada opsi yang cocok
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
