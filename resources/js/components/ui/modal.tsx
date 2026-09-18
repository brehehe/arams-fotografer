import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "full"
  className?: string
  bodyClassName?: string
  closeOnOverlayClick?: boolean
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  fullPage?: boolean
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  full: "max-w-full m-4",
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = "xl",
  className,
  bodyClassName,
  closeOnOverlayClick = true,
  onSubmit,
  fullPage = false,
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  if (fullPage) {
    const fullPageContent = (
      <>
        {/* Scrollable Body with comfortable max width container */}
        <div className={cn("flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 md:p-8 overscroll-contain text-xs", bodyClassName)}>
          <div className="max-w-full mx-auto w-full">
            {children}
          </div>
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="border-t border-slate-200/90 bg-white px-5 sm:px-8 py-3.5 sm:py-4 shrink-0 shadow-xs z-10">
            <div className="max-w-full mx-auto w-full">
              {footer}
            </div>
          </div>
        )}
      </>
    )

    return (
      <div
        className={cn(
          "fixed inset-0 z-50 bg-white flex flex-col overflow-hidden animate-in fade-in duration-150",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Fixed Header */}
        {(title || subtitle || icon) && (
          <div className="px-5 sm:px-8 py-4 border-b border-slate-200/90 bg-white flex items-center justify-between shrink-0 shadow-2xs z-10">
            <div className="max-w-full mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {icon && (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs shrink-0 bg-slate-100 text-slate-700">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  {title && (
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-tight truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-4"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Form Wrap if onSubmit is provided, otherwise direct body */}
        {onSubmit ? (
          <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {fullPageContent}
          </form>
        ) : (
          fullPageContent
        )}
      </div>
    )
  }

  const mainBodyAndFooter = (
    <>
      {/* Scrollable Body */}
      <div className={cn("p-5 sm:p-6 overflow-y-auto flex-1 text-xs space-y-4 overscroll-contain", bodyClassName)}>
        {children}
      </div>

      {/* Fixed Footer */}
      {footer && (
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0">
          {footer}
        </div>
      )}
    </>
  )

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150 overflow-y-auto">
      {/* Backdrop click */}
      <div
        className="fixed inset-0"
        onClick={() => closeOnOverlayClick && onClose()}
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          "relative bg-white w-full max-h-[90vh] sm:max-h-[88vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 z-10 my-auto",
          maxWidthMap[maxWidth] || maxWidthMap.xl,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Fixed Header */}
        {(title || subtitle || icon) && (
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Wrap if onSubmit is provided, otherwise direct body */}
        {onSubmit ? (
          <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {mainBodyAndFooter}
          </form>
        ) : (
          mainBodyAndFooter
        )}
      </div>
    </div>
  )
}
