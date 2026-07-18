import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { PricingRuleSchema } from '@/lib/validators';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';
import { PricingEngine } from '@/services/ticketing.service';
import { PricingRuleRepository } from '@/repositories/ticket.repository';
import { ValidationError } from '@/utils/error-handler';
import type { PricingRule } from '@/types/ticket.types';

/** Parses a numeric query parameter, throwing a ValidationError when absent/invalid. */
function requiredNumber(value: string | null, name: string): number {
  const parsed = Number(value);
  if (value === null || !Number.isFinite(parsed)) {
    throw new ValidationError(`${name} query parameter must be a valid number.`);
  }
  return parsed;
}

/**
 * GET /api/tickets/pricing
 * Public. Computes a dynamic ticket price via the PricingEngine (flagship).
 * Genuinely invokes the engine and returns its typed result including the
 * `source: 'gemini' | 'heuristic'` field.
 */
export const GET = withApiHandler(async (req) => {
  const params = req.nextUrl.searchParams;
  const basePrice = requiredNumber(params.get('basePrice'), 'basePrice');
  const occupancyRate = requiredNumber(params.get('occupancyRate'), 'occupancyRate');
  const daysToEvent = requiredNumber(params.get('daysToEvent'), 'daysToEvent');
  const minPrice = requiredNumber(params.get('minPrice'), 'minPrice');
  const maxPrice = requiredNumber(params.get('maxPrice'), 'maxPrice');

  const rule: PricingRule = {
    id: params.get('ruleId') ?? 'ad-hoc',
    tournamentId: params.get('tournamentId') ?? 'unknown',
    category: params.get('category') ?? 'general',
    minPrice,
    maxPrice,
  };

  const engine = new PricingEngine(createGeminiAdapter());
  const result = await engine.calculatePrice(basePrice, occupancyRate, daysToEvent, rule);

  return NextResponse.json(result);
});

/**
 * POST /api/tickets/pricing
 * Admin only. Persists a pricing rule for a tournament seat category.
 */
export const POST = withApiHandler(
  async (_req, ctx) => {
    const { tournamentId, category, minPrice, maxPrice } = ctx.body;
    const repo = new PricingRuleRepository();

    const ruleData: Omit<PricingRule, 'id'> = { tournamentId, category, minPrice, maxPrice };
    const id = await repo.create(ruleData);

    const created: PricingRule = { id, ...ruleData };
    return NextResponse.json(created, { status: 201 });
  },
  { schema: PricingRuleSchema, requireRole: 'admin' }
);
