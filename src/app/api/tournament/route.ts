import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { TournamentCreationSchema } from '@/lib/validators';
import { TournamentRepository } from '@/repositories/tournament.repository';
import { parsePagination, paginate } from '@/utils/pagination';
import type { Tournament } from '@/types/tournament.types';

/**
 * GET /api/tournament
 * Public. Lists tournaments as a paginated result ordered as stored.
 */
export const GET = withApiHandler(async (req) => {
  const { page, pageSize } = parsePagination(req.nextUrl.searchParams);

  const repo = new TournamentRepository();
  const all = await repo.findAll();
  const body = paginate<Tournament>(all, page, pageSize);
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
