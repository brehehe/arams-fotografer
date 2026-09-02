import * as React from "react"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs text-left border-collapse whitespace-nowrap", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-xs whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0 divide-y divide-slate-100", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-slate-50/75 font-semibold text-slate-700 border-t border-slate-200/80 whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  selected,
  ...props
}: React.ComponentProps<"tr"> & { selected?: boolean }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50/70 data-[state=selected]:bg-[#C89445]/5",
        selected && "bg-amber-50/50 hover:bg-amber-50/70",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-9 px-3.5 text-left align-middle font-bold text-slate-600 tracking-wider select-none whitespace-nowrap [&:has([role=checkbox])]:pr-0 text-[11px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3.5 py-2.5 align-middle text-slate-800 whitespace-nowrap [&:has([role=checkbox])]:pr-0 leading-normal",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-3 text-xs text-slate-400 italic", className)}
      {...props}
    />
  )
}

function TableEmpty({
  colSpan,
  message = "Tidak ada data yang ditemukan",
  description = "Coba ubah kata kunci pencarian atau reset filter yang dipilih.",
  icon,
}: {
  colSpan: number
  message?: string
  description?: string
  icon?: React.ReactNode
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 px-4">
        <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5">
          {icon ? (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-0.5">
              {icon}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-0.5">
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          )}
          <span className="text-xs font-bold text-slate-700">{message}</span>
          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">{description}</p>
        </div>
      </td>
    </tr>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
}
