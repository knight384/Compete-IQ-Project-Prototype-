"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard, KPICard } from "@/components/shared/DashboardCards"
import { ChartWrapper } from "@/components/shared/ChartWrapper"
import { SENTIMENT_DATA } from "@/lib/mockData"

export default function SentimentPage() {
  return (
    <>
      <PageHeader 
        title="Sentiment Intelligence" 
        description="Analyze public perception and brand health across market segments."
        className="mb-8"
      >
        <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface">
          <span className="material-symbols-outlined text-lg">filter_list</span> Filter
        </Button>
        <Button variant="primary" className="gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">download</span> Export Report
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        <KPICard
          title="Overall Brand Sentiment"
          value={<>78<span className="font-body-lg text-body-lg text-on-surface-variant mb-1">/100</span></>}
          icon="mood"
          iconClassName="text-primary text-xl"
          trend={{ value: "+2.4% vs last month", label: "", isPositive: true }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
        <KPICard
          title="Total Mentions"
          value="14,285"
          icon="forum"
          iconClassName="text-secondary text-xl"
          trend={{ value: "+12% vs last month", label: "", isPositive: true }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
        <KPICard
          title="Negative Spikes"
          value="3"
          icon="warning"
          iconClassName="text-error text-xl"
          trend={{ value: "Requires review", label: "", isNegative: true }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
        <KPICard
          title="Share of Voice"
          value="24%"
          icon="campaign"
          iconClassName="text-tertiary text-xl"
          trend={{ value: "Ranked #2 in market", label: "", isNeutral: true }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <DashboardCard title="Sentiment Trend Analysis" className="shadow-ambient-1 border-surface-container-highest">
            <ChartWrapper
              type="line"
              data={SENTIMENT_DATA}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                  y: { min: 40, max: 100 }
                }
              }}
              className="h-72"
            />
          </DashboardCard>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <DashboardCard title="Top Keywords" className="shadow-ambient-1 border-surface-container-highest h-full">
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full font-label-sm text-label-sm">Reliable (+14%)</span>
              <span className="px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full font-label-sm text-label-sm">Fast Setup (+8%)</span>
              <span className="px-3 py-1 bg-surface-container-highest text-on-surface rounded-full font-label-sm text-label-sm">Support (0%)</span>
              <span className="px-3 py-1 bg-error-container/50 text-error rounded-full font-label-sm text-label-sm">Pricing (-12%)</span>
              <span className="px-3 py-1 bg-error-container/50 text-error rounded-full font-label-sm text-label-sm">API Docs (-5%)</span>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
