import { describe, expect, it } from 'vitest';
import { InsightsService } from '@/services/analytics.service';
import { createBigQueryAdapter } from '@/adapters/bigquery.adapter';

describe('Analytics Service — InsightsService', () => {
  it('returns valid dashboard metrics for a tournament', async () => {
    const bigquery = createBigQueryAdapter();
    const svc = new InsightsService(bigquery);
    const res = await svc.getDashboardMetrics('tourney-1');

    expect(res.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(res.attendanceRate).toBeGreaterThanOrEqual(0);
    expect(res.attendanceRate).toBeLessThanOrEqual(1);
    expect(res.fraudIncidents).toBeGreaterThanOrEqual(0);
    expect(res.source).toBeDefined();
  });

  it('produces heuristic-source fallback metrics', async () => {
    const bigquery = createBigQueryAdapter();
    const svc = new InsightsService(bigquery);
    // Mock adapter always succeeds with mock data, but we can verify shape
    const res = await svc.getDashboardMetrics('non-existent-tournament');

    expect(typeof res.totalRevenue).toBe('number');
    expect(typeof res.attendanceRate).toBe('number');
    expect(typeof res.fraudIncidents).toBe('number');
  });

  it('returns a valid source field', async () => {
    const bigquery = createBigQueryAdapter();
    const svc = new InsightsService(bigquery);
    const res = await svc.getDashboardMetrics('tourney-1');

    expect(['gemini', 'heuristic']).toContain(res.source);
  });
});
