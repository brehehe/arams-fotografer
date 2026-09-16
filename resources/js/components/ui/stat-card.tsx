import * as React from "react"
import { LucideIcon, ArrowRight } from "lucide-react"
import { Link } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { formatCurrencyShort, formatRupiah } from "@/lib/formatters"

export type StatCardColor =
  | 'purple'
  | 'green'
  | 'emerald'
  | 'amber'
  | 'blue'
  | 'rose'
  | 'slate'
  | 'teal'
  | 'indigo'
  | 'orange'
  | 'cyan'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  subtitle?: React.ReactNode
  icon: LucideIcon | React.ReactNode
  color?: StatCardColor
  tooltip?: string
  isCurrency?: boolean
  formatCompact?: boolean
  valueClassName?: string
  suffix?: React.ReactNode
  trend?: {
    value: string
    isPositive?: boolean
  }
  layout?: 'horizontal' | 'vertical'
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  footer?: React.ReactNode
}

const colorStyles: Record<
  StatCardColor,
  {
    iconBg: string
    iconColor: string
  }
> = {
  purple: {
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    iconColor: "text-purple-600",
  },
  green: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    iconColor: "text-emerald-600",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    iconColor: "text-emerald-600",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    iconColor: "text-amber-600",
  },
  blue: {
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    iconColor: "text-blue-600",
  },
  rose: {
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
    iconColor: "text-rose-600",
  },
  teal: {
    iconBg: "bg-teal-50 text-teal-600 border border-teal-100",
    iconColor: "text-teal-600",
  },
  slate: {
    iconBg: "bg-slate-50 text-slate-600 border border-slate-200",
    iconColor: "text-slate-600",
  },
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    iconColor: "text-indigo-600",
  },
  orange: {
    iconBg: "bg-orange-50 text-orange-600 border border-orange-100",
    iconColor: "text-orange-600",
  },
  cyan: {
    iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100",
    iconColor: "text-cyan-600",
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  tooltip,
  isCurrency,
  formatCompact = true,
  valueClassName,
  suffix,
  trend,
  layout,
  action,
  footer,
  className,
  ...props
}: StatCardProps) {
  const styles = colorStyles[color] || colorStyles.blue

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon
    }
    const IconComponent = icon as LucideIcon
    return <IconComponent className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
  }

  // Currency detection and compact formatting
  let isCurrencyValue = Boolean(isCurrency)
  let fullValueStr = ""
  let compactValueStr = ""

  if (typeof value === "number") {
    if (isCurrency) {
      fullValueStr = formatRupiah(value)
      compactValueStr = formatCurrencyShort(value)
    } else {
      fullValueStr = String(value)
      compactValueStr = String(value)
    }
  } else if (typeof value === "string") {
    const trimmed = value.trim()
    if (isCurrency || /^(rp|idr)/i.test(trimmed)) {
      isCurrencyValue = true
      const cleaned = trimmed.replace(/[^\d-]/g, "")
      const parsed = Number(cleaned)
      if (!isNaN(parsed) && cleaned.length > 0) {
        fullValueStr = formatRupiah(parsed)
        compactValueStr = formatCurrencyShort(parsed)
      } else {
        fullValueStr = trimmed
        compactValueStr = trimmed
      }
    } else {
      fullValueStr = trimmed
      compactValueStr = trimmed
    }
  }

  const shouldCompact = isCurrencyValue && formatCompact !== false
  const displayValue = shouldCompact ? compactValueStr : (isCurrencyValue ? fullValueStr : value)
  const fullTooltip = tooltip || (isCurrencyValue ? fullValueStr : (typeof value === "string" ? value : undefined))

  const isVertical = layout === "vertical" || Boolean(action) || Boolean(footer)

  // Sizing font nominal: agak dikecilkan agar proporsional dan tidak terpotong
  const currencyFontClass = isCurrencyValue
    ? String(displayValue).length > 10
      ? "text-sm sm:text-base"
      : "text-base sm:text-lg"
    : undefined

  if (isVertical) {
    return (
      <div
        className={cn(
          "bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-sm hover:border-slate-300/80 min-w-0 group cursor-default",
          className
        )}
        title={fullTooltip}
        {...props}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate leading-tight">
                {title}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 min-w-0">
                <span
                  className={cn(
                    "font-extrabold tracking-tight text-slate-900 block truncate font-sans",
                    isCurrencyValue
                      ? currencyFontClass
                      : "text-xl sm:text-xl",
                    valueClassName
                  )}
                  title={fullTooltip}
                >
                  {displayValue}
                </span>
                {suffix && <span className="shrink-0">{suffix}</span>}
                {trend && (
                  <span
                    className={cn(
                      "text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0",
                      trend.isPositive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    )}
                  >
                    {trend.value}
                  </span>
                )}
              </div>
              {subtitle && (
                <span className="text-[11px] text-slate-400 font-medium block truncate mt-1 leading-tight">
                  {subtitle}
                </span>
              )}
            </div>
            {/* <div
              className={cn(
                "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform",
                styles.iconBg
              )}
            >
              {renderIcon()}
            </div> */}
          </div>
        </div>

        {(action || footer) && (
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            {action && (
              action.href ? (
                <Link
                  href={action.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-primary-accent transition-colors"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={action.onClick}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-primary-accent transition-colors cursor-pointer"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            )}
            {footer}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5 sm:gap-4 transition-all duration-200 hover:shadow-sm hover:border-slate-300/80 min-w-0 group cursor-default",
        className
      )}
      title={fullTooltip}
      {...props}
    >
      {/* Icon Container */}
      {/* <div
        className={cn(
          "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform",
          styles.iconBg
        )}
      >
        {renderIcon()}
      </div> */}

      {/* Stats Content */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <span className="text-xs font-semibold text-slate-500 block truncate leading-tight">
          {title}
        </span>
        <div className="flex items-baseline gap-1.5 mt-1 min-w-0">
          <span
            className={cn(
              "font-extrabold tracking-tight text-slate-900 block truncate font-sans",
              isCurrencyValue
                ? currencyFontClass
                : "text-xl sm:text-2xl",
              valueClassName
            )}
            title={fullTooltip}
          >
            {displayValue}
          </span>
          {suffix && <span className="shrink-0">{suffix}</span>}
          {trend && (
            <span
              className={cn(
                "text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[11px] text-slate-400 font-medium block truncate mt-1 leading-tight">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
