"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { text: string; severity?: string; frequency?: number | null; trend?: string }) => Promise<void>;
  initialData?: { text: string; severity?: string; frequency?: number | null; trend?: string };
  title: string;
}

export function ComplaintFormModal({ isOpen, onClose, onSubmit, initialData, title }: ComplaintFormModalProps) {
  const [text, setText] = React.useState(initialData?.text || "");
  const [severity, setSeverity] = React.useState(initialData?.severity || "MEDIUM");
  const [frequency, setFrequency] = React.useState<string>(initialData?.frequency !== undefined && initialData?.frequency !== null ? String(initialData.frequency) : "");
  const [trend, setTrend] = React.useState(initialData?.trend || "STABLE");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setText(initialData?.text || "");
      setSeverity(initialData?.severity || "MEDIUM");
      setFrequency(initialData?.frequency !== undefined && initialData?.frequency !== null ? String(initialData.frequency) : "");
      setTrend(initialData?.trend || "STABLE");
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Complaint theme/text is required.");
      return;
    }

    let parsedFrequency: number | null = null;
    if (frequency.trim() !== "") {
      parsedFrequency = Number(frequency.trim());
      if (isNaN(parsedFrequency) || parsedFrequency < 0 || parsedFrequency > 100) {
        setError("Frequency must be a number between 0 and 100.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        text: text.trim(),
        severity,
        frequency: parsedFrequency,
        trend,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save complaint.");
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
              Complaint Theme / Text <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Integration takes too long and fails silently"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Trend</label>
              <select
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
              >
                <option value="INCREASING">Increasing</option>
                <option value="STABLE">Stable</option>
                <option value="DECREASING">Decreasing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Frequency (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g. 24"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-variant">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Complaint"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  complaintText: string;
}

export function DeleteComplaintModal({ isOpen, onClose, onConfirm, complaintText }: DeleteComplaintModalProps) {
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
      setError(err.message || "Failed to delete complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-surface-variant rounded-card shadow-ambient-3 w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3 text-error">
          <span className="material-symbols-outlined text-2xl">warning</span>
          <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Delete Complaint</h3>
        </div>

        <p className="text-body-md font-body-md text-on-surface-variant mb-6 line-clamp-3">
          Are you sure you want to delete complaint &quot;{complaintText}&quot;? This action cannot be undone.
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
