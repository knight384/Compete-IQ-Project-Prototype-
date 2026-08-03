import * as React from 'react';
import { api } from '@/lib/api-client';
import type { FeatureGapAnalyticsDto } from '@/lib/types/intelligence-analytics';

export interface UseFeatureGapAnalyticsResult {
  data: FeatureGapAnalyticsDto | null;
  loading: boolean;
  error: string | null;
}

export function useFeatureGapAnalytics(competitorId?: string): UseFeatureGapAnalyticsResult {
  const [data, setData] = React.useState<FeatureGapAnalyticsDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const query = competitorId ? `?competitorId=${encodeURIComponent(competitorId)}` : '';
        const result = await api.get<FeatureGapAnalyticsDto>(`/analytics/feature-gaps${query}`);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load feature gap insights.';
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
  }, [competitorId]);

  return { data, loading, error };
}
