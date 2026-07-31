"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { DashboardCard } from "@/components/shared/DashboardCards"

export default function CompetitorComparePage() {
  return (
    <>
      {/* Page Header & Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-gutter">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Competitor Comparison Workspace</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Analyze feature parity, market sentiment, and AI capabilities across selected competitors to identify strategic advantages.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-outline-variant gap-2 text-on-surface">
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share View
          </Button>
          <Button variant="primary" className="gap-2">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export Comparison (PDF)
          </Button>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="bg-surface-container-lowest rounded-card shadow-ambient-1 mb-gutter flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-4 border border-surface-container-highest">
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
          <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Compare:</span>
          <div className="flex flex-nowrap gap-2 min-w-max">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-primary rounded-full font-label-sm text-label-sm">
              CompetIQ
              <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-white/80">close</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container-high text-on-surface rounded-full border border-outline-variant font-label-sm text-label-sm">
              Synthetix AI
              <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error">close</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container-high text-on-surface rounded-full border border-outline-variant font-label-sm text-label-sm">
              ApexCorp
              <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error">close</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container-high text-on-surface rounded-full border border-outline-variant font-label-sm text-label-sm border-dashed text-on-surface-variant cursor-pointer hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Competitor
            </span>
          </div>
        </div>
        <div className="flex overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar gap-2">
          <button className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm whitespace-nowrap hover:bg-surface-container-high transition-colors">Pricing</button>
          <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-label-sm text-label-sm font-semibold whitespace-nowrap border-b-2 border-primary">Features</button>
          <button className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm whitespace-nowrap hover:bg-surface-container-high transition-colors">Reviews</button>
          <button className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm whitespace-nowrap hover:bg-surface-container-high transition-colors">Sentiment</button>
          <button className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm whitespace-nowrap hover:bg-surface-container-high transition-colors">AI Capability</button>
        </div>
      </div>

      {/* Top Section: Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter mb-gutter">
        {/* AI Strategy Summary */}
        <div className="xl:col-span-4 flex flex-col gap-gutter">
          <DashboardCard title="AI Strategy Summary" titleIcon={<span className="material-symbols-outlined text-primary">auto_awesome</span>} className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low border-l-4 border-l-primary border-y border-r border-surface-container-highest shadow-ambient-1">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 leading-relaxed">
              Synthetix AI is prioritizing natural language queries for unstructured data, while ApexCorp focuses on automated data pipeline integrations. Both competitors lack robust predictive modeling in their base tier. This represents a critical whitespace for CompetIQ's mid-market strategy.
            </p>
            <div className="space-y-4">
              <div className="bg-surface p-3 rounded-lg border border-outline-variant flex gap-3 items-start">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                <div>
                  <h4 className="font-label-sm text-label-sm text-on-surface mb-1">CompetIQ Advantage</h4>
                  <p className="text-[12px] text-on-surface-variant">Superior predictive modeling across all tiers.</p>
                </div>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-outline-variant flex gap-3 items-start">
                <span className="material-symbols-outlined text-error">warning</span>
                <div>
                  <h4 className="font-label-sm text-label-sm text-on-surface mb-1">Vulnerability</h4>
                  <p className="text-[12px] text-on-surface-variant">ApexCorp onboarding is 40% faster. Requires immediate UX review.</p>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
        
        <div className="xl:col-span-8">
           <DashboardCard title="Feature Parity Matrix" className="h-full border-surface-container-highest shadow-ambient-1 p-0 overflow-hidden text-sm">
             <div className="overflow-x-auto p-0 m-0">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-surface/50 text-label-sm text-on-surface-variant border-b border-outline-variant">
                     <th className="p-4 font-semibold">Feature Category</th>
                     <th className="p-4 font-semibold text-center bg-primary/5 text-primary border-x border-primary/20">CompetIQ</th>
                     <th className="p-4 font-semibold text-center">Synthetix AI</th>
                     <th className="p-4 font-semibold text-center">ApexCorp</th>
                   </tr>
                 </thead>
                 <tbody className="text-body-sm">
                   {/* Row Group 1 */}
                   <tr className="bg-surface-container-low border-b border-outline-variant">
                     <td colSpan={4} className="px-4 py-2 font-label-sm text-on-surface font-semibold">Data Integration</td>
                   </tr>
                   <tr className="border-b border-outline-variant hover:bg-surface/50">
                     <td className="p-4 pl-8">API Access (REST)</td>
                     <td className="p-4 text-center bg-primary/5 border-x border-primary/20"><span className="material-symbols-outlined text-tertiary">check_circle</span></td>
                     <td className="p-4 text-center"><span className="material-symbols-outlined text-tertiary">check_circle</span></td>
                     <td className="p-4 text-center"><span className="material-symbols-outlined text-tertiary">check_circle</span></td>
                   </tr>
                   <tr className="border-b border-outline-variant hover:bg-surface/50">
                     <td className="p-4 pl-8">Real-time Webhooks</td>
                     <td className="p-4 text-center bg-primary/5 border-x border-primary/20"><span className="material-symbols-outlined text-tertiary">check_circle</span></td>
                     <td className="p-4 text-center"><span className="material-symbols-outlined text-outline-variant">cancel</span></td>
                     <td className="p-4 text-center"><span className="material-symbols-outlined text-tertiary">check_circle</span></td>
                   </tr>
                   {/* Row Group 2 */}
                   <tr className="bg-surface-container-low border-b border-outline-variant">
                     <td colSpan={4} className="px-4 py-2 font-label-sm text-on-surface font-semibold">AI Capabilities</td>
                   </tr>
                   <tr className="border-b border-outline-variant hover:bg-surface/50">
                     <td className="p-4 pl-8">Predictive Forecasting</td>
                     <td className="p-4 text-center bg-primary/5 border-x border-primary/20"><span className="material-symbols-outlined text-tertiary">check_circle</span></td>
                     <td className="p-4 text-center"><span className="material-symbols-outlined text-outline-variant">cancel</span></td>
                     <td className="p-4 text-center"><span className="material-symbols-outlined text-outline-variant">cancel</span></td>
                   </tr>
                   <tr className="border-b border-outline-variant hover:bg-surface/50">
                     <td className="p-4 pl-8">Sentiment Analysis</td>
                     <td className="p-4 text-center bg-primary/5 border-x border-primary/20"><span className="material-symbols-outlined text-tertiary">check_circle</span></td>
                     <td className="p-4 text-center"><span className="material-symbols-outlined text-tertiary">check_circle</span></td>
                     <td className="p-4 text-center"><span className="material-symbols-outlined text-outline-variant">cancel</span></td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </DashboardCard>
        </div>
      </div>
    </>
  );
}
