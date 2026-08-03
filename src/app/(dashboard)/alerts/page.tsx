"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Badge } from "@/components/ui/Badge"
import { useRecentInsights } from "@/lib/hooks/useRecentInsights"

export default function AlertsPage() {
  const { data, loading, error, loadMore, loadingMore } = useRecentInsights({ limit: 20 });

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Recent Intelligence Signals"
        description="Chronological feed of validated intelligence signals extracted across active datasets."
        className="mb-8"
      >
        <Button variant="outline" className="border-outline-variant text-on-surface shadow-sm gap-2">
          <span className="material-symbols-outlined text-lg">sync</span> Refresh Signals
        </Button>
      </PageHeader>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-sm font-body-sm text-on-surface">
            Failed to load intelligence signals: {error}
          </p>
        </div>
      )}

      <DashboardCard title="Intelligence Stream" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center p-12 text-on-surface-variant text-body-sm">
            Loading intelligence stream…
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant">notifications_off</span>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              No intelligence signals available yet. Upload and process datasets to generate signals.
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="divide-y divide-surface-variant">
            {items.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {item.type === 'FEATURE_GAP' && <span className="material-symbols-outlined text-primary">grid_view</span>}
                    {item.type === 'PRICING_OPPORTUNITY' && <span className="material-symbols-outlined text-tertiary">payments</span>}
                    {item.type === 'SENTIMENT_SHIFT' && <span className="material-symbols-outlined text-secondary">forum</span>}
                    {item.type !== 'FEATURE_GAP' && item.type !== 'PRICING_OPPORTUNITY' && item.type !== 'SENTIMENT_SHIFT' && (
                      <span className="material-symbols-outlined text-outline">lightbulb</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-label-md text-on-surface font-semibold">{item.title}</span>
                      <Badge variant="default" className="text-[11px] font-mono">
                        {item.type}
                      </Badge>
                      <Badge variant={item.confidence === 'HIGH' ? 'secondary' : 'default'} className="text-[11px]">
                        {item.confidence ?? 'MEDIUM'}
                      </Badge>
                    </div>
                    <p className="font-body-sm text-on-surface-variant mb-2">{item.summary}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[12px] text-outline">
                      {item.competitorName && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">domain</span>
                          {item.competitorName}
                        </span>
                      )}
                      {item.productName && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                          {item.productName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">description</span>
                        {item.datasetFilename}
                      </span>
                      <span>· {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cursor Pagination Control */}
        {data?.hasMore && (
          <div className="p-4 border-t border-surface-variant flex justify-center bg-surface-container-low/30">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loadingMore}
              className="gap-2"
            >
              {loadingMore ? 'Loading older signals…' : 'Load More Signals'}
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </Button>
          </div>
        )}
      </DashboardCard>
    </>
  );
}
