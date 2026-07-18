import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { createVisionAdapter } from '@/adapters/vision.adapter';
import { CrowdDensityService } from '@/services/stadium.service';
import { ValidationError } from '@/utils/error-handler';

/**
 * GET /api/stadium/crowd-density
 * Public. Predicts crowd density for a zone via CrowdDensityService, which
 * uses the Vision adapter with a heuristic fallback. Returns the typed
 * prediction including its `source` field.
 */
export const GET = withApiHandler(async (req) => {
  const params = req.nextUrl.searchParams;
  const zoneId = params.get('zoneId');
  if (!zoneId) {
    throw new ValidationError('zoneId query parameter is required.');
  }

  const ticketsSold = Math.max(0, Number(params.get('ticketsSold') ?? '0') || 0);
  const imageUrls = params.getAll('imageUrl');

  const service = new CrowdDensityService(createVisionAdapter());
  const prediction = await service.predictDensity(zoneId, imageUrls, ticketsSold);

  return NextResponse.json(prediction);
});
