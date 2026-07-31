"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Badge } from "@/components/ui/Badge"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { REPORT_HISTORY } from "@/lib/mockData/reports"

export default function ReportHistoryPage() {
  return (
    <>
      <div className="mb-6">
        <Breadcrumb items={[
          { label: "Reports", href: "/dashboard/reports" },
          { label: "History" }
        ]} />
      </div>

      <PageHeader 
        title="Report History" 
        description="View past executions and download historical report artifacts."
        className="mb-8"
      >
        <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface">
          <span className="material-symbols-outlined text-lg">filter_list</span> Filter
        </Button>
      </PageHeader>

      <DashboardCard title="Execution Logs" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Report ID</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Run Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Duration</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {REPORT_HISTORY.map(history => (
                <TableRow key={history.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <TableCell className="px-6 py-4 font-medium text-on-surface">Report #{history.reportId}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{history.runDate}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{history.runTime}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={history.status === "Failed" ? "error" : "default"} className={history.status === "Success" ? "bg-tertiary-container/20 text-tertiary" : ""}>
                      {history.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button variant="outline" className="h-8 px-2 py-1 text-xs">
                      View Logs
                    </Button>
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
