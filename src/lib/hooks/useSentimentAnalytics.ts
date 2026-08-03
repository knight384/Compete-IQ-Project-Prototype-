import * as React from 'react';
import { api } from '@/lib/api-client';
import type { SentimentAnalyticsDto } from '@/lib/types/intelligence-analytics';

export interface UseSentimentAnalyticsResult {
  data: SentimentAnalyticsDto | null;
  loading: boolean;
  error: string | null;
}

export function useSentimentAnalytics(competitorId?: string): UseSentimentAnalyticsResult {
  const [data, setData] = React.useState<SentimentAnalyticsDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const query = competitorId ? `?competitorId=${encodeURIComponent(competitorId)}` : '';
        const result = await api.get<SentimentAnalyticsDto>(`/analytics/sentiment${query}`);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load sentiment shift analytics.';
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
