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
import { ComplaintFormModal, DeleteComplaintModal } from "@/components/complaints/ComplaintModals";

interface ComplaintItem {
  id: string;
  text: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  frequency: number | null;
  trend: "INCREASING" | "STABLE" | "DECREASING";
  createdAt: string;
}

export default function ComplaintsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;

  const canCreate = userRole === "ADMIN" || userRole === "ANALYST";
  const canEdit = userRole === "ADMIN" || userRole === "ANALYST";
  const canDelete = userRole === "ADMIN";

  const [complaints, setComplaints] = React.useState<ComplaintItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>("ALL");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editComplaint, setEditComplaint] = React.useState<ComplaintItem | null>(null);
  const [deleteComplaint, setDeleteComplaint] = React.useState<ComplaintItem | null>(null);

  const loadComplaints = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<ComplaintItem[]>("/complaints");
      setComplaints(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleCreateComplaint = async (data: { text: string; severity?: string; frequency?: number | null; trend?: string }) => {
    await api.post("/complaints", data);
    await loadComplaints();
  };

  const handleEditComplaint = async (data: { text: string; severity?: string; frequency?: number | null; trend?: string }) => {
    if (!editComplaint) return;
    await api.put(`/complaints/${editComplaint.id}`, data);
    await loadComplaints();
  };

  const handleDeleteComplaint = async () => {
    if (!deleteComplaint) return;
    await api.delete(`/complaints/${deleteComplaint.id}`);
    await loadComplaints();
  };

  const handleExportData = () => {
    if (complaints.length === 0) return;

    const headers = ["ID", "Theme/Text", "Severity", "Frequency (%)", "Trend", "Created At"];
    const rows = complaints.map(c => [
      c.id,
      `"${c.text.replace(/"/g, '""')}"`,
      c.severity,
      c.frequency !== null && c.frequency !== undefined ? `${c.frequency}%` : "N/A",
      c.trend,
      new Date(c.createdAt).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `complaint_intelligence_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSeverityLabel = (sev: string) => {
    switch (sev) {
      case "CRITICAL": return "Critical";
      case "HIGH": return "High";
      case "MEDIUM": return "Medium";
      case "LOW": return "Low";
      default: return sev;
    }
  };

  const formatTrendLabel = (trend: string) => {
    switch (trend) {
      case "INCREASING": return "Increasing";
      case "DECREASING": return "Decreasing";
      default: return "Stable";
    }
  };

  // Filter complaints based on search term and selected severity
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "ALL" || c.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <>
      <PageHeader 
        title="Complaint Intelligence" 
        description="Monitor user dissatisfaction and friction points across the market."
        className="mb-8"
      >
        <Button variant="outline" onClick={handleExportData} disabled={complaints.length === 0} className="gap-2 shadow-sm border-outline-variant text-on-surface mr-3">
          <span className="material-symbols-outlined text-lg">download</span> Export Data
        </Button>
        {canCreate && (
          <Button variant="primary" onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm">
            <span className="material-symbols-outlined text-lg">add</span> Add Complaint
          </Button>
        )}
      </PageHeader>

      <DashboardCard
        title="Trending Complaints"
        className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden min-h-[300px] relative"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary focus:border-primary w-52 md:w-64 text-on-surface"
              />
            </div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface text-on-surface focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        }
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <LoadingState title="Loading Complaints..." />
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState icon="error" title="Error Loading Complaints" description={error} />
          </div>
        )}

        {!loading && !error && filteredComplaints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState
              icon="sentiment_dissatisfied"
              title={complaints.length === 0 ? "No Complaints Tracked" : "No Matching Complaints"}
              description={complaints.length === 0 ? "Add your first complaint theme to start tracking market friction." : "Try adjusting your search query or severity filter."}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Complaint Theme</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Severity</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Frequency</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Trend</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {filteredComplaints.map((complaint) => {
                const formattedFrequency = complaint.frequency !== null && complaint.frequency !== undefined
                  ? `${complaint.frequency}%`
                  : "N/A";

                const isHighSeverity = complaint.severity === "HIGH" || complaint.severity === "CRITICAL";

                return (
                  <TableRow key={complaint.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <TableCell className="px-6 py-4 font-medium text-on-surface">
                      {complaint.text}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant={isHighSeverity ? "error" : "default"}>
                        {formatSeverityLabel(complaint.severity)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-semibold">
                      {formattedFrequency}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <span className={`flex items-center justify-end gap-1 ${complaint.trend === "INCREASING" ? "text-error" : complaint.trend === "DECREASING" ? "text-primary" : "text-tertiary"}`}>
                        {complaint.trend === "INCREASING" ? (
                          <span className="material-symbols-outlined text-[16px]">trending_up</span>
                        ) : complaint.trend === "DECREASING" ? (
                          <span className="material-symbols-outlined text-[16px]">trending_down</span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                        )}
                        {formatTrendLabel(complaint.trend)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right flex justify-end gap-2">
                      {canEdit && (
                        <button
                          onClick={() => setEditComplaint(complaint)}
                          className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteComplaint(complaint)}
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
      <ComplaintFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateComplaint}
        title="Add Complaint"
      />

      <ComplaintFormModal
        isOpen={!!editComplaint}
        onClose={() => setEditComplaint(null)}
        onSubmit={handleEditComplaint}
        initialData={editComplaint || undefined}
        title="Edit Complaint"
      />

      <DeleteComplaintModal
        isOpen={!!deleteComplaint}
        onClose={() => setDeleteComplaint(null)}
        onConfirm={handleDeleteComplaint}
        complaintText={deleteComplaint?.text || ""}
      />
    </>
  );
}
