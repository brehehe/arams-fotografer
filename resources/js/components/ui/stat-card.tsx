import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type StatCardColor = 'purple' | 'green' | 'amber' | 'blue' | 'rose' | 'slate' | 'teal'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon | React.ReactNode
  color?: StatCardColor
  tooltip?: string
  trend?: {
    value: string
    isPositive?: boolean
  }
}

const colorStyles: Record<
  StatCardColor,
  {
    iconBg: string
    iconColor: string
    badgeBg?: string
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
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  tooltip,
  trend,
  className,
  ...props
}: StatCardProps) {
  const styles = colorStyles[color] || colorStyles.blue

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon
    }
    const IconComponent = icon as LucideIcon
    return <IconComponent className="w-4 h-4" />
  }

  const valueStr = String(value)
  const isLongValue = valueStr.length > 8

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-2.5 sm:gap-3 transition-all duration-200 hover:shadow-sm hover:border-slate-300/80 min-w-0 group cursor-default",
        className
      )}
      title={tooltip || (typeof value === "string" ? value : undefined)}
      {...props}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-xl flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs group-hover:scale-105 transition-transform",
          styles.iconBg
        )}
      >
        {renderIcon()}
      </div>

      {/* Stats Content */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <span className="text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-800 stat-card-title block whitespace-nowrap leading-tight truncate">
          {title}
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span
            className={cn(
              "font-extrabold font-mono text-slate-900 tracking-tight block whitespace-nowrap",
              isLongValue
                ? "text-[13px] sm:text-[14px]"
                : "text-[15px] sm:text-base"
            )}
          >
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-[8.5px] font-semibold px-1.5 py-0.5 rounded-md shrink-0",
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
          <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium block truncate mt-0.5 leading-tight">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
