import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { FixtureGenerationSchema } from '@/lib/validators';
import { MatchRepository } from '@/repositories/tournament.repository';
import { SchedulerService } from '@/services/tournament.service';
import type { Match } from '@/types/tournament.types';
import type { PaginatedResult } from '@/types/api.types';

/**
 * GET /api/tournament/[id]/matches
 * Public. Lists matches for a tournament as a paginated result.
 */
export const GET = withApiHandler(async (req, ctx) => {
  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? '20') || 20));

  const repo = new MatchRepository();
  const all = await repo.findMatchesByTournament(ctx.params.id);
  const items = all.slice((page - 1) * pageSize, page * pageSize);

  const body: PaginatedResult<Match> = {
    items,
    total: all.length,
    page,
    pageSize,
  };
  return NextResponse.json(body);
});

/**
 * POST /api/tournament/[id]/matches
 * Admin only. Generates round-robin fixtures for the tournament.
 */
export const POST = withApiHandler(
  async (_req, ctx) => {
    const { teams, venues, startDate } = ctx.body;
    const scheduler = new SchedulerService();
    const fixtures = scheduler.generateFixtures(teams, venues, new Date(startDate));

    return NextResponse.json(
      {
        tournamentId: ctx.params.id,
        fixtures,
        generatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  },
  { schema: FixtureGenerationSchema, requireRole: 'admin' }
);
