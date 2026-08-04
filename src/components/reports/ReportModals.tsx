"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; schedule: string }) => Promise<void>;
  initialData?: { title: string; description?: string | null; schedule: string };
  title: string;
}

export function ReportFormModal({ isOpen, onClose, onSubmit, initialData, title }: ReportFormModalProps) {
  const [reportTitle, setReportTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [schedule, setSchedule] = React.useState(initialData?.schedule || "ON_DEMAND");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setReportTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setSchedule(initialData?.schedule || "ON_DEMAND");
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      setError("Report title is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title: reportTitle.trim(),
        description: description.trim() || undefined,
        schedule,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-surface-variant rounded-card shadow-ambient-3 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4 border-b border-surface-variant pb-3">
          <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-error/10 border border-error/30 text-error text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">
              Report Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="e.g. Executive Competitive Summary"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Schedule</label>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            >
              <option value="ON_DEMAND">On-Demand</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional report description..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-variant">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  reportTitle: string;
}

export function DeleteReportModal({ isOpen, onClose, onConfirm, reportTitle }: DeleteReportModalProps) {
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
      setError(err.message || "Failed to delete report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-surface-variant rounded-card shadow-ambient-3 w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3 text-error">
          <span className="material-symbols-outlined text-2xl">warning</span>
          <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Delete Report</h3>
        </div>

        <p className="text-body-md font-body-md text-on-surface-variant mb-6">
          Are you sure you want to delete report &quot;{reportTitle}&quot;? All execution history logs associated with this report will be permanently removed.
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
          <Button type="button" variant="primary" className="bg-error text-white hover:bg-error/90" onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}
