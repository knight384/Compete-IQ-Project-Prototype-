"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageLayout";
import { DashboardCard } from "@/components/shared/DashboardCards";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { LoadingState, EmptyState } from "@/components/shared/Feedback";
import { api } from "@/lib/api-client";
import { useSession } from "next-auth/react";

interface DatasetMetadataDto {
  id: string;
  originalFilename: string;
  format: string | null;
  fileSize: number | null;
  status: "UPLOADED" | "MAPPING_REQUIRED" | "MAPPED" | "PROCESSING" | "READY" | "FAILED";
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getStatusBadgeVariant(status: DatasetMetadataDto["status"]): "default" | "secondary" | "error" {
  if (status === "FAILED") return "error";
  if (status === "READY") return "default";
  return "secondary";
}

function formatStatusLabel(status: DatasetMetadataDto["status"]): string {
  switch (status) {
    case "UPLOADED": return "Uploaded";
    case "MAPPING_REQUIRED": return "Mapping Required";
    case "MAPPED": return "Mapped";
    case "PROCESSING": return "Processing";
    case "READY": return "Ready";
    case "FAILED": return "Failed";
    default: return status;
  }
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  filename: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteConfirmModal({ isOpen, filename, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-surface-variant rounded-card shadow-ambient-3 w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-2xl text-error">warning</span>
          <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Delete Document</h3>
        </div>
        <p className="text-body-md font-body-md text-on-surface-variant mb-6">
          Are you sure you want to delete <strong>&quot;{filename}&quot;</strong>? All associated insights will be permanently removed.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-error/10 border border-error/30 text-error text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-variant">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="bg-error text-white hover:bg-error/90"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RepositoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;

  const canUpload = userRole === "ADMIN" || userRole === "ANALYST";
  const canDelete = userRole === "ADMIN";

  const [datasets, setDatasets] = React.useState<DatasetMetadataDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedFormat, setSelectedFormat] = React.useState<string>("ALL");

  const [deleteTarget, setDeleteTarget] = React.useState<DatasetMetadataDto | null>(null);

  const loadDatasets = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<DatasetMetadataDto[]>("/datasets");
      setDatasets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load repository documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/datasets/${deleteTarget.id}`);
    await loadDatasets();
  };

  // Derive unique formats for the filter dropdown
  const availableFormats = React.useMemo(() => {
    const formats = datasets
      .map((d) => d.format?.toUpperCase() ?? null)
      .filter((f): f is string => f !== null && f.trim() !== "");
    return Array.from(new Set(formats)).sort();
  }, [datasets]);

  const filteredDatasets = datasets.filter((d) => {
    const matchesSearch =
      d.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.format ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat =
      selectedFormat === "ALL" || (d.format ?? "").toUpperCase() === selectedFormat;
    return matchesSearch && matchesFormat;
  });

  return (
    <>
      <PageHeader
        title="Intelligence Repository"
        description="Centralized storage for all your competitive analysis documents."
        className="mb-8"
      >
        {canUpload && (
          <Button
            variant="primary"
            className="gap-2 shadow-sm"
            onClick={() => router.push("/datasets/new")}
          >
            <span className="material-symbols-outlined text-lg">upload_file</span> Upload Document
          </Button>
        )}
      </PageHeader>

      <DashboardCard
        title="Repository Documents"
        className="p-0 border-surface-container-highest shadow-ambient-1 overflow-hidden min-h-[300px] relative"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search repository..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary focus:border-primary w-52 md:w-64 text-on-surface"
              />
            </div>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface text-on-surface focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Types</option>
              {availableFormats.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <LoadingState title="Loading Repository..." />
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState icon="error" title="Error Loading Repository" description={error} />
          </div>
        )}

        {!loading && !error && datasets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState
              icon="folder_open"
              title="No Documents Yet"
              description={
                canUpload
                  ? "Upload your first document to begin building your intelligence repository."
                  : "No documents have been uploaded to the repository yet."
              }
            />
          </div>
        )}

        {!loading && !error && datasets.length > 0 && filteredDatasets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
            <EmptyState
              icon="search_off"
              title="No Matching Documents"
              description="No documents match your current search or type filter."
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b border-surface-variant bg-surface/50">
                <TableHead className="px-6 py-4 font-semibold">Document Name</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Type</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Size</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold">Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant">
              {filteredDatasets.map((dataset) => (
                <TableRow
                  key={dataset.id}
                  className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/datasets/${dataset.id}`)}
                >
                  <TableCell className="px-6 py-4 font-medium text-on-surface">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <span className="truncate max-w-[260px]">{dataset.originalFilename}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">
                    {dataset.format ? dataset.format.toUpperCase() : "—"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">
                    {formatFileSize(dataset.fileSize)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant={getStatusBadgeVariant(dataset.status)}
                      className={dataset.status === "READY" ? "bg-tertiary-container/20 text-tertiary" : ""}
                    >
                      {formatStatusLabel(dataset.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">
                    {new Date(dataset.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className="px-6 py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/datasets/${dataset.id}`)}
                        className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(dataset)}
                          className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors ml-1"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        filename={deleteTarget?.originalFilename ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
