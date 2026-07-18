import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';
import { QueuePredictionService } from '@/services/stadium.service';
import { ValidationError } from '@/utils/error-handler';

/**
 * GET /api/stadium/queue-prediction
 * Public. Estimates the wait time at a gate/concession via
 * QueuePredictionService (Gemini with a heuristic fallback). Returns the
 * typed prediction including its `source` field.
 */
export const GET = withApiHandler(async (req) => {
  const params = req.nextUrl.searchParams;
  const gateId = params.get('gateId');
  if (!gateId) {
    throw new ValidationError('gateId query parameter is required.');
  }

  const currentOccupancy = Math.max(0, Number(params.get('currentOccupancy') ?? '0') || 0);

  const service = new QueuePredictionService(createGeminiAdapter());
  const prediction = await service.estimateWaitTime(gateId, currentOccupancy, []);

  return NextResponse.json(prediction);
});
