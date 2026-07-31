"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { ALERTS } from "@/lib/mockData/admin"

export default function AlertsPage() {
  return (
    <>
      <PageHeader 
        title="Alerts & Notifications" 
        description="Stay updated on important system events and intelligence triggers."
        className="mb-8"
      >
        <Button variant="outline" className="border-outline-variant text-on-surface shadow-sm gap-2">
          <span className="material-symbols-outlined text-lg">done_all</span> Mark All Read
        </Button>
      </PageHeader>

      <DashboardCard title="Recent Alerts" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden">
        <div className="divide-y divide-surface-variant">
          {ALERTS.map(alert => (
            <div key={alert.id} className={`p-4 flex gap-4 transition-colors ${alert.read ? "bg-surface/50 opacity-75" : "bg-surface-container-lowest hover:bg-surface-container-low/50"}`}>
              <div className="mt-1">
                {alert.type === "Security" && <span className="material-symbols-outlined text-error">security</span>}
                {alert.type === "System" && <span className="material-symbols-outlined text-outline-variant">settings</span>}
                {alert.type === "Intelligence" && <span className="material-symbols-outlined text-primary">psychology</span>}
                {alert.type === "Billing" && <span className="material-symbols-outlined text-tertiary">payments</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface">{alert.type} Alert</span>
                  <span className="text-[12px] text-on-surface-variant">{alert.timestamp}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{alert.message}</p>
              </div>
              {!alert.read && (
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </DashboardCard>
    </>
  );
}
