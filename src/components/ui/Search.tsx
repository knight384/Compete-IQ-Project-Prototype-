import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/Input"

export interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, wrapperClassName, ...props }, ref) => {
    return (
      <div className={cn("relative group flex-1 max-w-md", wrapperClassName)}>
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <Input
          type="search"
          className={cn("pl-10", className)}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Search.displayName = "Search"

export { Search }
