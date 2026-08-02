import * as React from 'react';
import { api } from '@/lib/api-client';
import type { DashboardAnalyticsDto } from '@/lib/types/dashboard-analytics';

export interface UseDashboardAnalyticsResult {
  data: DashboardAnalyticsDto | null;
  loading: boolean;
  error: string | null;
}

/**
 * useDashboardAnalytics
 *
 * Fetches aggregate dashboard analytics from GET /api/v1/analytics/dashboard.
 * Handles loading, error, and empty-organization states.
 *
 * Returns:
 *   loading = true  while the request is in flight
 *   error != null   if the request failed (data will be null)
 *   data != null    when the request succeeded (may contain zero-value fields for an empty org)
 */
export function useDashboardAnalytics(): UseDashboardAnalyticsResult {
  const [data, setData] = React.useState<DashboardAnalyticsDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const result = await api.get<DashboardAnalyticsDto>('/analytics/dashboard');
        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load analytics data.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
