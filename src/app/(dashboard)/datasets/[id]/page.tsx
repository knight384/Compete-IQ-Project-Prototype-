"use client"

import React, { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { FrontendDatasetMetadata, FrontendDatasetIntelligence } from '@/lib/types/dataset';
import { PageHeader } from '@/components/shared/PageLayout';
import { DashboardCard, KPICard } from '@/components/shared/DashboardCards';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/shared/Feedback';
import { Badge } from '@/components/ui/Badge';

export default function DatasetIntelligencePage({ params }: { params: Promise<{ id: string }> }) {
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FrontendDatasetMetadata | null>(null);
  const [intelligence, setIntelligence] = useState<FrontendDatasetIntelligence | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [retrying, setRetrying] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then(p => {
      setDatasetId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (!datasetId) return;
    fetchDatasetData();
  }, [datasetId]);

  const fetchDatasetData = async () => {
    setLoading(true);
    setErrorMsg(null);
    setNotFound(false);
    try {
      // 1. Lifecycle discovery
      const meta = await api.get<FrontendDatasetMetadata>(`/datasets/${datasetId}`);
      setMetadata(meta);

      // 2. Intelligence retrieval if READY
      if (meta.status === 'READY') {
        const intel = await api.get<FrontendDatasetIntelligence>(`/datasets/${datasetId}/intelligence`);
        setIntelligence(intel);
      } else {
        // Explicitly clear stale intelligence if status changes from READY
        setIntelligence(null);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setNotFound(true);
        } else if (err.status === 409) {
          setErrorMsg('Dataset state changed or conflict occurred. Please refresh status.');
        } else if (err.status === 502) {
          setErrorMsg('AI provider is temporarily unavailable. Please try again later.');
        } else if (err.status >= 500) {
          setErrorMsg('An internal intelligence processing or configuration error occurred.');
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!datasetId || generating || metadata?.status !== 'MAPPED') return;
    
    setGenerating(true);
    setErrorMsg(null);
    try {
      await api.post(`/datasets/${datasetId}/generate-intelligence`, {});
      
      // On success, refetch persisted intelligence and refresh metadata status
      await fetchDatasetData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorMsg('Lifecycle state changed during generation. Please refresh the page or status.');
        } else if (err.status === 502) {
          setErrorMsg('AI provider is temporarily unavailable. Please try again later.');
        } else if (err.status >= 500) {
          setErrorMsg('Intelligence generation failed due to a processing error.');
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('Generation failed due to an unexpected error.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRetry = async () => {
    if (!datasetId || retrying || metadata?.status !== 'FAILED') return;

    setRetrying(true);
    setErrorMsg(null);
    try {
      await api.post(`/datasets/${datasetId}/retry`, {});

      // On successful retry, refetch dataset data (status will become MAPPED)
      await fetchDatasetData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setNotFound(true);
        } else if (err.status === 409) {
          setErrorMsg('Dataset state changed or failure is not retryable. Please refresh.');
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('Retry failed due to an unexpected error.');
      }
    } finally {
      setRetrying(false);
    }
  };

  if (notFound) {
    return (
      <EmptyState 
        icon="search_off" 
        title="Dataset Not Found" 
        description="The requested dataset does not exist or you do not have permission to view it." 
      />
    );
  }

  if (loading && !metadata) {
    return <LoadingState title="Loading Dataset..." />;
  }

  if (errorMsg) {
    return (
      <EmptyState 
        icon="error" 
        title="An Error Occurred" 
        description={errorMsg}
      />
    );
  }

  if (!metadata) {
    return null;
  }

  const renderStatusUI = () => {
    switch (metadata.status) {
      case 'UPLOADED':
        return (
          <EmptyState 
            icon="upload_file" 
            title="Dataset Uploaded" 
            description="The dataset must be parsed before column mapping can begin." 
          />
        );
      case 'MAPPING_REQUIRED':
        return (
          <EmptyState 
            icon="schema" 
            title="Mapping Required" 
            description="Please complete column mapping for this dataset before generating intelligence." 
          />
        );
      case 'MAPPED':
        return (
          <EmptyState 
            icon="auto_awesome" 
            title="Dataset Ready for Intelligence" 
            description="The dataset has been mapped and is ready for AI intelligence generation." 
            action={
              <Button 
                variant="primary" 
                onClick={handleGenerate} 
                disabled={generating}
                aria-busy={generating}
                className="mt-4 gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {generating ? 'hourglass_empty' : 'auto_awesome'}
                </span>
                {generating ? 'Generating...' : 'Generate Intelligence'}
              </Button>
            }
          />
        );
      case 'PROCESSING':
        return (
          <div className="flex flex-col items-center">
            <LoadingState 
              title="Processing Intelligence..." 
              description="Gemini is currently processing the data. This may take a few moments." 
            />
            <Button 
              variant="outline" 
              onClick={fetchDatasetData} 
              disabled={loading}
              className="mt-4 gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh Status
            </Button>
          </div>
        );
      case 'FAILED': {
        const retryableCodes = ['AI_CONFIGURATION', 'AI_PROVIDER', 'AI_RESPONSE_VALIDATION', 'STORAGE', 'PERSISTENCE'];
        const isRetryable = metadata.failureCode ? retryableCodes.includes(metadata.failureCode) : false;

        return (
          <EmptyState 
            icon="error" 
            title="Analysis Failed" 
            description={metadata.failureReason || 'An unknown failure occurred during processing.'} 
            action={
              isRetryable ? (
                <Button
                  variant="primary"
                  onClick={handleRetry}
                  disabled={retrying}
                  aria-busy={retrying}
                  className="mt-4 gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {retrying ? 'hourglass_empty' : 'replay'}
                  </span>
                  {retrying ? 'Retrying...' : 'Retry Processing'}
                </Button>
              ) : undefined
            }
          />
        );
      }
      case 'READY':
        if (!intelligence) {
          return <LoadingState title="Loading Intelligence..." />;
        }
        return renderReadyUI(intelligence);
      default:
        return (
          <EmptyState 
            icon="help" 
            title="Unknown Status" 
            description={`Unrecognized dataset state: ${metadata.status}`} 
          />
        );
    }
  };

  const renderReadyUI = (intel: FrontendDatasetIntelligence) => {
    const { profile, insights } = intel;

    return (
      <div className="flex flex-col gap-8">
        {/* Profile Section */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <KPICard
              title="Row Count"
              value={profile.rowCount !== null ? profile.rowCount : 'N/A'}
              icon="table_rows"
            />
            <KPICard
              title="Column Count"
              value={profile.columnCount !== null ? profile.columnCount : 'N/A'}
              icon="view_column"
            />
          </div>
        )}

        {/* Profile JSON Dump (Safe representation) */}
        {profile && (
          <DashboardCard title="Dataset Profile Metadata" className="border-outline-variant/30 shadow-ambient-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded border border-outline-variant/20 overflow-x-auto">
                <h4 className="font-label-md text-on-surface mb-2">Column Metadata</h4>
                <pre className="text-xs text-on-surface-variant font-mono">
                  {JSON.stringify(profile.columnMetadata, null, 2)}
                </pre>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded border border-outline-variant/20 overflow-x-auto">
                <h4 className="font-label-md text-on-surface mb-2">Summary Statistics</h4>
                <pre className="text-xs text-on-surface-variant font-mono">
                  {JSON.stringify(profile.summaryStatistics, null, 2)}
                </pre>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Insights Section */}
        <div>
          <h3 className="text-headline-md font-headline-md text-on-surface mb-4">Extracted Insights</h3>
          {insights.length === 0 ? (
            <EmptyState icon="analytics" title="No Insights Found" description="The intelligence generation completed, but no actionable insights were extracted." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {insights.map((insight, idx) => {
                const compositeKey = `insight-${idx}-${insight.type}-${insight.title.substring(0, 15).replace(/\s+/g, '')}`;
                return (
                  <DashboardCard key={compositeKey} title={insight.title} className="border-outline-variant/30 shadow-ambient-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-primary border-primary bg-primary/10">
                          {insight.type}
                        </Badge>
                        {(insight.competitorId || insight.productId) && (
                          <Badge variant="default" className="text-tertiary border border-tertiary/30 bg-tertiary/10 gap-1 text-[11px]">
                            <span className="material-symbols-outlined text-[14px]">link</span>
                            Linked Entity
                          </Badge>
                        )}
                      </div>
                    {insight.confidence && (
                      <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-variant/20 px-2 py-0.5 rounded">
                        Confidence: {insight.confidence}
                      </span>
                    )}
                  </div>
                    <p className="text-body-md font-body-md text-on-surface mt-2 break-words">
                      {insight.summary}
                    </p>
                    {insight.evidence && (insight.evidence.sourceColumns.length > 0 || insight.evidence.sampleRowIndices.length > 0) && (
                      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col gap-2">
                        <span className="text-label-sm font-label-sm font-semibold text-on-surface-variant">Evidence & Grounding</span>
                        {insight.evidence.sourceColumns.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-label-sm text-on-surface-variant/80">Source Columns:</span>
                            {insight.evidence.sourceColumns.map((col) => (
                              <span key={col} className="inline-block max-w-xs truncate bg-surface-variant/30 text-on-surface-variant px-2 py-0.5 rounded text-label-sm font-mono">
                                {col}
                              </span>
                            ))}
                          </div>
                        )}
                        {insight.evidence.sampleRowIndices.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-label-sm text-on-surface-variant/80">Sample Rows:</span>
                            {insight.evidence.sampleRowIndices.map((idx) => (
                              <span key={idx} className="inline-block bg-surface-variant/20 text-on-surface px-2 py-0.5 rounded text-label-sm font-mono">
                                Row #{idx + 1}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </DashboardCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader 
        title="Dataset Intelligence" 
        description={`Viewing analysis for dataset: ${metadata?.originalFilename || 'Unknown'}`}
        className="mb-8"
      >
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/30">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Status:</span>
          <span className="text-label-md font-label-md font-bold text-primary">{metadata?.status}</span>
        </div>
      </PageHeader>
      
      {renderStatusUI()}
    </>
  );
}
