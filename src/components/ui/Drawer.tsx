import * as React from "react"
import { cn } from "@/lib/utils"

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-surface-variant/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={cn("flex-1", side === "right" ? "order-1" : "order-2")} onClick={onClose} />
      
      <div 
        className={cn(
          "bg-surface-container-lowest shadow-ambient-1 border-surface-variant h-full w-full max-w-md flex flex-col animate-in slide-in-from-right duration-300",
          side === "right" ? "order-2 border-l" : "order-1 border-r slide-in-from-left",
          className
        )}
        role="dialog"
      >
        <div className="flex justify-between items-center p-6 border-b border-surface-variant">
          <h2 className="text-headline-md font-headline-md text-on-surface">{title}</h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
