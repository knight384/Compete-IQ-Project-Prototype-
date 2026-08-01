"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { KPICard, DashboardCard } from "@/components/shared/DashboardCards"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { api } from "@/lib/api-client"
import { LoadingState, EmptyState } from "@/components/shared/Feedback"

interface CompetitorDetail {
  id: string;
  name: string;
  domain: string | null;
  logoText: string;
  logoColor: string;
  industry: string | null;
  status: string;
  score: number;
  updatedAt: string | Date;
}

export default function CompetitorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [competitor, setCompetitor] = React.useState<CompetitorDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadCompetitor() {
      try {
        const data = await api.get<CompetitorDetail>(`/competitors/${id}`);
        setCompetitor(data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load competitor details');
        }
      } finally {
        setLoading(false);
      }
    }
    loadCompetitor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <LoadingState title="Loading Competitor Details..." />
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <EmptyState 
          icon="error" 
          title="Competitor Not Found" 
          description={error || "The competitor you are looking for does not exist or has been removed."}
        />
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[
          { label: "Competitors", href: "/dashboard/competitors" },
          { label: competitor.name }
        ]} />
      </div>

      {/* Profile Header */}
      <div className="bg-surface-container-lowest rounded-card p-6 shadow-ambient-1 border border-surface-container-highest mb-gutter flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-20 h-20 rounded-xl border border-outline-variant flex items-center justify-center p-2 shadow-sm ${competitor.logoColor || 'bg-surface text-on-surface'}`}>
             <span className="text-3xl font-bold">{competitor.logoText || competitor.name.charAt(0)}</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">{competitor.name}</h2>
              <span className={`bg-tertiary-container/10 text-tertiary text-label-sm font-label-sm px-2 py-1 rounded-full flex items-center gap-1 border border-tertiary/20`}>
                <span className="material-symbols-outlined text-[14px]">
                  {competitor.status === "Active" ? "monitoring" : "warning"}
                </span>
                {competitor.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-body-sm font-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">domain</span> {competitor.industry || "General Industry"}</span>
              {competitor.domain && (
                <a className="flex items-center gap-1 text-primary hover:underline" href={`https://${competitor.domain}`} target="_blank" rel="noreferrer">
                  <span className="material-symbols-outlined text-[16px]">language</span> {competitor.domain}
                </a>
              )}
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
          value="0" /* Placeholder: API doesn't return products count currently */
          icon="inventory_2"
          iconClassName="bg-surface text-secondary"
          trend={{ value: "N/A", label: "", isNeutral: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Market Score"
          value={<>{competitor.score}<span className="text-headline-sm text-outline">/100</span></>}
          icon="show_chart"
          iconClassName="bg-surface text-primary"
          trend={{ value: "Stable", label: "", isNeutral: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Feature Gap"
          value={<>--<span className="text-headline-sm text-outline"> missing</span></>}
          icon="compare_arrows"
          iconClassName="bg-surface text-error"
          trend={{ value: "Not calculated yet", label: "", isNeutral: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Pricing Index"
          value="N/A"
          icon="attach_money"
          iconClassName="bg-surface text-tertiary"
          trend={{ value: "Data unavailable", label: "", isNeutral: true }}
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
            <button className="pb-3 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md whitespace-nowrap">Features (Placeholder)</button>
            <button className="pb-3 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md whitespace-nowrap">Pricing (Placeholder)</button>
            <button className="pb-3 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md whitespace-nowrap">Reviews (Placeholder)</button>
          </div>

          {/* AI Insights Overview Card (Placeholder content retained from mock) */}
          <div className="bg-surface-container-lowest rounded-card p-6 shadow-ambient-1 border border-surface-container-highest relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Executive Summary (AI Generated Mock)</h3>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant mb-6 relative z-10 leading-relaxed">
              {competitor.name} continues to dominate their tier. We recommend prioritizing our "One-Click Integration" marketing to capture their dissatisfied mid-market tier. (This is placeholder AI analysis).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                <h4 className="text-label-md font-label-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span> Strengths (Mock)
                </h4>
                <ul className="text-body-sm font-body-sm text-on-surface-variant space-y-2">
                  <li>Deep enterprise integrations</li>
                </ul>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                <h4 className="text-label-md font-label-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error"></span> Vulnerabilities (Mock)
                </h4>
                <ul className="text-body-sm font-body-sm text-on-surface-variant space-y-2">
                  <li>High entry price point</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Activity Table (Placeholder content retained) */}
          <DashboardCard title="Recent Activity (Mock)" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden" action={
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
                    <td className="p-4 whitespace-nowrap">{new Date(competitor.updatedAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-label-sm inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">update</span> Profile Updated
                      </span>
                    </td>
                    <td className="p-4">Competitor profile data was updated in the system.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        {/* Right Sidebar Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* AI Threat Analysis (Placeholder content) */}
          <DashboardCard title="Threat Level (Mock)" titleIcon={<span className="material-symbols-outlined text-error">warning</span>} className="border-surface-container-highest shadow-ambient-1">
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
            </ul>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
