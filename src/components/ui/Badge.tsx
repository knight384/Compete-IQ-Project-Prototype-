import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "secondary";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-surface-container-high text-on-surface": variant === "default",
          "bg-tertiary-container/10 text-tertiary-container": variant === "success",
          "bg-secondary/10 text-secondary": variant === "warning",
          "bg-error/10 text-error": variant === "error",
          "bg-secondary-fixed/20 text-primary-container border border-secondary-fixed": variant === "secondary",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
