import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-colors overflow-hidden border",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white shadow-xs",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-700",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-700",
        outline:
          "border-slate-300 text-slate-700 bg-white",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700",
        info:
          "border-blue-200 bg-blue-50 text-blue-700",
        purple:
          "border-purple-200 bg-purple-50 text-purple-700",
        teal:
          "border-teal-200 bg-teal-50 text-teal-700",
        active:
          "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold",
        completed:
          "border-blue-200 bg-blue-50 text-blue-700 font-bold",
        pending:
          "border-amber-200 bg-amber-50 text-amber-700 font-bold",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  dot = false,
  withDot = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; dot?: boolean; withDot?: boolean }) {
  const Comp = asChild ? Slot : "span"
  const hasDot = dot || withDot

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {hasDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "success" || variant === "active"
              ? "bg-emerald-500"
              : variant === "info" || variant === "completed"
              ? "bg-blue-500"
              : variant === "warning" || variant === "pending"
              ? "bg-amber-500"
              : variant === "destructive"
              ? "bg-rose-500"
              : "bg-slate-400"
          )}
        />
      )}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
