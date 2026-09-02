import * as React from "react"
import { AlertTriangle, Info, CheckCircle2, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type AlertConfirmationVariant = "danger" | "warning" | "info" | "success"

export interface AlertConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: AlertConfirmationVariant
  isLoading?: boolean
  icon?: React.ReactNode
}

const variantStyles: Record<
  AlertConfirmationVariant,
  {
    iconBg: string
    iconColor: string
    confirmButton: string
    defaultIcon: React.ReactNode
  }
> = {
  danger: {
    iconBg: "bg-rose-50 border border-rose-200/70",
    iconColor: "text-rose-600",
    confirmButton: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
    defaultIcon: <XCircle className="w-6 h-6 text-rose-600" />,
  },
  warning: {
    iconBg: "bg-amber-50 border border-amber-200/70",
    iconColor: "text-amber-600",
    confirmButton: "bg-[#E8630A] hover:bg-[#D35400] text-white shadow-[#E8630A]/20",
    defaultIcon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
  },
  info: {
    iconBg: "bg-blue-50 border border-blue-200/70",
    iconColor: "text-blue-600",
    confirmButton: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
    defaultIcon: <Info className="w-6 h-6 text-blue-600" />,
  },
  success: {
    iconBg: "bg-emerald-50 border border-emerald-200/70",
    iconColor: "text-emerald-600",
    confirmButton: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
    defaultIcon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
  },
}

export function AlertConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "warning",
  isLoading = false,
  icon,
}: AlertConfirmationProps) {
  if (!isOpen) return null

  const currentVariant = variantStyles[variant] || variantStyles.warning

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon Container */}
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs",
                currentVariant.iconBg
              )}
            >
              {icon || currentVariant.defaultIcon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-7 h-7 -mt-1 -mr-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {description && (
                <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isLoading}
            className={cn(
              "px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 flex items-center gap-2",
              currentVariant.confirmButton
            )}
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
