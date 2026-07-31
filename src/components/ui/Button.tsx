import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-label-md font-label-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          {
            "bg-primary text-on-primary hover:bg-primary-container shadow-sm": variant === "primary",
            "bg-secondary-container/10 text-primary hover:bg-secondary-container/20": variant === "secondary",
            "border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface shadow-sm": variant === "outline",
            "hover:bg-surface-variant/50 text-on-surface-variant": variant === "ghost",
            "text-error hover:text-on-error-container hover:bg-error/10": variant === "destructive",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 py-2 px-4": size === "default",
            "h-12 px-8": size === "lg",
            "h-10 w-10 p-2": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
