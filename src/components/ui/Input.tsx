import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg bg-surface-container-lowest border border-surface-variant px-3 py-2 text-body-sm font-body-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant focus-visible:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
