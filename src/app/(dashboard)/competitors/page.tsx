"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { PageHeader } from "@/components/shared/PageLayout"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { LoadingState, EmptyState } from "@/components/shared/Feedback"

interface CompetitorData {
  id: string;
  name: string;
  domain: string | null;
  logoText: string;
  logoColor: string;
  industry: string | null;
  status: string;
  score: number;
  updatedAt: string | Date;
  products?: { id: string; name: string }[];
}

function CompetitorProductsCell({ competitorId }: { competitorId: string }) {
  const [products, setProducts] = React.useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const data = await api.get<{ id: string; name: string }[]>(`/products?competitorId=${competitorId}`);
        setProducts(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [competitorId]);

  if (loading) {
    return <span className="text-on-surface-variant text-xs">Loading...</span>;
  }
  
  if (error) {
    return <span className="text-error text-xs">Failed to load</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {products.length > 0 ? products.map((p) => (
        <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs border border-outline-variant text-on-surface-variant">{p.name}</span>
      )) : (
        <span className="text-on-surface-variant text-xs">No products</span>
      )}
    </div>
  );
}

export default function CompetitorListPage() {
  const [competitors, setCompetitors] = React.useState<CompetitorData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadCompetitors() {
      try {
        const data = await api.get<CompetitorData[]>('/competitors');
        setCompetitors(data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load competitors');
        }
      } finally {
        setLoading(false);
      }
    }
    loadCompetitors();
  }, []);

  return (
    <>
      <PageHeader 
        title="Competitor Intelligence" 
        description="Manage and track your competitive landscape"
        className="mb-8"
      >
        <Button variant="outline" className="h-10 px-4 text-on-surface shadow-ambient-1 gap-2">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Filter
        </Button>
        <Button variant="primary" className="h-10 px-4 shadow-ambient-1 gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Competitor
        </Button>
      </PageHeader>

      <div className="bg-surface-container-lowest rounded-card shadow-ambient-1 border border-surface-variant overflow-hidden flex flex-col flex-1">
        {/* Table Toolbar */}
        <div className="p-4 md:px-6 flex items-center justify-between border-b border-surface-variant bg-surface/50">
          <div className="flex items-center gap-3">
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Bulk Actions:</span>
            <button className="text-label-md font-label-md text-primary-container hover:text-primary transition-colors disabled:opacity-50" disabled>Compare Selected</button>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <button className="text-label-md font-label-md text-error hover:text-on-error-container transition-colors disabled:opacity-50" disabled>Pause Tracking</button>
          </div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
            <span>Showing {competitors.length > 0 ? 1 : 0}-{competitors.length} of {competitors.length}</span>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto table-scroll flex-1 relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
              <LoadingState title="Loading Competitors" />
            </div>
          )}
          {!loading && error && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
              <EmptyState icon="error" title="Error" description={error} />
            </div>
          )}
          {!loading && !error && competitors.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest z-10">
              <EmptyState icon="business" title="No Competitors" description="Add your first competitor to start tracking." />
            </div>
          )}

          <Table className="w-full text-left min-w-[1000px]">
            <TableHeader>
              <TableRow className="border-b border-surface-variant hover:bg-transparent">
                <TableHead className="w-12 px-6">
                  <input type="checkbox" className="rounded border-outline-variant text-primary-container focus:ring-primary-container/20 w-4 h-4 cursor-pointer" />
                </TableHead>
                <TableHead className="px-6 font-semibold">Company</TableHead>
                <TableHead className="px-6 font-semibold">Industry</TableHead>
                <TableHead className="px-6 font-semibold">Products</TableHead>
                <TableHead className="px-6 font-semibold">Status</TableHead>
                <TableHead className="px-6 font-semibold">Market Score</TableHead>
                <TableHead className="px-6 font-semibold">Last Updated</TableHead>
                <TableHead className="px-6 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-surface-variant bg-surface-container-lowest">
              {competitors.map((comp) => {
                const statusVariant = comp.status === "Active" ? "success" : "error";
                const formattedDate = new Date(comp.updatedAt).toLocaleDateString();

                return (
                  <TableRow key={comp.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <TableCell className="px-6">
                      <input type="checkbox" className="rounded border-outline-variant text-primary-container focus:ring-primary-container/20 w-4 h-4 cursor-pointer" />
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded border flex items-center justify-center font-bold text-lg ${comp.logoColor || 'bg-surface-variant text-on-surface'}`}>
                          {comp.logoText || comp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-label-md font-label-md text-on-surface font-semibold">{comp.name}</div>
                          <div className="text-label-sm font-label-sm text-on-surface-variant">{comp.domain || "N/A"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <Badge variant="default" className="bg-surface-container-high text-on-surface font-medium">{comp.industry || "General"}</Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <CompetitorProductsCell competitorId={comp.id} />
                    </TableCell>
                    <TableCell className="px-6">
                      <Badge variant={statusVariant as any} className="gap-1.5 rounded-full font-medium">
                        {comp.status === "Active" ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        ) : (
                          <span className="material-symbols-outlined text-[12px]">warning</span>
                        )}
                        {comp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-surface-variant rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${comp.status === "Active" ? "bg-primary-container" : "bg-secondary"}`} style={{ width: `${comp.score}%` }}></div>
                        </div>
                        <span className="text-label-sm font-label-sm text-on-surface font-semibold">{comp.score}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 text-body-sm font-body-sm text-on-surface-variant">{formattedDate}</TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/competitors/${comp.id}`}>
                          <button className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors" title="View Details">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </Link>
                        <button className="p-1.5 rounded text-on-surface-variant hover:text-primary-container hover:bg-primary-fixed/20 transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-surface-variant flex items-center justify-between bg-surface-container-lowest">
          <button className="flex items-center gap-1 px-3 py-1.5 text-label-sm font-label-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined text-[18px]">chevron_left</span> Previous
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded flex items-center justify-center bg-primary-container/10 text-primary-container font-medium text-sm">1</button>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 text-label-sm font-label-sm text-on-surface hover:bg-surface-container rounded transition-colors">
            Next <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </>
  );
}
