"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { KPICard } from "@/components/shared/DashboardCards"
import { Badge } from "@/components/ui/Badge"
import { OPPORTUNITIES } from "@/lib/mockData"

export default function OpportunitiesPage() {
  return (
    <>
      <PageHeader 
        title="Opportunity Engine" 
        description="Executive strategy recommendations powered by market intelligence."
        className="mb-8"
      >
        <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface">
          <span className="material-symbols-outlined text-lg">download</span> Export Brief
        </Button>
        <Button variant="primary" className="gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">auto_awesome</span> Generate Plan
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <KPICard
          title="Opportunity Score"
          value={<>92<span className="font-body-lg text-body-lg text-on-surface-variant mb-1">/100</span></>}
          icon="radar"
          iconClassName="text-primary text-xl"
          trend={{ value: "+4 pts from last quarter", label: "", isPositive: true }}
          className="border border-outline-variant/30 shadow-ambient-1"
        />
        <KPICard
          title="Revenue Potential"
          value="$2.4M"
          icon="payments"
          iconClassName="text-secondary text-xl"
          trend={{ value: "Identified across 3 sectors", label: "", isNeutral: true }}
          className="border border-outline-variant/30 shadow-ambient-1"
        />
        <KPICard
          title="Competitive Risk"
          value={<span className="text-tertiary">Low</span>}
          icon="security"
          iconClassName="text-tertiary text-xl"
          trend={{ value: "Based on 12 key indicators", label: "", isNeutral: true }}
          className="border border-outline-variant/30 shadow-ambient-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Prioritized Opportunities</h3>
            <button className="text-primary font-label-sm text-label-sm hover:underline">View All</button>
          </div>

          {OPPORTUNITIES.map(opp => (
            <div key={opp.id} className={`bg-surface-container-lowest rounded-card p-6 border-l-4 border-l-${opp.color} border-y border-r border-outline-variant/30 shadow-ambient-1 hover:shadow-ambient-2 transition-shadow cursor-pointer`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${opp.color}/10 text-${opp.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined">{opp.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">{opp.title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{opp.type}</p>
                  </div>
                </div>
                <Badge variant={opp.priority === "P1" ? "error" : "default"} className="font-bold flex items-center gap-1">
                  {opp.priority === "P1" && <span className="material-symbols-outlined text-[14px]">priority_high</span>}
                  {opp.priority}
                </Badge>
              </div>
              <p className="font-body-md text-body-md text-on-surface mb-6">{opp.description}</p>
              
              <div className="grid grid-cols-3 gap-4 p-4 bg-surface rounded-xl border border-outline-variant/20">
                <div>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Confidence</span>
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">{opp.confidence}</span>
                </div>
                <div>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Est. ROI</span>
                  <span className="font-headline-sm text-headline-sm font-semibold text-tertiary">{opp.roi}</span>
                </div>
                <div>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Difficulty</span>
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">{opp.difficulty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest rounded-card p-6 border border-outline-variant/30 shadow-ambient-1">
             <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-4">AI Insight Engine Status</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    <span className="font-label-sm text-label-sm text-on-surface">Data Processed</span>
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold">2.4TB</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">model_training</span>
                    <span className="font-label-sm text-label-sm text-on-surface">Models Active</span>
                  </div>
                  <span className="font-label-sm text-label-sm font-semibold">12</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
