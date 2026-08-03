"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { KPICard, DashboardCard } from "@/components/shared/DashboardCards";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { api } from "@/lib/api-client";
import { LoadingState, EmptyState } from "@/components/shared/Feedback";
import { useSession } from "next-auth/react";
import { ProductFormModal, FeatureFormModal, DeleteConfirmModal } from "@/components/competitors/CompetitorModals";

interface CompetitorDetail {
  id: string;
  name: string;
  domain: string | null;
  logoText: string;
  logoColor: string;
  industry: string | null;
  status: string;
  score: number;
  updatedAt: string | Date;
}

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  competitorId: string;
}

interface FeatureDetail {
  id: string;
  name: string;
  description: string | null;
  status: string;
  productId: string;
}

function ProductFeaturesSection({ product, canEdit, canDelete, onRefresh }: {
  product: ProductDetail;
  canEdit: boolean;
  canDelete: boolean;
  onRefresh: () => void;
}) {
  const [features, setFeatures] = React.useState<FeatureDetail[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddFeatureOpen, setIsAddFeatureOpen] = React.useState(false);
  const [editFeature, setEditFeature] = React.useState<FeatureDetail | null>(null);
  const [deleteFeature, setDeleteFeature] = React.useState<FeatureDetail | null>(null);

  const loadFeatures = React.useCallback(async () => {
    try {
      const data = await api.get<FeatureDetail[]>(`/features?productId=${product.id}`);
      setFeatures(data);
    } catch {
      // Ignore or log error
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  React.useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleCreateFeature = async (data: { name: string; description?: string; status: string }) => {
    await api.post('/features', { ...data, productId: product.id });
    await loadFeatures();
  };

  const handleEditFeature = async (data: { name: string; description?: string; status: string }) => {
    if (!editFeature) return;
    await api.put(`/features/${editFeature.id}`, data);
    await loadFeatures();
  };

  const handleDeleteFeature = async () => {
    if (!deleteFeature) return;
    await api.delete(`/features/${deleteFeature.id}`);
    await loadFeatures();
  };

  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant/50 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-label-lg font-label-lg text-on-surface font-semibold">{product.name}</h4>
          {product.description && <p className="text-body-sm font-body-sm text-on-surface-variant">{product.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setIsAddFeatureOpen(true)} className="h-8 text-xs gap-1">
              <span className="material-symbols-outlined text-[14px]">add</span> Add Feature
            </Button>
          )}
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {loading ? (
          <span className="text-xs text-on-surface-variant">Loading features...</span>
        ) : features.length === 0 ? (
          <span className="text-xs text-on-surface-variant italic">No features tracked yet</span>
        ) : (
          features.map((feat) => (
            <div key={feat.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-outline-variant bg-surface text-body-sm text-on-surface group">
              <span className="font-medium">{feat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                feat.status === 'Available' ? 'bg-tertiary-container/30 text-tertiary' :
                feat.status === 'Beta' ? 'bg-secondary-container/30 text-secondary' : 'bg-error/10 text-error'
              }`}>{feat.status}</span>

              {canEdit && (
                <button onClick={() => setEditFeature(feat)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-primary transition-opacity" title="Edit Feature">
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              )}
              {canDelete && (
                <button onClick={() => setDeleteFeature(feat)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-error transition-opacity" title="Delete Feature">
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <FeatureFormModal
        isOpen={isAddFeatureOpen}
        onClose={() => setIsAddFeatureOpen(false)}
        onSubmit={handleCreateFeature}
        title={`Add Feature to ${product.name}`}
      />

      <FeatureFormModal
        isOpen={!!editFeature}
        onClose={() => setEditFeature(null)}
        onSubmit={handleEditFeature}
        initialData={editFeature || undefined}
        title="Edit Feature"
      />

      <DeleteConfirmModal
        isOpen={!!deleteFeature}
        onClose={() => setDeleteFeature(null)}
        onConfirm={handleDeleteFeature}
        title="Delete Feature"
        message={`Are you sure you want to delete feature "${deleteFeature?.name}"?`}
      />
    </div>
  );
}

export default function CompetitorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;

  const canCreate = userRole === "ADMIN" || userRole === "ANALYST";
  const canEdit = userRole === "ADMIN" || userRole === "ANALYST";
  const canDelete = userRole === "ADMIN";

  const [competitor, setCompetitor] = React.useState<CompetitorDetail | null>(null);
  const [products, setProducts] = React.useState<ProductDetail[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modals for Products
  const [isAddProductOpen, setIsAddProductOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<ProductDetail | null>(null);
  const [deleteProduct, setDeleteProduct] = React.useState<ProductDetail | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const data = await api.get<CompetitorDetail>(`/competitors/${id}`);
      setCompetitor(data);
      
      try {
        const productsData = await api.get<ProductDetail[]>(`/products?competitorId=${id}`);
        setProducts(productsData);
      } catch (prodErr) {
        console.error("Failed to load products", prodErr);
      }
      
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load competitor details');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProduct = async (data: { name: string; description?: string }) => {
    await api.post('/products', { ...data, competitorId: id });
    await loadData();
  };

  const handleEditProduct = async (data: { name: string; description?: string }) => {
    if (!editProduct) return;
    await api.put(`/products/${editProduct.id}`, data);
    await loadData();
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    await api.delete(`/products/${deleteProduct.id}`);
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <LoadingState title="Loading Competitor Details..." />
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <EmptyState 
          icon="error" 
          title="Competitor Not Found" 
          description={error || "The competitor you are looking for does not exist or has been removed."}
        />
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[
          { label: "Competitors", href: "/competitors" },
          { label: competitor.name }
        ]} />
      </div>

      {/* Profile Header */}
      <div className="bg-surface-container-lowest rounded-card p-6 shadow-ambient-1 border border-surface-container-highest mb-gutter flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-20 h-20 rounded-xl border border-outline-variant flex items-center justify-center p-2 shadow-sm ${competitor.logoColor || 'bg-surface text-on-surface'}`}>
             <span className="text-3xl font-bold">{competitor.logoText || competitor.name.charAt(0)}</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">{competitor.name}</h2>
              <span className={`bg-tertiary-container/10 text-tertiary text-label-sm font-label-sm px-2 py-1 rounded-full flex items-center gap-1 border border-tertiary/20`}>
                <span className="material-symbols-outlined text-[14px]">
                  {competitor.status === "Active" ? "monitoring" : "warning"}
                </span>
                {competitor.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-body-sm font-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">domain</span> {competitor.industry || "General Industry"}</span>
              {competitor.domain && (
                <a className="flex items-center gap-1 text-primary hover:underline" href={`https://${competitor.domain}`} target="_blank" rel="noreferrer">
                  <span className="material-symbols-outlined text-[16px]">language</span> {competitor.domain}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-primary border-outline-variant shadow-none gap-2">
            <span className="material-symbols-outlined">download</span> Report
          </Button>
          {canCreate && (
            <Button variant="primary" onClick={() => setIsAddProductOpen(true)} className="gap-2 shadow-sm">
              <span className="material-symbols-outlined">add</span> Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-gutter">
        <KPICard 
          title="Product Count"
          value={products.length.toString()}
          icon="inventory_2"
          iconClassName="bg-surface text-secondary"
          trend={{ value: "Live products", label: "", isPositive: products.length > 0 }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Market Score"
          value={<>{competitor.score}<span className="text-headline-sm text-outline">/100</span></>}
          icon="show_chart"
          iconClassName="bg-surface text-primary"
          trend={{ value: "Stable", label: "", isNeutral: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Feature Gap"
          value={<>--<span className="text-headline-sm text-outline"> missing</span></>}
          icon="compare_arrows"
          iconClassName="bg-surface text-error"
          trend={{ value: "Not calculated yet", label: "", isNeutral: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
        <KPICard 
          title="Pricing Index"
          value="N/A"
          icon="attach_money"
          iconClassName="bg-surface text-tertiary"
          trend={{ value: "Data unavailable", label: "", isNeutral: true }}
          className="border border-surface-container-highest shadow-ambient-1"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Products & Features Section */}
          <DashboardCard
            title="Products & Tracked Features"
            action={
              canCreate ? (
                <Button variant="outline" size="sm" onClick={() => setIsAddProductOpen(true)} className="h-8 text-xs gap-1">
                  <span className="material-symbols-outlined text-[14px]">add</span> Add Product
                </Button>
              ) : undefined
            }
          >
            {products.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-body-sm">
                No products tracked for {competitor.name} yet. Click &quot;Add Product&quot; to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((prod) => (
                  <div key={prod.id} className="relative group">
                    <ProductFeaturesSection
                      product={prod}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onRefresh={loadData}
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <button onClick={() => setEditProduct(prod)} className="p-1 text-on-surface-variant hover:text-primary" title="Edit Product">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => setDeleteProduct(prod)} className="p-1 text-on-surface-variant hover:text-error" title="Delete Product">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Right Sidebar Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <DashboardCard title="Threat Level (Mock)" titleIcon={<span className="material-symbols-outlined text-error">warning</span>} className="border-surface-container-highest shadow-ambient-1">
            <div className="relative h-4 bg-surface rounded-full overflow-hidden mb-2">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-tertiary via-secondary to-error w-3/4 rounded-full"></div>
            </div>
            <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-6">
              <span>Low</span>
              <span className="text-error font-bold text-label-md">High (75%)</span>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Product Modals */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleCreateProduct}
        title={`Add Product for ${competitor.name}`}
      />

      <ProductFormModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        onSubmit={handleEditProduct}
        initialData={editProduct || undefined}
        title="Edit Product"
      />

      <DeleteConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete product "${deleteProduct?.name}"? All associated features will be permanently removed.`}
      />
    </>
  );
}
