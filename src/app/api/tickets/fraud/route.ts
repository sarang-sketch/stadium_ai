import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { FraudScoringSchema } from '@/lib/validators';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';
import { FraudDetectionService } from '@/services/ticketing.service';
import { FraudReviewRepository } from '@/repositories/ticket.repository';

/**
 * GET /api/tickets/fraud
 * Admin only. Returns the fraud dashboard: flagged reviews sorted by risk
 * score descending.
 */
export const GET = withApiHandler(
  async () => {
    const repo = new FraudReviewRepository();
    const flagged = await repo.findFlaggedReviews();
    const entries = [...flagged].sort((a, b) => b.riskScore - a.riskScore);

    return NextResponse.json({
      entries,
      generatedAt: new Date().toISOString(),
    });
  },
  { requireRole: 'admin' }
);

/**
 * POST /api/tickets/fraud
 * Admin only. Scores a ticket transaction for fraud risk via the
 * FraudDetectionService (flagship). Genuinely invokes the service and
 * returns its typed result including the `source: 'gemini' | 'heuristic'`
 * field.
 */
export const POST = withApiHandler(
  async (_req, ctx) => {
    const { transactionId, signals } = ctx.body;
    const service = new FraudDetectionService(createGeminiAdapter());
    const result = await service.scoreTransaction(transactionId, signals);

    return NextResponse.json(result);
  },
  { schema: FraudScoringSchema, requireRole: 'admin' }
);
