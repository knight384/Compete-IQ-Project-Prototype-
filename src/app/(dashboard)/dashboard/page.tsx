"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { KPICard, DashboardCard } from "@/components/shared/DashboardCards"
import { ChartWrapper } from "@/components/shared/ChartWrapper"
import { PageHeader } from "@/components/shared/PageLayout"
import { useDashboardAnalytics } from "@/lib/hooks/useDashboardAnalytics"

/**
 * Deferred-state placeholder for analytics surfaces not yet implemented.
 * Replaces fabricated static charts from pre-5.4 implementation.
 */
function DeferredAnalyticsCard({ title, message }: { title: string; message: string }) {
  return (
    <DashboardCard title={title}>
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
        <span className="material-symbols-outlined text-4xl text-outline-variant">query_stats</span>
        <p className="text-body-sm font-body-sm text-on-surface-variant max-w-xs">{message}</p>
      </div>
    </DashboardCard>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboardAnalytics();

  // Derive display values — never NaN, never undefined, never fabricated fallbacks
  const competitorCount = loading ? "—" : error ? "!" : String(data?.competitorCount ?? 0);
  const totalInsights    = loading ? "—" : error ? "!" : String(data?.totalInsights ?? 0);
  const avgScore         = loading ? "—" : error ? "!" : String(data?.avgIntelligenceActivityScore ?? 0);
  const pricingOpps      = loading ? "—" : error ? "!" : String(data?.totalPricingOpportunities ?? 0);

  // Competitor Intelligence Activity bar chart — uses real data, explicit 0–100 Y-axis
  const topCompetitors = data?.topCompetitors ?? [];

  const intelligenceChartData = {
    labels: topCompetitors.length > 0
      ? topCompetitors.map((c) => c.competitorName)
      : ['No Data'],
    datasets: [{
      label: 'Intelligence Activity Score',
      data: topCompetitors.length > 0
        ? topCompetitors.map((c) => c.intelligenceActivityScore)
        : [0],
      backgroundColor: topCompetitors.map((_, i) =>
        i === 0 ? '#2563EB' : '#e0e3e5'
      ),
      borderRadius: 4,
      barThickness: 32,
    }],
  };

  const intelligenceChartOptions = {
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Activity Score (0–100)',
        },
      },
    },
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Executive Overview"
        description="Real-time competitive intelligence and market positioning."
        className="mb-8"
      >
        <div className="flex items-center bg-surface-container-lowest border border-slate-200 rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface-variant shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-lg mr-2">calendar_today</span>
          Last 30 Days
          <span className="material-symbols-outlined text-lg ml-2">expand_more</span>
        </div>
        <Button variant="outline" className="text-primary-container hover:bg-primary-container hover:text-white border-slate-200 shadow-sm gap-2">
          <span className="material-symbols-outlined text-lg">download</span>
          Export
        </Button>
      </PageHeader>

      {/* API Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-sm font-body-sm text-on-surface">
            Failed to load analytics: {error}
          </p>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <KPICard
          title="Competitors Monitored"
          value={competitorCount}
          icon="radar"
          iconClassName="bg-primary/10 text-primary"
          trend={{ value: loading ? "Loading…" : "Tracked competitors", label: "", isPositive: true }}
        />
        <KPICard
          title="Total Insights"
          value={totalInsights}
          icon="lightbulb"
          iconClassName="bg-tertiary/10 text-tertiary"
          trend={{ value: loading ? "Loading…" : "Linked across datasets", label: "", isPositive: true }}
        />
        <KPICard
          title="Avg Activity Score"
          value={
            loading || error
              ? avgScore
              : <>{avgScore}<span className="text-headline-sm font-headline-sm text-outline-variant">/100</span></>
          }
          icon="insights"
          iconClassName="bg-secondary/10 text-secondary"
          trend={{
            value: loading ? "Loading…" : `${data?.competitorsWithIntelligenceCount ?? 0} competitors with intelligence`,
            label: "",
            isNeutral: true,
          }}
        />
        <KPICard
          title="Pricing Opportunities"
          value={pricingOpps}
          icon="currency_exchange"
          iconClassName="bg-error/10 text-error"
          trend={{ value: loading ? "Loading…" : "Across all competitors", label: "", isNegative: (data?.totalPricingOpportunities ?? 0) > 0 }}
          className="relative overflow-hidden before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-error/5 before:rounded-bl-full before:z-0 [&>*]:relative [&>*]:z-10"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Center Column (Charts) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
          {/* Deferred: Sentiment Trend (no real sentiment data available yet) */}
          <DeferredAnalyticsCard
            title="Sentiment Trend"
            message="Sentiment analytics will be available after additional intelligence integration in Milestone 5.5."
          />

          {/* Competitor Intelligence Activity — real data, explicit 0–100 Y-axis */}
          <DashboardCard
            title="Competitor Intelligence Activity"
            action={
              <span className="text-label-sm font-label-sm text-on-surface-variant px-2 py-1 rounded bg-surface-container-low">
                Score 0–100
              </span>
            }
          >
            {loading && (
              <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-sm">
                Loading…
              </div>
            )}
            {!loading && !error && topCompetitors.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant">bar_chart</span>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  No competitors tracked yet. Add a competitor to see intelligence activity.
                </p>
              </div>
            )}
            {!loading && (topCompetitors.length > 0 || error) && (
              <ChartWrapper
                type="bar"
                data={intelligenceChartData}
                options={intelligenceChartOptions}
              />
            )}
          </DashboardCard>
        </div>

        {/* Right Column (Widgets) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          {/* Competitor Intelligence Summary — real data */}
          <DashboardCard
            title="Intelligence Highlights"
            titleIcon={<span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>}
            className="flex-1"
          >
            {loading && (
              <div className="flex items-center justify-center h-32 text-on-surface-variant text-body-sm">
                Loading…
              </div>
            )}
            {!loading && !error && topCompetitors.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
                <span className="material-symbols-outlined text-3xl text-outline-variant">search_off</span>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  No intelligence available yet. Upload and process datasets to generate insights.
                </p>
              </div>
            )}
            {!loading && !error && topCompetitors.length > 0 && (
              <div className="space-y-4">
                {topCompetitors.slice(0, 3).map((comp) => (
                  <div
                    key={comp.competitorId}
                    className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-label-md font-label-md text-on-surface">{comp.competitorName}</p>
                      <span className="text-label-sm font-label-sm text-primary">
                        Score: {comp.intelligenceActivityScore}
                      </span>
                    </div>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">
                      {comp.totalInsights} insight{comp.totalInsights !== 1 ? 's' : ''}
                      {comp.featureGapCount > 0 && ` · ${comp.featureGapCount} feature gap${comp.featureGapCount !== 1 ? 's' : ''}`}
                      {comp.pricingOpportunityCount > 0 && ` · ${comp.pricingOpportunityCount} pricing opp${comp.pricingOpportunityCount !== 1 ? 's' : ''}`}
                    </p>
                    <span className={`mt-2 inline-block text-label-sm font-label-sm px-2 py-0.5 rounded-full ${
                      comp.activityLevel === 'INTENSIVE' ? 'bg-error/10 text-error' :
                      comp.activityLevel === 'HIGH'      ? 'bg-tertiary/10 text-tertiary' :
                      comp.activityLevel === 'MODERATE'  ? 'bg-secondary/10 text-secondary' :
                                                           'bg-outline/10 text-outline'
                    }`}>
                      {comp.activityLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Deferred: Recent Alerts */}
          <DashboardCard title="Recent Alerts">
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
              <span className="material-symbols-outlined text-3xl text-outline-variant">notifications_off</span>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                Alert tracking will be available in a future update.
              </p>
            </div>
          </DashboardCard>

          <div className="bg-primary-container text-on-primary rounded-card p-6 shadow-sm border border-primary/20">
            <h3 className="text-headline-sm font-headline-sm mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-label-md font-label-md transition-colors flex items-center justify-between group">
                Create Report
                <span className="material-symbols-outlined text-[18px] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-label-md font-label-md transition-colors flex items-center justify-between group">
                Add Competitor
                <span className="material-symbols-outlined text-[18px] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-label-md font-label-md transition-colors flex items-center justify-between group">
                Run AI Audit
                <span className="material-symbols-outlined text-[18px] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Deferred Review Volume Growth */}
      <DeferredAnalyticsCard
        title="Review Volume Growth"
        message="Review volume analytics will be available after additional intelligence integration in Milestone 5.5."
      />
    </>
  );
}
