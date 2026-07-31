import * as React from "react"
import { cn } from "@/lib/utils"

export function PageContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <main className={cn("flex-1 p-4 md:p-margin-page max-w-container-max mx-auto w-full flex flex-col gap-stack-lg", className)}>
      {children}
    </main>
  );
}

export function PageHeader({ 
  title, 
  description, 
  children,
  className 
}: { 
  title: React.ReactNode; 
  description?: React.ReactNode; 
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
      <div>
        <h2 className="text-headline-lg font-headline-lg text-on-surface">{title}</h2>
        {description && (
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
