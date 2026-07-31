"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Badge } from "@/components/ui/Badge"
import { COMPLAINTS } from "@/lib/mockData"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"

export default function ComplaintsPage() {
  return (
    <>
      <PageHeader 
        title="Complaint Intelligence" 
        description="Monitor user dissatisfaction and friction points across the market."
        className="mb-8"
      >
        <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface">
          <span className="material-symbols-outlined text-lg">download</span> Export Data
        </Button>
      </PageHeader>

      <DashboardCard title="Trending Complaints" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Complaint Theme</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Severity</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Frequency</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {COMPLAINTS.map(complaint => (
                <TableRow key={complaint.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <TableCell className="px-6 py-4 font-medium text-on-surface">{complaint.text}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={complaint.severity === "High" ? "error" : "default"}>
                      {complaint.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right font-semibold">{complaint.frequency}</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className={`flex items-center justify-end gap-1 ${complaint.trend === "Increasing" ? "text-error" : "text-tertiary"}`}>
                      {complaint.trend === "Increasing" ? (
                        <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                      )}
                      {complaint.trend}
                    </span>
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
