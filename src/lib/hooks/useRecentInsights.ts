import * as React from 'react';
import { api } from '@/lib/api-client';
import type { RecentInsightsResponseDto } from '@/lib/types/intelligence-analytics';

export interface UseRecentInsightsOptions {
  limit?: number;
  type?: string;
  competitorId?: string;
  productId?: string;
}

export interface UseRecentInsightsResult {
  data: RecentInsightsResponseDto | null;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  loadingMore: boolean;
}

export function useRecentInsights(options?: UseRecentInsightsOptions): UseRecentInsightsResult {
  const [data, setData] = React.useState<RecentInsightsResponseDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const buildQuery = React.useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.type) params.set('type', options.type);
      if (options?.competitorId) params.set('competitorId', options.competitorId);
      if (options?.productId) params.set('productId', options.productId);
      if (cursor) params.set('cursor', cursor);
      const str = params.toString();
      return str ? `?${str}` : '';
    },
    [options?.limit, options?.type, options?.competitorId, options?.productId]
  );

  React.useEffect(() => {
    let cancelled = false;

    async function fetchInsights() {
      setLoading(true);
      setError(null);
      try {
        const query = buildQuery();
        const result = await api.get<RecentInsightsResponseDto>(`/analytics/insights${query}`);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load recent insights.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInsights();

    return () => {
      cancelled = true;
    };
  }, [buildQuery]);

  const loadMore = async () => {
    if (!data?.nextCursor || loadingMore || !data.hasMore) return;
    setLoadingMore(true);
    try {
      const query = buildQuery(data.nextCursor);
      const result = await api.get<RecentInsightsResponseDto>(`/analytics/insights${query}`);
      setData((prev) =>
        prev
          ? {
              items: [...prev.items, ...result.items],
              nextCursor: result.nextCursor,
              hasMore: result.hasMore,
            }
          : result
      );
    } catch (err: unknown) {
      // Keep previous data on loadMore failure
      const message = err instanceof Error ? err.message : 'Failed to load more insights.';
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  };

  return { data, loading, error, loadMore, loadingMore };
}
