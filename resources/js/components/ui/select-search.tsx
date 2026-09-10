import { Search, ChevronDown, Check, X, Loader2 } from "lucide-react"
import * as React from "react"
import { createPortal } from "react-dom"
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

interface PopupPosition {
  top?: number
  bottom?: number
  left: number
  width: number
  maxHeight: number
  isUpward: boolean
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
  const [position, setPosition] = React.useState<PopupPosition | null>(null)

  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const popupRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
return options
}

    const query = searchQuery.toLowerCase()

    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(query))
    )
  }, [options, searchQuery])

  // Calculate coordinates relative to viewport
  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) {
return
}

    const rect = triggerRef.current.getBoundingClientRect()

    if (rect.width === 0 && rect.height === 0) {
return
}

    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const spaceBelow = viewportHeight - rect.bottom - 10
    const spaceAbove = rect.top - 10
    const minDesiredHeight = 220
    const isUpward = spaceBelow < minDesiredHeight && spaceAbove > spaceBelow
    const maxHeight = Math.min(320, Math.max(160, isUpward ? spaceAbove : spaceBelow))

    // Ensure left position doesn't overflow screen horizontally
    let left = rect.left
    const width = rect.width

    if (left + width > viewportWidth - 10) {
      left = Math.max(10, viewportWidth - width - 10)
    }

    if (isUpward) {
      setPosition({
        bottom: viewportHeight - rect.top + 6,
        left,
        width,
        maxHeight,
        isUpward: true,
      })
    } else {
      setPosition({
        top: rect.bottom + 6,
        left,
        width,
        maxHeight,
        isUpward: false,
      })
    }
  }, [])

  // Update position on open, scroll, or resize
  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleScrollOrResize = () => {
      updatePosition()
    }

    window.addEventListener("scroll", handleScrollOrResize, true)
    window.addEventListener("resize", handleScrollOrResize)

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true)
      window.removeEventListener("resize", handleScrollOrResize)
    }
  }, [isOpen, updatePosition])

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Click outside and escape key handling
  React.useEffect(() => {
    if (!isOpen) {
return
}

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      if (triggerRef.current && triggerRef.current.contains(target)) {
        return
      }

      if (popupRef.current && popupRef.current.contains(target)) {
        return
      }

      setIsOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
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

  const handleToggle = () => {
    if (disabled || isLoading) {
      return
    }

    if (!isOpen) {
      updatePosition()
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("relative w-full text-xs space-y-1.5", className)}>
      {label && (
        <label
          className={cn(
            "block font-semibold text-xs flex items-center justify-between",
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
        ref={triggerRef}
        type="button"
        disabled={disabled || isLoading}
        onClick={handleToggle}
        className={cn(
          "w-full h-[42px] px-3.5 rounded-xl text-left flex items-center justify-between transition-all duration-150 outline-hidden cursor-pointer",
          variant === 'dark'
            ? "bg-black/30 border border-white/10 text-white focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20"
            : "bg-white border border-slate-200 text-slate-900 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20",
          isOpen && "border-[#4F46E5] ring-2 ring-indigo-500/20 shadow-xs",
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
            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
              {selectedOption.icon}
              <span className={cn("font-bold text-xs truncate", variant === 'dark' ? "text-white" : "text-slate-900")}>
                {selectedOption.label}
              </span>
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

      {/* Dropdown Popup using Portal to document.body */}
      {isOpen && position && typeof document !== "undefined" && createPortal(
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            top: position.top !== undefined ? `${position.top}px` : undefined,
            bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 99999,
          }}
          className={cn(
            "rounded-2xl shadow-2xl overflow-hidden animate-in duration-100 border",
            position.isUpward
              ? "slide-in-from-bottom-2 fade-in-50 zoom-in-95"
              : "slide-in-from-top-2 fade-in-50 zoom-in-95",
            variant === 'dark'
              ? "bg-[#1C132E] border-white/15 text-white shadow-black/80"
              : "bg-white border-slate-200 text-slate-900 shadow-xl"
          )}
        >
          {/* Search Input Box inside Dropdown */}
          <div className={cn("p-2 border-b", variant === 'dark' ? "border-white/10 bg-black/40" : "border-slate-100 bg-slate-50/70")}>
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
          <div
            style={{ maxHeight: `${Math.max(120, position.maxHeight - 65)}px` }}
            className={cn("overflow-y-auto p-1 divide-y", variant === 'dark' ? "divide-white/5" : "divide-slate-50")}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer text-xs",
                      isSelected
                        ? "bg-[#C89445]/20 text-[#C89445] font-bold"
                        : variant === 'dark'
                          ? "hover:bg-white/10 text-slate-200 font-medium"
                          : "hover:bg-slate-50 text-slate-700 font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                      {opt.icon}
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-xs">{opt.label}</span>
                        {opt.subtitle && (
                          <span className={cn("text-[11px] block font-normal truncate mt-0.5", variant === 'dark' ? "text-slate-400" : "text-slate-500")}>
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
        </div>,
        document.body
      )}
    </div>
  )
}
