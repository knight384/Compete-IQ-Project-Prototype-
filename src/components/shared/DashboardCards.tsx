import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/Card"

interface KPICardProps {
  title: string;
  value: React.ReactNode;
  icon: string;
  iconClassName?: string;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    isNegative?: boolean;
  };
  className?: string;
}

export function KPICard({ title, value, icon, iconClassName, trend, className }: KPICardProps) {
  return (
    <Card className={cn("p-6 flex flex-col justify-between h-full", className)}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-label-md font-label-md text-on-surface-variant">{title}</span>
        <div className={cn("p-2 rounded-lg", iconClassName || "bg-primary/10 text-primary")}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
      </div>
      <div>
        <div className="text-headline-lg font-headline-lg text-on-surface flex items-baseline gap-2">
          {value}
          {trend && (
            <span className={cn(
              "text-label-sm font-label-sm flex items-center px-2 py-0.5 rounded-full",
              {
                "text-tertiary bg-tertiary/10": trend.isPositive,
                "text-error bg-error/10": trend.isNegative,
                "text-outline bg-surface-variant/50": trend.isNeutral,
              }
            )}>
              {trend.isPositive && <span className="material-symbols-outlined text-[14px]">arrow_upward</span>}
              {trend.isNegative && <span className="material-symbols-outlined text-[14px]">arrow_downward</span>}
              {trend.value}
            </span>
          )}
        </div>
        {trend?.label && (
          <p className="text-label-sm font-label-sm text-outline mt-1">{trend.label}</p>
        )}
      </div>
    </Card>
  );
}

export function DashboardCard({ title, titleIcon, action, children, className }: { title: string, titleIcon?: React.ReactNode, action?: React.ReactNode, children: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {titleIcon}
          <h3 className="text-headline-sm font-headline-sm text-on-surface">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
