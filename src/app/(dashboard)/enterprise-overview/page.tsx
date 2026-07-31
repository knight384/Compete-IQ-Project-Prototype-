"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { KPICard, DashboardCard } from "@/components/shared/DashboardCards"
import { ENTERPRISE_METRICS } from "@/lib/mockData/specialized"

export default function EnterpriseOverviewPage() {
  return (
    <>
      <PageHeader 
        title="Intelligent Enterprise Overview" 
        description="High-level systemic view of your enterprise's competitive posture."
        className="mb-8"
      >
        <Button variant="primary" className="gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">download</span> Download Brief
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        {ENTERPRISE_METRICS.map(metric => (
          <KPICard
            key={metric.id}
            title={metric.label}
            value={metric.value}
            icon="analytics"
            iconClassName={metric.isPositive ? "text-primary text-xl" : "text-secondary text-xl"}
            trend={{ value: metric.trend, label: "", isPositive: metric.isPositive, isNeutral: metric.isNeutral }}
            className="shadow-ambient-1 border-surface-container-highest"
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-8">
        <div className="lg:col-span-8">
           <DashboardCard title="Global Market Map" className="shadow-ambient-1 border-surface-container-highest h-96">
             <div className="flex items-center justify-center h-full w-full bg-surface-container-low/50 rounded-lg border border-dashed border-outline-variant">
               <span className="text-on-surface-variant font-label-md">Interactive Map Visualization Placeholder</span>
             </div>
           </DashboardCard>
        </div>
        <div className="lg:col-span-4">
           <DashboardCard title="Strategic Recommendations" className="shadow-ambient-1 border-surface-container-highest h-96">
              <div className="space-y-4">
                <div className="p-3 bg-primary-container/10 border border-primary/20 rounded-lg">
                  <h4 className="font-label-md text-primary mb-1">Increase APJ Region Investment</h4>
                  <p className="font-body-sm text-on-surface-variant">Competitor momentum is slowing in Asia-Pacific. Recommend increasing ad spend.</p>
                </div>
                <div className="p-3 bg-secondary-container/10 border border-secondary/20 rounded-lg">
                  <h4 className="font-label-md text-secondary mb-1">Pricing Tier Realignment</h4>
                  <p className="font-body-sm text-on-surface-variant">Mid-market tier is currently 15% above market average.</p>
                </div>
              </div>
           </DashboardCard>
        </div>
      </div>
    </>
  );
}
