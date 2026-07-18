import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { FixtureGenerationSchema } from '@/lib/validators';
import { MatchRepository } from '@/repositories/tournament.repository';
import { SchedulerService } from '@/services/tournament.service';
import { parsePagination, paginate } from '@/utils/pagination';
import type { Match } from '@/types/tournament.types';

/**
 * GET /api/tournament/[id]/matches
 * Public. Lists matches for a tournament as a paginated result.
 */
export const GET = withApiHandler(async (req, ctx) => {
  const { page, pageSize } = parsePagination(req.nextUrl.searchParams);

  const repo = new MatchRepository();
  const all = await repo.findMatchesByTournament(ctx.params.id);
  const body = paginate<Match>(all, page, pageSize);
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
