"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Badge } from "@/components/ui/Badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { REPORTS } from "@/lib/mockData/reports"
import Link from "next/link"

export default function ReportsCenterPage() {
  return (
    <>
      <PageHeader 
        title="Reports Center" 
        description="Configure, schedule, and download automated intelligence reports."
        className="mb-8"
      >
        <Link href="/dashboard/reports/history">
          <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface mr-3">
            <span className="material-symbols-outlined text-lg">history</span> View History
          </Button>
        </Link>
        <Button variant="primary" className="gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">add</span> Create Report
        </Button>
      </PageHeader>

      <DashboardCard title="Active Reports" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Report Name</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Schedule</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Last Run</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {REPORTS.map(report => (
                <TableRow key={report.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <TableCell className="px-6 py-4 font-medium text-on-surface">{report.title}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{report.schedule}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{report.lastRun}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={report.status === "Processing" ? "secondary" : "default"} className={report.status === "Ready" ? "bg-tertiary-container/20 text-tertiary" : ""}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors" title="Run Now">
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    </button>
                    <button className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors" title="Edit">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
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
