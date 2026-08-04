"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageLayout";
import { DashboardCard } from "@/components/shared/DashboardCards";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, EmptyState } from "@/components/shared/Feedback";
import { api } from "@/lib/api-client";

interface ReportExecutionDTO {
  id: string;
  reportId: string;
  reportTitle?: string;
  status: "SUCCESS" | "FAILED" | "RUNNING";
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  summary: Record<string, unknown> | null;
  errorLog: string | null;
}

export default function ReportHistoryPage() {
  const [history, setHistory] = React.useState<ReportExecutionDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedLog, setSelectedLog] = React.useState<ReportExecutionDTO | null>(null);

  React.useEffect(() => {
    async function loadHistory() {
      try {
        const data = await api.get<ReportExecutionDTO[]>("/reports/history");
        setHistory(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load report execution logs.");
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "—";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remSecs = seconds % 60;
    return `${mins}m ${remSecs}s`;
  };

  return (
    <>
      <div className="mb-6">
        <Breadcrumb items={[
          { label: "Reports", href: "/reports" },
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

      <DashboardCard title="Execution Logs" className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <LoadingState title="Loading Execution History..." />
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState icon="error" title="Error Loading History" description={error} />
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState icon="history" title="No Execution History" description="Run a report to generate historical execution logs." />
          </div>
        )}

        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Report Title</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Run Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Duration</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {history.map((log) => {
                const formattedDate = new Date(log.startedAt).toLocaleString();
                const statusVariant = log.status === "FAILED" ? "error" : log.status === "RUNNING" ? "secondary" : "default";

                return (
                  <TableRow key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <TableCell className="px-6 py-4 font-medium text-on-surface">
                      {log.reportTitle || `Report #${log.reportId.slice(0, 8)}`}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-on-surface-variant">{formattedDate}</TableCell>
                    <TableCell className="px-6 py-4 text-on-surface-variant">{formatDuration(log.durationSeconds)}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant={statusVariant as any}
                        className={log.status === "SUCCESS" ? "bg-tertiary-container/20 text-tertiary" : ""}
                      >
                        {log.status === "SUCCESS" ? "Success" : log.status === "FAILED" ? "Failed" : "Running"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        className="h-8 px-2 py-1 text-xs"
                        onClick={() => setSelectedLog(log)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-card shadow-ambient-3 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4 border-b border-surface-variant pb-3">
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Execution Details</h3>
              <button onClick={() => setSelectedLog(null)} className="text-on-surface-variant hover:text-on-surface p-1 rounded">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-body-sm text-on-surface font-body-sm">
              <div>
                <span className="text-outline-variant font-medium">Report:</span>{" "}
                <strong className="text-on-surface">{selectedLog.reportTitle || selectedLog.reportId}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-outline-variant font-medium">Status:</span>{" "}
                  <span className={selectedLog.status === "SUCCESS" ? "text-tertiary font-semibold" : "text-error font-semibold"}>
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <span className="text-outline-variant font-medium">Duration:</span>{" "}
                  {formatDuration(selectedLog.durationSeconds)}
                </div>
              </div>

              {selectedLog.errorLog && (
                <div className="p-3 bg-error/10 border border-error/30 rounded text-error text-xs font-mono whitespace-pre-wrap">
                  {selectedLog.errorLog}
                </div>
              )}

              {selectedLog.summary && (
                <div>
                  <h4 className="text-label-md font-label-md text-on-surface mb-2 font-semibold">Summary Snapshot</h4>
                  <pre className="p-3 bg-surface border border-outline-variant rounded text-xs font-mono overflow-x-auto max-h-60 text-on-surface-variant">
                    {JSON.stringify(selectedLog.summary, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 mt-4 border-t border-surface-variant">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
