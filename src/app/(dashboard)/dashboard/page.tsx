"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { KPICard, DashboardCard } from "@/components/shared/DashboardCards"
import { ChartWrapper } from "@/components/shared/ChartWrapper"
import { PageHeader } from "@/components/shared/PageLayout"
import { api } from "@/lib/api-client"

export default function DashboardPage() {
  const [competitorsCount, setCompetitorsCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get<{id: string}[]>('/competitors');
        setCompetitorsCount(data.length);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const sentimentChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Brand Sentiment',
      data: [65, 68, 62, 74, 75, 78],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: '#2563EB',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const sentimentChartOptions = {
    scales: {
      y: { min: 50, beginAtZero: false }
    }
  };

  const competitorChartData = {
    labels: ['CompetIQ', 'Apex', 'GlobalTech', 'Nova', 'Synergy'],
    datasets: [{
      label: 'Feature Score',
      data: [9.2, 8.5, 7.8, 6.5, 5.9],
      backgroundColor: ['#2563EB', '#e0e3e5', '#e0e3e5', '#e0e3e5', '#e0e3e5'],
      borderRadius: 4,
      barThickness: 32
    }]
  };

  const competitorChartOptions = {
    scales: {
      y: { max: 10 }
    }
  };

  const reviewChartData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    datasets: [
      {
        label: 'CompetIQ',
        data: [120, 135, 150, 180, 210, 240, 280, 310],
        borderColor: '#2563EB',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'Apex',
        data: [180, 185, 190, 195, 205, 215, 220, 230],
        borderColor: '#645efb',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const reviewChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: { usePointStyle: true, boxWidth: 8 }
      }
    }
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

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <KPICard 
          title="Competitors Monitored"
          value={loading ? "..." : error ? "!" : competitorsCount?.toString() || "0"}
          icon="radar"
          iconClassName="bg-primary/10 text-primary"
          trend={{ value: "+3", label: "vs previous period (mock)", isPositive: true }}
        />
        <KPICard 
          title="Market Sentiment"
          value="78%"
          icon="sentiment_satisfied"
          iconClassName="bg-tertiary/10 text-tertiary"
          trend={{ value: "Positive (+4%)", label: "", isPositive: true }}
        />
        <KPICard 
          title="Opportunity Score"
          value={<>8.4<span className="text-headline-sm font-headline-sm text-outline-variant">/10</span></>}
          icon="insights"
          iconClassName="bg-secondary/10 text-secondary"
          trend={{ value: "High potential identified", label: "", isNeutral: true }}
        />
        <KPICard 
          title="Pricing Changes"
          value="5"
          icon="currency_exchange"
          iconClassName="bg-error/10 text-error"
          trend={{ value: "Action Required", label: "", isNegative: true }}
          className="relative overflow-hidden before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-error/5 before:rounded-bl-full before:z-0 [&>*]:relative [&>*]:z-10"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Center Column (Charts) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
          <DashboardCard 
            title="Sentiment Trend" 
            action={
              <button className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            }
          >
            <ChartWrapper type="line" data={sentimentChartData} options={sentimentChartOptions} />
          </DashboardCard>
          
          <DashboardCard 
            title="Competitor Comparison" 
            action={
              <div className="flex gap-2">
                <span className="text-label-sm font-label-sm bg-surface-container-low px-2 py-1 rounded text-on-surface-variant cursor-pointer hover:bg-surface-variant">Features</span>
                <span className="text-label-sm font-label-sm px-2 py-1 rounded text-outline cursor-pointer hover:bg-surface-container-low">Pricing</span>
              </div>
            }
          >
            <ChartWrapper type="bar" data={competitorChartData} options={competitorChartOptions} />
          </DashboardCard>
        </div>

        {/* Right Column (Widgets) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          <DashboardCard 
            title="AI Recommendations"
            titleIcon={<span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>}
            className="flex-1"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/50 hover:border-primary/30 transition-colors cursor-pointer group">
                <p className="text-body-sm font-body-sm text-on-surface"><strong>Competitor X</strong> dropped prices by 10% on entry tier. Consider targeted loyalty campaign.</p>
                <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-label-sm font-label-sm text-primary flex items-center gap-1">Take Action <span className="material-symbols-outlined text-[14px]">arrow_forward</span></span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/50 hover:border-primary/30 transition-colors cursor-pointer group">
                <p className="text-body-sm font-body-sm text-on-surface">Surge in negative reviews for <strong>Brand Y's</strong> new feature. Highlight stability in next ad spend.</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/50 hover:border-primary/30 transition-colors cursor-pointer group">
                <p className="text-body-sm font-body-sm text-on-surface">New market entrant detected in European sector. Initialize comprehensive tracking protocol.</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Alerts">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-error mt-1.5"></div></div>
                <div>
                  <p className="text-label-md font-label-md text-on-surface">Pricing Page Updated</p>
                  <p className="text-body-sm font-body-sm text-outline mt-0.5">Apex Solutions · 2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-tertiary mt-1.5"></div></div>
                <div>
                  <p className="text-label-md font-label-md text-on-surface">New Feature Release</p>
                  <p className="text-body-sm font-body-sm text-outline mt-0.5">GlobalTech · 5 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-outline-variant mt-1.5"></div></div>
                <div>
                  <p className="text-label-md font-label-md text-on-surface">Executive Hire</p>
                  <p className="text-body-sm font-body-sm text-outline mt-0.5">Nova Corp · 1 day ago</p>
                </div>
              </div>
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

      {/* Bottom Chart Row */}
      <DashboardCard title="Review Volume Growth" className="mb-8">
        <ChartWrapper type="line" data={reviewChartData} options={reviewChartOptions} />
      </DashboardCard>
    </>
  );
}
