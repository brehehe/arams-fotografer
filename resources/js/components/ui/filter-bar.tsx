import * as React from "react"
import { Search, RotateCcw, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterSelectConfig {
  key: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

export interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterSelectConfig[]
  onReset?: () => void
  onToggleAdvancedFilter?: () => void
  isAdvancedOpen?: boolean
  className?: string
  extraActions?: React.ReactNode
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari data...",
  filters = [],
  onReset,
  onToggleAdvancedFilter,
  isAdvancedOpen = false,
  className,
  extraActions,
}: FilterBarProps) {
  // Count active non-default filters
  const activeFilterCount = filters.filter(
    (f) => f.value && f.value !== "all" && f.value !== "Semua" && f.value !== ""
  ).length + (search.trim() ? 1 : 0)

  return (
    <div
      className={cn(
        "bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3",
        className
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-4 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all text-slate-800 placeholder:text-slate-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <Search className="w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Filter Select Dropdowns */}
      {filters.map((f) => (
        <div key={f.key} className="min-w-[130px] sm:min-w-[150px] relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {f.label}
          </label>
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className={cn(
              "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-hidden font-medium transition-all appearance-none cursor-pointer",
              "focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20",
              f.value && f.value !== "all" && f.value !== "Semua" && f.value !== ""
                ? "border-[#E8630A] text-[#E8630A] font-bold bg-[#E8630A]/5"
                : "text-slate-700"
            )}
          >
            {f.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-[26px] pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      ))}

      {/* Action Buttons: Reset & Filter */}
      <div className="flex items-center gap-2 self-end">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Reset semua filter"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        )}

        {onToggleAdvancedFilter && (
          <button
            type="button"
            onClick={onToggleAdvancedFilter}
            className={cn(
              "px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs",
              isAdvancedOpen
                ? "bg-primary-accent border-primary-accent text-white shadow-md"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span
                className={cn(
                  "w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold",
                  isAdvancedOpen ? "bg-white text-slate-900" : "bg-primary-accent text-white"
                )}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {extraActions}
      </div>
    </div>
  )
}
