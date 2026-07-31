import * as React from "react"
import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export function LoadingState({ title = "Loading...", description }: { title?: string, description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <LoadingSpinner className="mb-4" />
      <h3 className="text-headline-sm font-headline-sm text-on-surface">{title}</h3>
      {description && <p className="text-body-sm font-body-sm text-on-surface-variant mt-2 max-w-md">{description}</p>}
    </div>
  );
}

export function EmptyState({ 
  icon = "inbox", 
  title, 
  description, 
  action 
}: { 
  icon?: string; 
  title: string; 
  description?: string; 
  action?: React.ReactNode 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-outline-variant/50 rounded-card bg-surface-container-lowest/50">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">{title}</h3>
      {description && <p className="text-body-sm font-body-sm text-on-surface-variant max-w-md mb-6">{description}</p>}
      {action}
    </div>
  );
}
