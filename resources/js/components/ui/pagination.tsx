import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
  showPerPage?: boolean
}

export function Pagination({
  currentPage = 1,
  lastPage = 1,
  total = 0,
  from,
  to,
  perPage = 10,
  perPageOptions = [10, 25, 50, 100],
  onPageChange,
  onPerPageChange,
  itemLabel = "data",
  className,
  showPerPage = true,
}: PaginationProps) {
  // Generate visible page numbers (smart window around current page, max 5 visible)
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5

    if (lastPage <= maxVisible) {
      for (let i = 1; i <= Math.max(1, lastPage); i++) {
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
  const displayFrom = total === 0 ? 0 : (from ?? (currentPage - 1) * perPage + 1)
  const displayTo = total === 0 ? 0 : (to ?? Math.min(currentPage * perPage, total))

  return (
    <div
      className={cn(
        "px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500",
        className
      )}
    >
      {/* Left: Range Info */}
      <div>
        Menampilkan {displayFrom} - {displayTo} dari {total} {itemLabel}
      </div>

      {/* Right: Per Page Dropdown & Pagination Buttons */}
      <div className="flex items-center gap-3">
        {/* Per Page Dropdown */}
        {showPerPage && onPerPageChange && (
          <div className="relative">
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {perPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per halaman
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1">
          {/* Prev Button */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((pg) => {
            const isCurrent = pg === currentPage
            return (
              <button
                key={pg}
                type="button"
                onClick={() => onPageChange(pg)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center",
                  isCurrent
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                {pg}
              </button>
            )
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage >= lastPage}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
