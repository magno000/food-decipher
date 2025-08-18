import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

export type ProgressVariant = "primary" | "success" | "warning" | "destructive"

interface ThemedProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: ProgressVariant
  value?: number
}

export const ThemedProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ThemedProgressProps
>(({ className, value, variant = "primary", ...props }, ref) => {
  const indicatorClass =
    variant === "success"
      ? "bg-success"
      : variant === "warning"
      ? "bg-warning"
      : variant === "destructive"
      ? "bg-destructive"
      : "bg-primary"

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all", indicatorClass)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
ThemedProgress.displayName = "ThemedProgress"
