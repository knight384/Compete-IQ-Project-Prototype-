"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Badge } from "@/components/ui/Badge"
import { FEATURE_GAPS } from "@/lib/mockData"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"

export default function FeatureGapsPage() {
  return (
    <>
      <PageHeader 
        title="Feature Gap Intelligence" 
        description="Identify product capability differences across your competitors."
        className="mb-8"
      >
        <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface">
          <span className="material-symbols-outlined text-lg">download</span> Export Matrix
        </Button>
      </PageHeader>

      <DashboardCard title="Prioritized Feature Gaps" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Feature</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-center">CompetIQ</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-center">Market Leader</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {FEATURE_GAPS.map(gap => (
                <TableRow key={gap.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <TableCell className="px-6 py-4 font-medium text-on-surface">{gap.feature}</TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    {gap.us ? (
                      <span className="material-symbols-outlined text-tertiary">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant">cancel</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    {gap.them ? (
                      <span className="material-symbols-outlined text-tertiary">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant">cancel</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={gap.priority === "Critical" ? "error" : gap.priority === "High" ? "secondary" : "default"}>
                      {gap.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    </>
  );
}
