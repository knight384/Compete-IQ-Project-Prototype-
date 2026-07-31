import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-variant/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className={cn("bg-surface-container-lowest rounded-[20px] shadow-ambient-1 border border-surface-variant w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200", className)}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-start p-6 border-b border-surface-variant">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface">{title}</h2>
            {description && <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">{description}</p>}
          </div>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        {children && <div className="p-6">{children}</div>}
        
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-variant bg-surface-container-lowest/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
