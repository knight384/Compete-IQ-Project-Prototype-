import * as React from "react"
import { cn } from "@/lib/utils"

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "error" | "warning" | "success" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-on-surface",
      {
        "bg-surface-container border-surface-variant text-on-surface": variant === "default",
        "border-error/50 bg-error/10 text-error [&>svg]:text-error": variant === "error",
        "border-secondary/50 bg-secondary/10 text-secondary [&>svg]:text-secondary": variant === "warning",
        "border-tertiary-container/50 bg-tertiary-container/10 text-tertiary-container [&>svg]:text-tertiary-container": variant === "success",
      },
      className
    )}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 text-label-md font-label-md leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-body-sm font-body-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
