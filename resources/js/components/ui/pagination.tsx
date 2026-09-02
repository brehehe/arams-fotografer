import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PaginationProps {
  currentPage: number
  lastPage: number
  total: number
  from?: number
  to?: number
  perPage?: number
  perPageOptions?: number[]
  onPageChange: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  itemLabel?: string
  className?: string
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  from = 0,
  to = 0,
  perPage = 10,
  perPageOptions = [10, 25, 50, 100],
  onPageChange,
  onPerPageChange,
  itemLabel = "klien",
  className,
}: PaginationProps) {
  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (lastPage <= maxVisible) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i)
      }
    } else {
      let start = Math.max(1, currentPage - 2)
      let end = Math.min(lastPage, start + maxVisible - 1)

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (total === 0) return null

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-slate-500",
        className
      )}
    >
      {/* Left: Range Info */}
      <div className="font-medium text-slate-600">
        Menampilkan{" "}
        <span className="font-bold text-slate-900 font-mono">
          {from || (currentPage - 1) * perPage + 1}
        </span>{" "}
        -{" "}
        <span className="font-bold text-slate-900 font-mono">
          {to || Math.min(currentPage * perPage, total)}
        </span>{" "}
        dari{" "}
        <span className="font-bold text-slate-900 font-mono">{total}</span> {itemLabel}
      </div>

      {/* Right: Rows per page & Navigation Buttons */}
      <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
        {/* Rows per page selector */}
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Rows per page</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-hidden focus:border-[#E8630A] transition-colors cursor-pointer shadow-2xs"
            >
              {perPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Prev Page */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Numbered Pages */}
          {pageNumbers.map((p, idx) => {
            const isCurrent = p === currentPage
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs flex items-center justify-center",
                  isCurrent
                    ? "bg-primary-accent text-white border-primary-accent shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                {p}
              </button>
            )
          })}

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage >= lastPage}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={currentPage >= lastPage}
            onClick={() => onPageChange(lastPage)}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
