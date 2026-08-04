"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageLayout";
import { DashboardCard } from "@/components/shared/DashboardCards";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, EmptyState } from "@/components/shared/Feedback";
import { api } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ReportFormModal, DeleteReportModal } from "@/components/reports/ReportModals";

interface ReportItem {
  id: string;
  title: string;
  description: string | null;
  schedule: string;
  lastRunAt: string | null;
  createdAt: string;
}

export default function ReportsCenterPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;

  const canCreate = userRole === "ADMIN" || userRole === "ANALYST";
  const canEdit = userRole === "ADMIN" || userRole === "ANALYST";
  const canRun = userRole === "ADMIN" || userRole === "ANALYST";
  const canDelete = userRole === "ADMIN";

  const [reports, setReports] = React.useState<ReportItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editReport, setEditReport] = React.useState<ReportItem | null>(null);
  const [deleteReport, setDeleteReport] = React.useState<ReportItem | null>(null);
  const [runningReportId, setRunningReportId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const loadReports = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<ReportItem[]>("/reports");
      setReports(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleCreateReport = async (data: { title: string; description?: string; schedule: string }) => {
    await api.post("/reports", data);
    await loadReports();
  };

  const handleEditReport = async (data: { title: string; description?: string; schedule: string }) => {
    if (!editReport) return;
    await api.put(`/reports/${editReport.id}`, data);
    await loadReports();
  };

  const handleDeleteReport = async () => {
    if (!deleteReport) return;
    await api.delete(`/reports/${deleteReport.id}`);
    await loadReports();
  };

  const handleRunNow = async (reportId: string) => {
    setRunningReportId(reportId);
    setActionError(null);
    try {
      await api.post(`/reports/${reportId}/run`, {});
      await loadReports();
    } catch (err: any) {
      setActionError(err.message || "Failed to execute report.");
    } finally {
      setRunningReportId(null);
    }
  };

  const formatScheduleLabel = (schedule: string) => {
    switch (schedule) {
      case "DAILY": return "Daily";
      case "WEEKLY": return "Weekly";
      case "MONTHLY": return "Monthly";
      default: return "On-Demand";
    }
  };

  return (
    <>
      <PageHeader 
        title="Reports Center" 
        description="Configure, schedule, and download automated intelligence reports."
        className="mb-8"
      >
        <Link href="/reports/history">
          <Button variant="outline" className="gap-2 shadow-sm border-outline-variant text-on-surface mr-3">
            <span className="material-symbols-outlined text-lg">history</span> View History
          </Button>
        </Link>
        {canCreate && (
          <Button variant="primary" onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm">
            <span className="material-symbols-outlined text-lg">add</span> Create Report
          </Button>
        )}
      </PageHeader>

      {actionError && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 flex items-center justify-between gap-3 text-error">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="text-body-sm font-body-sm">{actionError}</p>
          </div>
          <button onClick={() => setActionError(null)} className="p-1 hover:bg-error/10 rounded">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <DashboardCard title="Active Reports" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <LoadingState title="Loading Reports..." />
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState icon="error" title="Error Loading Reports" description={error} />
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState icon="description" title="No Reports Configured" description="Create your first report to start generating intelligence summaries." />
          </div>
        )}

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
              {reports.map((report) => {
                const formattedLastRun = report.lastRunAt ? new Date(report.lastRunAt).toLocaleString() : "Never";
                const isRunning = runningReportId === report.id;

                return (
                  <TableRow key={report.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-on-surface">{report.title}</div>
                      {report.description && (
                        <div className="text-xs text-on-surface-variant line-clamp-1">{report.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-on-surface-variant">
                      {formatScheduleLabel(report.schedule)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-on-surface-variant">{formattedLastRun}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant={isRunning ? "secondary" : "default"}
                        className={!isRunning && report.lastRunAt ? "bg-tertiary-container/20 text-tertiary" : ""}
                      >
                        {isRunning ? "Running..." : report.lastRunAt ? "Ready" : "Configured"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right flex justify-end gap-2">
                      {canRun && (
                        <button
                          onClick={() => handleRunNow(report.id)}
                          disabled={isRunning}
                          className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors disabled:opacity-50"
                          title="Run Now"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isRunning ? "sync" : "play_arrow"}
                          </span>
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => setEditReport(report)}
                          className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteReport(report)}
                          className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>

      {/* Modals */}
      <ReportFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateReport}
        title="Create Report"
      />

      <ReportFormModal
        isOpen={!!editReport}
        onClose={() => setEditReport(null)}
        onSubmit={handleEditReport}
        initialData={editReport || undefined}
        title="Edit Report"
      />

      <DeleteReportModal
        isOpen={!!deleteReport}
        onClose={() => setDeleteReport(null)}
        onConfirm={handleDeleteReport}
        reportTitle={deleteReport?.title || ""}
      />
    </>
  );
}
