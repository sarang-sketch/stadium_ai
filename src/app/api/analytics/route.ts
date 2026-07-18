import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { createBigQueryAdapter } from '@/adapters/bigquery.adapter';
import { InsightsService } from '@/services/analytics.service';
import { ValidationError } from '@/utils/error-handler';

/**
 * GET /api/analytics
 * Admin only. Returns dashboard metrics for a tournament, genuinely computed
 * by InsightsService over the BigQuery aggregates adapter.
 */
export const GET = withApiHandler(
  async (req) => {
    const tournamentId = req.nextUrl.searchParams.get('tournamentId');
    if (!tournamentId) {
      throw new ValidationError('tournamentId query parameter is required.');
    }

    const service = new InsightsService(createBigQueryAdapter());
    const metrics = await service.getDashboardMetrics(tournamentId);

    return NextResponse.json({ tournamentId, ...metrics });
  },
  { requireRole: 'admin' }
);
