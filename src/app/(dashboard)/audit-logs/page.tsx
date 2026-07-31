"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { DashboardCard } from "@/components/shared/DashboardCards"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { AUDIT_LOGS } from "@/lib/mockData/admin"

export default function AuditLogsPage() {
  return (
    <>
      <PageHeader 
        title="Audit Logs" 
        description="Track all user activity and system events."
        className="mb-8"
      >
        <Button variant="outline" className="border-outline-variant text-on-surface shadow-sm gap-2">
          <span className="material-symbols-outlined text-lg">download</span> Export CSV
        </Button>
      </PageHeader>

      <DashboardCard title="Activity Center" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden" action={
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
          <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary focus:border-primary w-64" />
        </div>
      }>
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Action</TableHead>
                <TableHead className="px-6 py-4 font-semibold">User</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Role</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {AUDIT_LOGS.map(log => (
                <TableRow key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <TableCell className="px-6 py-4 font-medium text-on-surface">{log.action}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{log.user}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={log.role === "Admin" ? "error" : log.role === "System" ? "secondary" : "default"}>
                      {log.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{log.date}</TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    </>
  );
}
