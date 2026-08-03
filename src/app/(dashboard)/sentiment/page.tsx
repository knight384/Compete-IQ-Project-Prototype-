"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard, KPICard } from "@/components/shared/DashboardCards"
import { ChartWrapper } from "@/components/shared/ChartWrapper"
import { Badge } from "@/components/ui/Badge"
import { useSentimentAnalytics } from "@/lib/hooks/useSentimentAnalytics"

export default function SentimentPage() {
  const { data, loading, error } = useSentimentAnalytics();

  const totalSignals = loading ? "—" : error ? "!" : String(data?.totalSentimentShiftSignals ?? 0);
  const competitorCount = loading ? "—" : error ? "!" : String(data?.sentimentShiftSignalsByCompetitor.length ?? 0);

  // UTC Daily Trend Chart
  const trendData = {
    labels: (data?.trend.length ?? 0) > 0
      ? data!.trend.map((t) => t.date)
      : ['No Data'],
    datasets: [{
      label: 'Sentiment Shift Signals (Daily UTC)',
      data: (data?.trend.length ?? 0) > 0
        ? data!.trend.map((t) => t.count)
        : [0],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.3,
    }],
  };

  const competitorBreakdownData = {
    labels: (data?.sentimentShiftSignalsByCompetitor.length ?? 0) > 0
      ? data!.sentimentShiftSignalsByCompetitor.map((c) => c.competitorName)
      : ['No Data'],
    datasets: [{
      label: 'Sentiment Shift Signals',
      data: (data?.sentimentShiftSignalsByCompetitor.length ?? 0) > 0
        ? data!.sentimentShiftSignalsByCompetitor.map((c) => c.count)
        : [0],
      backgroundColor: '#8B5CF6',
      borderRadius: 4,
      barThickness: 28,
    }],
  };

  return (
    <>
      <PageHeader
        title="Sentiment Shift Signals"
        description="Tracks detected sentiment shift signals and market perception indicators."
        className="mb-8"
      >
        <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface">
          <span className="material-symbols-outlined text-lg">download</span> Export Signals Brief
        </Button>
      </PageHeader>

      {/* Semantic Disclaimer Banner */}
      <div className="mb-6 p-4 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
        <p className="text-body-sm font-body-sm text-on-surface-variant">
          <strong>Sentiment Signal Tracking:</strong> This view reflects detected sentiment shift insights stored across ready datasets.
          Granular positive/negative polarity percentages and score deltas are reserved for future AI contract updates.
        </p>
      </div>

      {/* API Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-sm font-body-sm text-on-surface">
            Failed to load sentiment shift analytics: {error}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-gutter">
        <KPICard
          title="Sentiment Shift Signals"
          value={totalSignals}
          icon="insights"
          iconClassName="text-primary text-xl"
          trend={{ value: loading ? "Loading…" : "Shift signals across datasets", label: "", isPositive: (data?.totalSentimentShiftSignals ?? 0) > 0 }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
        <KPICard
          title="Competitors Monitored"
          value={competitorCount}
          icon="radar"
          iconClassName="text-secondary text-xl"
          trend={{ value: loading ? "Loading…" : "Competitors with sentiment shift signals", label: "", isNeutral: true }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
        <KPICard
          title="High Confidence Signals"
          value={loading ? "—" : error ? "!" : String(data?.recentInsights.filter(i => i.confidence === 'HIGH').length ?? 0)}
          icon="verified"
          iconClassName="text-tertiary text-xl"
          trend={{ value: loading ? "Loading…" : "Grounded evidence grounding", label: "", isPositive: true }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-8">
        {/* Daily UTC Trend */}
        <div className="lg:col-span-6 flex flex-col">
          <DashboardCard title="Sentiment Shift Signal Activity (30 Days UTC)" className="shadow-ambient-1 border-surface-container-highest flex-1">
            {loading && (
              <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-sm">
                Loading…
              </div>
            )}
            {!loading && (
              <ChartWrapper
                type="line"
                data={trendData}
                options={{
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }}
              />
            )}
          </DashboardCard>
        </div>

        {/* Competitor Breakdown */}
        <div className="lg:col-span-6 flex flex-col">
          <DashboardCard title="Signals by Competitor" className="shadow-ambient-1 border-surface-container-highest flex-1">
            {loading && (
              <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-sm">
                Loading…
              </div>
            )}
            {!loading && !error && (data?.sentimentShiftSignalsByCompetitor.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant">search_off</span>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  No sentiment shift signals detected in current READY datasets.
                </p>
              </div>
            )}
            {!loading && (data?.sentimentShiftSignalsByCompetitor.length ?? 0) > 0 && (
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
      </div>

      {/* Recent Sentiment Shift Signals Stream */}
      <DashboardCard title="Recent Sentiment Shift Insights" className="shadow-ambient-1 border-surface-container-highest mb-8">
        {loading && (
          <div className="flex items-center justify-center h-32 text-on-surface-variant text-body-sm">
            Loading…
          </div>
        )}
        {!loading && !error && (data?.recentInsights.length ?? 0) === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant">forum</span>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              No recent sentiment shift insights available.
            </p>
          </div>
        )}
        {!loading && !error && (data?.recentInsights.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </>
  );
}
