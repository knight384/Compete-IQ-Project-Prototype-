import * as React from "react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ items, className }: { items: { label: string; href?: string }[], className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-label-sm font-label-sm text-on-surface-variant", className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <a href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </a>
            ) : (
              <span className="text-on-surface font-semibold">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span className="material-symbols-outlined text-[16px] mx-1 opacity-50">chevron_right</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
