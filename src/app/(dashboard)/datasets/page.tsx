"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';
import { FrontendDatasetMetadata } from '@/lib/types/dataset';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageLayout';
import { DashboardCard } from '@/components/shared/DashboardCards';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/Feedback';

export default function DatasetLibraryPage() {
  const [datasets, setDatasets] = useState<FrontendDatasetMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadDatasets() {
      try {
        const data = await api.get<FrontendDatasetMetadata[]>('/datasets');
        if (mounted) {
          setDatasets(data);
        }
      } catch (err: unknown) {
        if (mounted) {
          if (err instanceof ApiError) {
            setErrorMsg(err.message);
          } else {
            setErrorMsg('Failed to load datasets.');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDatasets();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRowClick = (dataset: FrontendDatasetMetadata) => {
    if (['UPLOADED', 'MAPPING_REQUIRED'].includes(dataset.status)) {
      // Do nothing, status-only
      return;
    }
    router.push(`/datasets/${dataset.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return <Badge variant="success" className="bg-primary/20 text-primary border-primary">Ready</Badge>;
      case 'FAILED':
        return <Badge variant="error" className="bg-error/20 text-error border-error">Failed</Badge>;
      case 'PROCESSING':
        return <Badge variant="secondary" className="bg-tertiary/20 text-tertiary border-tertiary">Processing</Badge>;
      case 'MAPPED':
        return <Badge variant="secondary" className="bg-surface-variant text-on-surface-variant">Mapped</Badge>;
      case 'MAPPING_REQUIRED':
        return <Badge variant="default" className="text-outline-variant">Mapping Required</Badge>;
      case 'UPLOADED':
        return <Badge variant="default" className="text-outline-variant">Uploaded</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Dataset Library" 
        description="Manage your datasets and external sources."
      >
        <Link href="/datasets/new">
          <Button variant="primary" className="gap-2 shadow-sm">
            <span className="material-symbols-outlined text-lg">add</span> New Dataset
          </Button>
        </Link>
      </PageHeader>

      {errorMsg && (
        <div className="bg-error/10 border border-error text-error p-4 rounded-lg flex items-start gap-3" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <div>
            <h3 className="font-label-md font-bold mb-1">Failed to load datasets</h3>
            <p className="text-body-sm font-body-sm">{errorMsg}</p>
          </div>
        </div>
      )}

      <DashboardCard title="Your Datasets" className="border-outline-variant/30 shadow-ambient-1 h-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4" aria-busy="true">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            <p className="text-body-md font-body-md text-on-surface-variant">Loading datasets...</p>
          </div>
        ) : datasets.length === 0 ? (
          <EmptyState 
            icon="database" 
            title="No Datasets Found" 
            description="Upload your first dataset to start extracting competitive intelligence."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-left min-w-[600px]">
              <TableHeader className="bg-surface-bright">
                <TableRow className="border-b border-surface-variant">
                  <TableHead className="px-4 py-3 font-label-md text-on-surface-variant">Filename</TableHead>
                  <TableHead className="px-4 py-3 font-label-md text-on-surface-variant">Status</TableHead>
                  <TableHead className="px-4 py-3 font-label-md text-on-surface-variant">Format</TableHead>
                  <TableHead className="px-4 py-3 font-label-md text-on-surface-variant">Size</TableHead>
                  <TableHead className="px-4 py-3 font-label-md text-on-surface-variant">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body-sm text-on-surface">
                {datasets.map(dataset => {
                  const isNavigable = !['UPLOADED', 'MAPPING_REQUIRED'].includes(dataset.status);
                  return (
                    <TableRow 
                      key={dataset.id} 
                      className={`border-b border-surface-variant ${isNavigable ? 'cursor-pointer hover:bg-surface-bright transition-colors' : 'opacity-80'}`}
                      onClick={() => handleRowClick(dataset)}
                      tabIndex={isNavigable ? 0 : -1}
                      onKeyDown={(e) => {
                        if (isNavigable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleRowClick(dataset);
                        }
                      }}
                      role={isNavigable ? 'button' : 'row'}
                    >
                      <TableCell className="px-4 py-4 truncate max-w-[200px] font-medium">
                        {dataset.originalFilename}
                        {!isNavigable && (
                          <div className="text-xs text-on-surface-variant mt-1">(Setup Interrupted)</div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4">{getStatusBadge(dataset.status)}</TableCell>
                      <TableCell className="px-4 py-4">{dataset.format || 'Unknown'}</TableCell>
                      <TableCell className="px-4 py-4">{formatFileSize(dataset.fileSize)}</TableCell>
                      <TableCell className="px-4 py-4 text-on-surface-variant">
                        {new Date(dataset.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
