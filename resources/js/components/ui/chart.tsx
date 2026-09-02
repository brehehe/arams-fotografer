import * as React from "react"
import { cn } from "@/lib/utils"
import { formatRupiah, formatRupiahCompact, formatNumberCompact } from "@/lib/formatters"

// =============================================================================
// BAR CHART COMPONENT
// =============================================================================

export interface BarChartItem {
  month?: string
  label?: string
  revenue?: number
  value?: number
  target?: number
  color?: string
}

export interface BarChartProps {
  data: BarChartItem[]
  height?: number | string
  maxValue?: number
  valueFormatter?: (val: number) => string
  barColor?: string
  barHoverColor?: string
  activeMonth?: string
  onBarClick?: (item: BarChartItem) => void
  showGridLines?: boolean
  showYAxis?: boolean
  className?: string
}

export function BarChart({
  data = [],
  height = 300,
  maxValue,
  valueFormatter = (val) => formatRupiahCompact(val),
  barColor = "#E8630A",
  barHoverColor = "#C85308",
  activeMonth,
  onBarClick,
  showGridLines = true,
  showYAxis = true,
  className,
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  // Calculate maximum value if not provided
  const computedMax = React.useMemo(() => {
    if (maxValue) return maxValue
    const highest = Math.max(...data.map((d) => d.revenue ?? d.value ?? 0), 1000000)
    return Math.ceil(highest * 1.15)
  }, [data, maxValue])

  const yTicks = [
    computedMax,
    computedMax * 0.75,
    computedMax * 0.5,
    computedMax * 0.25,
    0,
  ]

  const heightStyle = typeof height === 'number'
    ? { height: `${height}px`, minHeight: `${height}px` }
    : typeof height === 'string'
    ? { height, minHeight: '260px' }
    : { minHeight: '260px' }

  return (
    <div className={cn("relative w-full h-full flex flex-col text-xs select-none", className)}>
      <div className="flex flex-1 w-full h-full" style={heightStyle}>
        {/* Y-Axis Labels */}
        {showYAxis && (
          <div className="w-16 sm:w-20 shrink-0 flex flex-col justify-between text-[10px] font-mono text-slate-400 pb-7 pr-3 text-right whitespace-nowrap">
            {yTicks.map((tick, idx) => (
              <span key={idx} className="truncate">
                {valueFormatter(tick)}
              </span>
            ))}
          </div>
        )}

        {/* Chart Area with Grid Lines */}
        <div className="relative flex-1 flex items-end pb-7 h-full">
          {/* Horizontal Grid Lines */}
          {showGridLines && (
            <div className="absolute inset-0 pb-7 flex flex-col justify-between pointer-events-none">
              {yTicks.map((_, idx) => (
                <div
                  key={idx}
                  className="w-full border-b border-dashed border-slate-200/80"
                />
              ))}
            </div>
          )}

          {/* Bar Columns */}
          <div className="relative w-full h-full flex items-end justify-between gap-1 sm:gap-2.5 z-10 px-1">
            {data.map((item, idx) => {
              const val = item.revenue ?? item.value ?? 0
              const label = item.month ?? item.label ?? `M${idx + 1}`
              const barHeightPct = Math.min(100, Math.max(5, (val / computedMax) * 100))
              const isHovered = hoveredIndex === idx
              const isActive = activeMonth === label

              return (
                <div
                  key={idx}
                  className="flex-1 h-full flex flex-col items-center justify-end relative group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onBarClick && onBarClick(item)}
                >
                  {/* Floating Value Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-9 z-30 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                      <span>{formatRupiah(val)}</span>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                  )}

                  {/* The Bar */}
                  <div
                    className={cn(
                      "w-full max-w-[44px] rounded-t-xl transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "ring-2 ring-slate-900 shadow-md"
                        : "hover:opacity-90 shadow-2xs"
                    )}
                    style={{
                      height: `${barHeightPct}%`,
                      backgroundColor: item.color || (isHovered ? barHoverColor : barColor),
                    }}
                  >
                    {/* Subtle Gradient Highlight */}
                    <div className="absolute inset-x-0 top-0 h-2 bg-white/30" />
                  </div>

                  {/* X-Axis Label below bar */}
                  <span
                    className={cn(
                      "absolute -bottom-5 text-[10px] font-semibold transition-colors truncate max-w-full text-center",
                      isActive || isHovered
                        ? "text-slate-900 font-bold"
                        : "text-slate-500"
                    )}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// DONUT CHART COMPONENT
// =============================================================================

export interface DonutChartItem {
  label: string
  value: number
  color: string
  count?: number
}

export interface DonutChartProps {
  data: DonutChartItem[]
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerValue?: string | number
  className?: string
  showLegend?: boolean
  layout?: "vertical" | "horizontal"
}

export function DonutChart({
  data = [],
  size = 160,
  strokeWidth = 22,
  centerLabel = "TOTAL PROJECT",
  centerValue,
  className,
  showLegend = true,
  layout = "vertical",
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const totalValue = React.useMemo(() => {
    return data.reduce((acc, item) => acc + (item.value || 0), 0) || 1
  }, [data])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate stroke dash offsets for each slice
  let accumulatedPercent = 0
  const slices = data.map((item, idx) => {
    const percent = item.value / totalValue
    const strokeDasharray = `${percent * circumference} ${circumference}`
    const strokeDashoffset = -accumulatedPercent * circumference
    accumulatedPercent += percent

    return {
      ...item,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
      idx,
    }
  })

  const isVertical = layout === "vertical"

  return (
    <div
      className={cn(
        isVertical
          ? "flex flex-col items-center w-full gap-5"
          : "flex flex-col sm:flex-row items-center gap-6",
        className
      )}
    >
      {/* SVG Donut Circle - Centered at Top */}
      <div className="relative shrink-0 flex items-center justify-center py-1">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.idx
            return (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(slice.idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
          {hoveredIndex !== null ? (
            <>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate max-w-[84px]">
                {data[hoveredIndex]?.label}
              </span>
              <span className="text-sm font-extrabold font-mono text-slate-900 block leading-tight mt-0.5">
                {slices[hoveredIndex]?.percent}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                {centerLabel}
              </span>
              <span className="text-xl font-black font-mono text-slate-900 block leading-tight mt-0.5">
                {centerValue ?? totalValue}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend List - Neatly structured Below */}
      {showLegend && (
        <div className="w-full space-y-1.5 text-xs divide-y divide-slate-100/80 pt-1">
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.idx
            return (
              <div
                key={slice.label}
                className={cn(
                  "flex items-center justify-between pt-2 pb-0.5 transition-colors cursor-pointer rounded-xl px-2.5 -mx-2.5",
                  isHovered ? "bg-slate-50 font-bold" : "text-slate-700 hover:bg-slate-50/50"
                )}
                onMouseEnter={() => setHoveredIndex(slice.idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-2xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate text-xs font-medium text-slate-800">{slice.label}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {slice.count ?? slice.value}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 font-mono w-9 text-right">
                    {slice.percent}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
