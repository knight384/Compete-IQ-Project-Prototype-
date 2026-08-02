"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { KPICard, DashboardCard } from "@/components/shared/DashboardCards"
import { useDashboardAnalytics } from "@/lib/hooks/useDashboardAnalytics"

export default function EnterpriseOverviewPage() {
  const { data, loading, error } = useDashboardAnalytics();

  // Derive safe display values — never NaN, never undefined, never fabricated
  const competitorCount    = loading ? "—" : error ? "!" : String(data?.competitorCount ?? 0);
  const avgActivityScore   = loading ? "—" : error ? "!" :
    <>{data?.avgIntelligenceActivityScore ?? 0}<span className="text-headline-sm font-headline-sm text-outline-variant">/100</span></>;
  const readinessPercent   = loading ? "—" : error ? "!" : `${data?.datasetReadinessPercent ?? 0}%`;
  const productCount       = loading ? "—" : error ? "!" : String(data?.totalProductCount ?? 0);

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

      {/* API Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-sm font-body-sm text-on-surface">
            Failed to load analytics: {error}
          </p>
        </div>
      )}

      {/* Real KPI Metrics — replaces ENTERPRISE_METRICS mock array */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        {/* Competitors Tracked — replaces "Global Market Share" 14.2% hardcoded */}
        <KPICard
          title="Competitors Tracked"
          value={competitorCount}
          icon="analytics"
          iconClassName="text-primary text-xl"
          trend={{
            value: loading ? "Loading…" : "Organizations monitored",
            label: "",
            isPositive: (data?.competitorCount ?? 0) > 0,
            isNeutral: !loading && (data?.competitorCount ?? 0) === 0,
          }}
          className="shadow-ambient-1 border-surface-container-highest"
        />

        {/* Intelligence Activity — replaces misleading "Threat Index" */}
        <KPICard
          title="Intelligence Activity"
          value={avgActivityScore}
          icon="analytics"
          iconClassName="text-secondary text-xl"
          trend={{
            value: loading
              ? "Loading…"
              : `${data?.competitorsWithIntelligenceCount ?? 0} competitor${(data?.competitorsWithIntelligenceCount ?? 0) !== 1 ? 's' : ''} with intelligence`,
            label: "",
            isPositive: (data?.avgIntelligenceActivityScore ?? 0) > 0,
            isNeutral: !loading && (data?.avgIntelligenceActivityScore ?? 0) === 0,
          }}
          className="shadow-ambient-1 border-surface-container-highest"
        />

        {/* Dataset Readiness — replaces "Data Pipeline Health" 99.9% hardcoded */}
        <KPICard
          title="Dataset Readiness"
          value={readinessPercent}
          icon="analytics"
          iconClassName="text-primary text-xl"
          trend={{
            value: loading
              ? "Loading…"
              : `${data?.readyDatasetCount ?? 0} of ${data?.totalDatasetCount ?? 0} datasets ready`,
            label: "",
            isPositive: (data?.datasetReadinessPercent ?? 0) >= 80,
            isNeutral: !loading && (data?.datasetReadinessPercent ?? 0) > 0 && (data?.datasetReadinessPercent ?? 0) < 80,
            isNegative: !loading && (data?.totalDatasetCount ?? 0) > 0 && (data?.datasetReadinessPercent ?? 0) === 0,
          }}
          className="shadow-ambient-1 border-surface-container-highest"
        />

        {/* Products Monitored — replaces "Active Monitored Entities" 1,428 hardcoded */}
        <KPICard
          title="Products Monitored"
          value={productCount}
          icon="analytics"
          iconClassName="text-secondary text-xl"
          trend={{
            value: loading ? "Loading…" : "Across all competitors",
            label: "",
            isPositive: (data?.totalProductCount ?? 0) > 0,
            isNeutral: !loading && (data?.totalProductCount ?? 0) === 0,
          }}
          className="shadow-ambient-1 border-surface-container-highest"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-8">
        <div className="lg:col-span-8">
          {/* Global Market Map — placeholder, no fabricated data */}
          <DashboardCard title="Global Market Map" className="shadow-ambient-1 border-surface-container-highest h-96">
            <div className="flex flex-col items-center justify-center h-full w-full bg-surface-container-low/50 rounded-lg border border-dashed border-outline-variant gap-3">
              <span className="material-symbols-outlined text-4xl text-outline-variant">public</span>
              <span className="text-on-surface-variant font-label-md">
                Geographic visualization coming in a future update.
              </span>
            </div>
          </DashboardCard>
        </div>
        <div className="lg:col-span-4">
          <DashboardCard title="Intelligence Summary" className="shadow-ambient-1 border-surface-container-highest h-96">
            {loading && (
              <div className="flex items-center justify-center h-full text-on-surface-variant text-body-sm">
                Loading…
              </div>
            )}
            {!loading && !error && (data?.topCompetitors?.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <span className="material-symbols-outlined text-3xl text-outline-variant">search_off</span>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  No competitor intelligence available yet. Upload datasets to generate insights.
                </p>
              </div>
            )}
            {!loading && !error && (data?.topCompetitors?.length ?? 0) > 0 && (
              <div className="space-y-3 overflow-y-auto h-full pr-1">
                {data!.topCompetitors.map((comp) => (
                  <div
                    key={comp.competitorId}
                    className="p-3 bg-surface-container-low/50 border border-surface-variant/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-label-md text-on-surface truncate mr-2">{comp.competitorName}</h4>
                      <span className={`text-label-sm font-label-sm shrink-0 px-2 py-0.5 rounded-full ${
                        comp.activityLevel === 'INTENSIVE' ? 'bg-error/10 text-error' :
                        comp.activityLevel === 'HIGH'      ? 'bg-tertiary/10 text-tertiary' :
                        comp.activityLevel === 'MODERATE'  ? 'bg-secondary/10 text-secondary' :
                                                             'bg-outline/10 text-outline'
                      }`}>
                        {comp.activityLevel}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant">
                      Score: {comp.intelligenceActivityScore} · {comp.totalInsights} insight{comp.totalInsights !== 1 ? 's' : ''}
                    </p>
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
