"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { KPICard, DashboardCard } from "@/components/shared/DashboardCards"
import { Breadcrumb } from "@/components/ui/Breadcrumb"

export default function CompetitorDetailsPage({ params }: { params: { id: string } }) {
  // Mock data for the ID
  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[
          { label: "Competitors", href: "/dashboard/competitors" },
          { label: "Synthetix AI" }
        ]} />
      </div>

      {/* Profile Header */}
      <div className="bg-surface-container-lowest rounded-card p-6 shadow-ambient-1 border border-surface-container-highest mb-gutter flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-surface rounded-xl border border-outline-variant flex items-center justify-center p-2 shadow-sm">
            <img className="w-full h-full object-contain rounded-lg" alt="Synthetix AI Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBox7Zb7KgpNV0L2ebCiHdrxMlxHJWsyOwd1aQPx8OSxwpMP0aflpXXyvx65dg7ZKuxL4bf_voNWNvn7LWPyNRK13KBX9nTVOBTGpvpgBFTfHto3rMJiU1aZ4PVBLAjGFqgoW7836eTvi5mXVUIxwwX1tYBbkTWRe1EIiX-HP6D3lLJAD9kGswMjq010Ep8QyApWGvAX4LX437JViYvVhJIWDX0bkqtKx7lA2rZH_M63PCg-YlG-IQIlg"/>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">Synthetix AI</h2>
              <span className="bg-tertiary-container/10 text-tertiary text-label-sm font-label-sm px-2 py-1 rounded-full flex items-center gap-1 border border-tertiary/20">
                <span className="material-symbols-outlined text-[14px]">monitoring</span>
                Active Monitoring
              </span>
            </div>
            <div className="flex items-center gap-4 text-body-sm font-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">domain</span> Enterprise AI Solutions</span>
              <a className="flex items-center gap-1 text-primary hover:underline" href="#"><span className="material-symbols-outlined text-[16px]">language</span> synthetix.ai</a>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-primary border-outline-variant shadow-none gap-2">
            <span className="material-symbols-outlined">download</span> Report
          </Button>
          <Button variant="primary" className="gap-2 shadow-sm">
            <span className="material-symbols-outlined">add</span> Track Feature
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-gutter">
        <KPICard 
          title="Product Count"
          value="24"
          icon="inventory_2"
          iconClassName="bg-surface text-secondary"
          trend={{ value: "+2 this quarter", label: "", isPositive: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Sentiment Score"
          value={<>8.4<span className="text-headline-sm text-outline">/10</span></>}
          icon="sentiment_satisfied"
          iconClassName="bg-surface text-primary"
          trend={{ value: "-0.2 this month", label: "", isNegative: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Feature Gap"
          value={<>12<span className="text-headline-sm text-outline"> missing</span></>}
          icon="compare_arrows"
          iconClassName="bg-surface text-error"
          trend={{ value: "We lead in 5 areas", label: "", isPositive: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Pricing Index"
          value="Premium"
          icon="attach_money"
          iconClassName="bg-surface text-tertiary"
          trend={{ value: "~15% higher than market avg", label: "", isNeutral: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
      </div>

      {/* Bento Layout Content */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Main Tabbed Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Tabs */}
          <div className="border-b border-outline-variant flex gap-6 overflow-x-auto hide-scrollbar">
            <button className="pb-3 text-primary border-b-2 border-primary font-label-md text-label-md whitespace-nowrap">Overview</button>
            <button className="pb-3 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md whitespace-nowrap">Features</button>
            <button className="pb-3 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md whitespace-nowrap">Pricing</button>
            <button className="pb-3 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md whitespace-nowrap">Reviews</button>
          </div>

          {/* AI Insights Overview Card */}
          <div className="bg-surface-container-lowest rounded-card p-6 shadow-ambient-1 border border-surface-container-highest relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Executive Summary</h3>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant mb-6 relative z-10 leading-relaxed">
              Synthetix AI continues to dominate the premium tier, heavily investing in their generative text capabilities. However, recent customer reviews indicate friction in their API onboarding process. We recommend prioritizing our "One-Click Integration" marketing to capture their dissatisfied mid-market tier.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                <h4 className="text-label-md font-label-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span> Strengths
                </h4>
                <ul className="text-body-sm font-body-sm text-on-surface-variant space-y-2">
                  <li>Deep enterprise CRM integrations</li>
                  <li>Advanced custom model training</li>
                </ul>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                <h4 className="text-label-md font-label-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error"></span> Vulnerabilities
                </h4>
                <ul className="text-body-sm font-body-sm text-on-surface-variant space-y-2">
                  <li>High entry price point ($4k/mo)</li>
                  <li>Steep learning curve for admins</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <DashboardCard title="Recent Activity" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden" action={
            <button className="text-primary font-label-sm text-label-sm hover:underline">View All</button>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface/50 border-b border-outline-variant text-label-md font-label-md text-on-surface-variant">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Event Type</th>
                    <th className="p-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm font-body-sm text-on-surface">
                  <tr className="border-b border-outline-variant hover:bg-surface/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">Oct 24, 2023</td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-label-sm inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">new_releases</span> Feature Launch
                      </span>
                    </td>
                    <td className="p-4">Released 'Auto-Suggest v3' with multilinguistic support.</td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">Oct 12, 2023</td>
                    <td className="p-4">
                      <span className="bg-error/10 text-error px-2 py-1 rounded-md text-label-sm inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">price_change</span> Pricing Change
                      </span>
                    </td>
                    <td className="p-4">Increased base enterprise tier by 12%.</td>
                  </tr>
                  <tr className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">Sep 28, 2023</td>
                    <td className="p-4">
                      <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-md text-label-sm inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">campaign</span> Marketing
                      </span>
                    </td>
                    <td className="p-4">Launched "Future of Work" Q4 Ad Campaign.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        {/* Right Sidebar Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* AI Threat Analysis */}
          <DashboardCard title="Threat Level" titleIcon={<span className="material-symbols-outlined text-error">warning</span>} className="border-surface-container-highest shadow-ambient-1">
            <div className="relative h-4 bg-surface rounded-full overflow-hidden mb-2">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-tertiary via-secondary to-error w-3/4 rounded-full"></div>
            </div>
            <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-6">
              <span>Low</span>
              <span className="text-error font-bold text-label-md">High (75%)</span>
            </div>
            <h4 className="text-label-md font-label-md text-on-surface mb-3 border-b border-outline-variant pb-2">Key Opportunities</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-tertiary-container/20 p-1.5 rounded-full text-tertiary mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">target</span>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm text-on-surface">Target SMB Segment</p>
                  <p className="text-[12px] text-on-surface-variant">They are ignoring businesses under 50 employees.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-tertiary-container/20 p-1.5 rounded-full text-tertiary mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">target</span>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm text-on-surface">Highlight Usability</p>
                  <p className="text-[12px] text-on-surface-variant">Reviewers consistently complain about UI complexity.</p>
                </div>
              </li>
            </ul>
          </DashboardCard>

          {/* Competitor Timeline Mini */}
          <DashboardCard title="Strategic Timeline" className="border-surface-container-highest shadow-ambient-1">
            <div className="relative border-l-2 border-outline-variant ml-3 space-y-6">
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface border-2 border-primary"></div>
                <p className="text-label-sm text-primary font-label-sm mb-1">Expected Q1 2024</p>
                <p className="text-body-sm font-body-sm text-on-surface">Mobile App Redesign Release</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-surface"></div>
                <p className="text-label-sm text-on-surface-variant font-label-sm mb-1">Sep 2023</p>
                <p className="text-body-sm font-body-sm text-on-surface">Acquired Dataflow Inc. for $45M</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-outline-variant border-2 border-surface"></div>
                <p className="text-label-sm text-on-surface-variant font-label-sm mb-1">Jun 2023</p>
                <p className="text-body-sm font-body-sm text-on-surface">Series C Funding ($120M)</p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
