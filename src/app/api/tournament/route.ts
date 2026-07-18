import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { TournamentCreationSchema } from '@/lib/validators';
import { TournamentRepository } from '@/repositories/tournament.repository';
import type { Tournament } from '@/types/tournament.types';
import type { PaginatedResult } from '@/types/api.types';

/**
 * GET /api/tournament
 * Public. Lists tournaments as a paginated result ordered as stored.
 */
export const GET = withApiHandler(async (req) => {
  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? '20') || 20));

  const repo = new TournamentRepository();
  const all = await repo.findAll();
  const items = all.slice((page - 1) * pageSize, page * pageSize);

  const body: PaginatedResult<Tournament> = {
    items,
    total: all.length,
    page,
    pageSize,
  };
  return NextResponse.json(body);
});

/**
 * POST /api/tournament
 * Admin only. Creates a tournament and returns the persisted record.
 */
export const POST = withApiHandler(
  async (_req, ctx) => {
    const { name, startDate, endDate, location } = ctx.body;
    const repo = new TournamentRepository();
    const id = await repo.create({ name, startDate, endDate, venue: location });

    const created: Tournament = { id, name, startDate, endDate, venue: location };
    return NextResponse.json(created, { status: 201 });
  },
  { schema: TournamentCreationSchema, requireRole: 'admin' }
);
