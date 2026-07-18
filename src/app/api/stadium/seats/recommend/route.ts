import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { SeatRecommendationPrefSchema } from '@/lib/validators';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';
import { SeatRecommendationService } from '@/services/stadium.service';

/**
 * POST /api/stadium/seats/recommend
 * Authenticated user. Returns ranked seat recommendations via
 * SeatRecommendationService (Gemini with a heuristic fallback). Each
 * recommendation includes its `source` field.
 */
export const POST = withApiHandler(
  async (_req, ctx) => {
    const { budget, groupSize, preferences } = ctx.body;
    const service = new SeatRecommendationService(createGeminiAdapter());
    const recommendations = await service.recommendSeats(budget, groupSize, preferences);

    return NextResponse.json({ recommendations });
  },
  { schema: SeatRecommendationPrefSchema, requireRole: 'user' }
);
