"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard, KPICard } from "@/components/shared/DashboardCards"
import { ChartWrapper } from "@/components/shared/ChartWrapper"
import { Badge } from "@/components/ui/Badge"
import { useOpportunityAnalytics } from "@/lib/hooks/useOpportunityAnalytics"

export default function OpportunitiesPage() {
  const { data, loading, error } = useOpportunityAnalytics();

  const totalOpps = loading ? "—" : error ? "!" : String(data?.totalPricingOpportunityInsights ?? 0);
  const competitorCount = loading ? "—" : error ? "!" : String(data?.pricingOpportunityInsightsByCompetitor.length ?? 0);

  const competitorBreakdownData = {
    labels: (data?.pricingOpportunityInsightsByCompetitor.length ?? 0) > 0
      ? data!.pricingOpportunityInsightsByCompetitor.map((c) => c.competitorName)
      : ['No Data'],
    datasets: [{
      label: 'Pricing Opportunity Insights',
      data: (data?.pricingOpportunityInsightsByCompetitor.length ?? 0) > 0
        ? data!.pricingOpportunityInsightsByCompetitor.map((c) => c.count)
        : [0],
      backgroundColor: '#059669',
      borderRadius: 4,
      barThickness: 28,
    }],
  };

  return (
    <>
      <PageHeader
        title="Pricing Opportunity Insights"
        description="Identified pricing position opportunities grounded in dataset evidence."
        className="mb-8"
      >
        <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface">
          <span className="material-symbols-outlined text-lg">download</span> Export Brief
        </Button>
      </PageHeader>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-sm font-body-sm text-on-surface">
            Failed to load pricing opportunity analytics: {error}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-gutter">
        <KPICard
          title="Total Opportunity Insights"
          value={totalOpps}
          icon="currency_exchange"
          iconClassName="text-tertiary text-xl"
          trend={{ value: loading ? "Loading…" : "Across all datasets", label: "", isPositive: (data?.totalPricingOpportunityInsights ?? 0) > 0 }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
        <KPICard
          title="Competitors Covered"
          value={competitorCount}
          icon="radar"
          iconClassName="text-secondary text-xl"
          trend={{ value: loading ? "Loading…" : "Monitored competitors with signals", label: "", isNeutral: true }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
        <KPICard
          title="High Confidence Insights"
          value={loading ? "—" : error ? "!" : String(data?.recentInsights.filter(i => i.confidence === 'HIGH').length ?? 0)}
          icon="verified"
          iconClassName="text-primary text-xl"
          trend={{ value: loading ? "Loading…" : "Grounded in row evidence", label: "", isPositive: true }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-8">
        {/* Competitor Breakdown */}
        <div className="lg:col-span-6 flex flex-col">
          <DashboardCard title="Pricing Opportunities by Competitor" className="shadow-ambient-1 border-surface-container-highest flex-1">
            {loading && (
              <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-sm">
                Loading…
              </div>
            )}
            {!loading && !error && (data?.pricingOpportunityInsightsByCompetitor.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant">search_off</span>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  No pricing opportunity insights detected in current READY datasets.
                </p>
              </div>
            )}
            {!loading && (data?.pricingOpportunityInsightsByCompetitor.length ?? 0) > 0 && (
              <ChartWrapper
                type="bar"
                data={competitorBreakdownData}
                options={{
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }}
              />
            )}
          </DashboardCard>
        </div>

        {/* Opportunity Insights Stream */}
        <div className="lg:col-span-6 flex flex-col">
          <DashboardCard title="Recent Pricing Opportunity Insights" className="shadow-ambient-1 border-surface-container-highest flex-1">
            {loading && (
              <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-sm">
                Loading…
              </div>
            )}
            {!loading && !error && (data?.recentInsights.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant">payments</span>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  No recent pricing opportunity insights available.
                </p>
              </div>
            )}
            {!loading && !error && (data?.recentInsights.length ?? 0) > 0 && (
              <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
                {data!.recentInsights.map((insight) => (
                  <div key={insight.id} className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/40">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-label-md text-on-surface font-semibold">{insight.title}</h4>
                      <Badge variant={insight.confidence === 'HIGH' ? 'secondary' : 'default'}>
                        {insight.confidence ?? 'MEDIUM'} Confidence
                      </Badge>
                    </div>
                    <p className="font-body-sm text-on-surface-variant mb-2">{insight.summary}</p>
                    <div className="flex flex-wrap gap-2 text-[12px] text-outline">
                      {insight.competitorName && <span>Competitor: <strong>{insight.competitorName}</strong></span>}
                      {insight.productName && <span>· Product: <strong>{insight.productName}</strong></span>}
                      <span>· Dataset: {insight.datasetFilename}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
