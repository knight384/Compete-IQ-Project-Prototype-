"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';
import { FrontendDatasetMetadata } from '@/lib/types/dataset';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageLayout';
import { DashboardCard } from '@/components/shared/DashboardCards';

type WizardState = 'SELECT_FILE' | 'UPLOADING' | 'PARSING' | 'MAPPING' | 'CONFIRMING_MAPPING' | 'COMPLETE' | 'ERROR';

type SemanticField = 
  | 'COMPETITOR_NAME'
  | 'PRODUCT_NAME'
  | 'FEATURE_NAME'
  | 'PRICE'
  | 'CURRENCY'
  | 'RATING'
  | 'REVIEW_TEXT'
  | 'DATE'
  | 'CATEGORY'
  | 'DESCRIPTION'
  | 'URL'
  | 'IGNORE';

interface MappingSuggestion {
  sourceColumn: string;
  suggestedField: SemanticField | null;
  confidence: 'HIGH' | 'NONE';
}

export default function DatasetCreationWizard() {
  const [wizardState, setWizardState] = useState<WizardState>('SELECT_FILE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, SemanticField>>({});
  
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const startUpload = async () => {
    if (!file) return;
    
    setWizardState('UPLOADING');
    setErrorMsg(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const metadata = await api.postForm<FrontendDatasetMetadata>('/datasets', formData);
      setDatasetId(metadata.id);
      
      // Auto transition to parse
      await triggerParse(metadata.id);
    } catch (err: unknown) {
      handleError(err, 'Upload failed. Please try a different file.');
      setWizardState('SELECT_FILE');
    }
  };

  const triggerParse = async (id: string) => {
    setWizardState('PARSING');
    try {
      const parseResult = await api.post<{ datasetId: string; status: string; headers: string[] }>(`/datasets/${id}/parse`, {});
      setHeaders(parseResult.headers);
      
      await fetchMappingSuggestions(id, parseResult.headers);
    } catch (err: unknown) {
      handleError(err, 'Parsing failed.');
      // Cannot automatically re-upload if parse fails. Stay in error state.
      setWizardState('ERROR');
    }
  };

  const fetchMappingSuggestions = async (id: string, datasetHeaders: string[]) => {
    try {
      const result = await api.get<{ datasetId: string; suggestions: MappingSuggestion[] }>(`/datasets/${id}/mapping-suggestions`);
      
      const initialMappings: Record<string, SemanticField> = {};
      datasetHeaders.forEach(header => {
        const suggestion = result.suggestions.find(s => s.sourceColumn === header);
        if (suggestion && suggestion.confidence === 'HIGH' && suggestion.suggestedField) {
          initialMappings[header] = suggestion.suggestedField;
        } else {
          initialMappings[header] = 'IGNORE';
        }
      });
      
      setMappings(initialMappings);
      setWizardState('MAPPING');
    } catch (err: unknown) {
      handleError(err, 'Failed to fetch mapping suggestions.');
      setWizardState('ERROR');
    }
  };

  const handleMappingChange = (header: string, field: SemanticField) => {
    setMappings(prev => ({
      ...prev,
      [header]: field
    }));
  };

  const confirmMapping = async () => {
    if (!datasetId) return;

    // Local validation: Check for singleton violations
    const usedFields = new Set<string>();
    let duplicateError = false;

    Object.values(mappings).forEach(field => {
      if (field !== 'IGNORE') {
        if (usedFields.has(field)) {
          duplicateError = true;
        }
        usedFields.add(field);
      }
    });

    if (duplicateError) {
      setErrorMsg('Duplicate mapping detected. You can only map one column to a specific semantic field (except IGNORE).');
      return;
    }

    setWizardState('CONFIRMING_MAPPING');
    setErrorMsg(null);

    const mappingsArray = Object.entries(mappings).map(([sourceColumn, semanticField]) => ({
      sourceColumn,
      semanticField
    }));

    try {
      await api.post<FrontendDatasetMetadata>(`/datasets/${datasetId}/map-columns`, { mappings: mappingsArray });
      setWizardState('COMPLETE');
      router.push(`/datasets/${datasetId}`);
    } catch (err: unknown) {
      handleError(err, 'Mapping confirmation failed.');
      // Preserve selections on validation failure
      setWizardState('MAPPING');
    }
  };

  const handleError = (err: unknown, fallbackMessage: string) => {
    if (err instanceof ApiError) {
      setErrorMsg(err.message);
    } else {
      setErrorMsg(fallbackMessage);
    }
  };

  const renderSelectFile = () => (
    <div className="flex flex-col gap-4">
      <p className="text-body-md text-on-surface-variant mb-4">
        Select a CSV or XLSX file to upload. Maximum size is 10MB.
      </p>
      
      <div className="flex flex-col items-start gap-2">
        <label htmlFor="file-upload" className="font-label-md text-on-surface font-bold">
          Dataset File
        </label>
        <input 
          id="file-upload"
          type="file" 
          accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-on-surface-variant
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-primary/10 file:text-primary
            hover:file:bg-primary/20
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            cursor-pointer"
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button 
          variant="primary" 
          onClick={startUpload}
          disabled={!file}
        >
          Upload & Parse
        </Button>
      </div>
    </div>
  );

  const renderMapping = () => (
    <div className="flex flex-col gap-6">
      <p className="text-body-md text-on-surface-variant">
        We have automatically parsed your dataset. Please confirm how each column maps to our standard semantic fields.
      </p>

      <div className="border border-surface-variant rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-bright">
            <tr className="border-b border-surface-variant">
              <th className="px-4 py-3 font-label-md text-on-surface-variant">Source Column</th>
              <th className="px-4 py-3 font-label-md text-on-surface-variant">Semantic Field</th>
            </tr>
          </thead>
          <tbody className="bg-surface">
            {headers.map(header => (
              <tr key={header} className="border-b border-surface-variant last:border-0">
                <td className="px-4 py-3 font-body-md font-medium truncate max-w-[200px]">
                  {header}
                </td>
                <td className="px-4 py-3">
                  <label htmlFor={`mapping-${header}`} className="sr-only">Map column {header}</label>
                  <select 
                    id={`mapping-${header}`}
                    value={mappings[header] || 'IGNORE'}
                    onChange={(e) => handleMappingChange(header, e.target.value as SemanticField)}
                    className="w-full max-w-[300px] border border-surface-variant rounded-md px-3 py-2 bg-surface text-on-surface focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  >
                    <option value="IGNORE">IGNORE (Do not process)</option>
                    <option value="COMPETITOR_NAME">Competitor Name</option>
                    <option value="PRODUCT_NAME">Product Name</option>
                    <option value="FEATURE_NAME">Feature Name</option>
                    <option value="PRICE">Price</option>
                    <option value="CURRENCY">Currency</option>
                    <option value="RATING">Rating</option>
                    <option value="REVIEW_TEXT">Review Text</option>
                    <option value="DATE">Date</option>
                    <option value="CATEGORY">Category</option>
                    <option value="DESCRIPTION">Description</option>
                    <option value="URL">URL</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <Button 
          variant="primary" 
          onClick={confirmMapping}
        >
          Confirm Mapping
        </Button>
      </div>
    </div>
  );

  const renderAsyncState = (title: string) => (
    <div className="flex flex-col items-center justify-center p-12 gap-4" aria-busy="true">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">{title}</h3>
      <p className="text-body-md font-body-md text-on-surface-variant">Please wait...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader 
        title="Create New Dataset" 
        description="Upload a CSV or XLSX file to begin mapping and extracting intelligence."
      />

      {errorMsg && (
        <div className="bg-error/10 border border-error text-error p-4 rounded-lg flex items-start gap-3" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <div>
            <h3 className="font-label-md font-bold mb-1">An error occurred</h3>
            <p className="text-body-sm font-body-sm">{errorMsg}</p>
          </div>
        </div>
      )}

      <DashboardCard title="Dataset Configuration" className="border-outline-variant/30 shadow-ambient-1">
        {wizardState === 'SELECT_FILE' && renderSelectFile()}
        {wizardState === 'UPLOADING' && renderAsyncState('Uploading Dataset')}
        {wizardState === 'PARSING' && renderAsyncState('Parsing Dataset')}
        {wizardState === 'MAPPING' && renderMapping()}
        {wizardState === 'CONFIRMING_MAPPING' && renderAsyncState('Confirming Mappings')}
        {wizardState === 'COMPLETE' && renderAsyncState('Redirecting...')}
        {wizardState === 'ERROR' && (
          <div className="flex flex-col items-center justify-center p-12 gap-4 text-center">
            <span className="material-symbols-outlined text-error text-4xl">warning</span>
            <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Setup Failed</h3>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-md">
              A critical error occurred while setting up your dataset. You may need to start over with a fresh upload.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Start Over
            </Button>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
