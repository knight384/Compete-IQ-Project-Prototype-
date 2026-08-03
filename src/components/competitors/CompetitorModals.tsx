"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

interface CompetitorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; domain?: string; logoText?: string; logoColor?: string; status?: string }) => Promise<void>;
  initialData?: { name: string; domain?: string | null; logoText?: string; logoColor?: string; status?: string };
  title: string;
}

export function CompetitorFormModal({ isOpen, onClose, onSubmit, initialData, title }: CompetitorFormModalProps) {
  const [name, setName] = React.useState(initialData?.name || "");
  const [domain, setDomain] = React.useState(initialData?.domain || "");
  const [logoText, setLogoText] = React.useState(initialData?.logoText || "");
  const [logoColor, setLogoColor] = React.useState(initialData?.logoColor || "#2563EB");
  const [status, setStatus] = React.useState(initialData?.status || "Active");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setDomain(initialData?.domain || "");
      setLogoText(initialData?.logoText || "");
      setLogoColor(initialData?.logoColor || "#2563EB");
      setStatus(initialData?.status || "Active");
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Competitor name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        domain: domain.trim() || undefined,
        logoText: logoText.trim() || name.trim().slice(0, 2).toUpperCase(),
        logoColor,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save competitor.");
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
              Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. acme.com"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Logo Badge Text</label>
              <input
                type="text"
                maxLength={4}
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                placeholder="AC"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-variant">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Competitor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  initialData?: { name: string; description?: string | null };
  title: string;
}

export function ProductFormModal({ isOpen, onClose, onSubmit, initialData, title }: ProductFormModalProps) {
  const [name, setName] = React.useState(initialData?.name || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
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
              Product Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Enterprise Pro"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional product description..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-variant">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FeatureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; status: string }) => Promise<void>;
  initialData?: { name: string; description?: string | null; status?: string };
  title: string;
}

export function FeatureFormModal({ isOpen, onClose, onSubmit, initialData, title }: FeatureFormModalProps) {
  const [name, setName] = React.useState(initialData?.name || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [status, setStatus] = React.useState(initialData?.status || "Available");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setStatus(initialData?.status || "Available");
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Feature name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, status });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save feature.");
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
              Feature Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Single Sign-On (SSO)"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            >
              <option value="Available">Available</option>
              <option value="Beta">Beta</option>
              <option value="Missing">Missing</option>
            </select>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1 font-medium">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional feature description..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary text-body-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-variant">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Feature"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) {
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
      setError(err.message || "Deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-surface-variant rounded-card shadow-ambient-3 w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3 text-error">
          <span className="material-symbols-outlined text-2xl">warning</span>
          <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">{title}</h3>
        </div>

        <p className="text-body-md font-body-md text-on-surface-variant mb-6">{message}</p>

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
