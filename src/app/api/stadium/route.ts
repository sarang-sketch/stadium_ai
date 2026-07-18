import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { StadiumRepository } from '@/repositories/stadium.repository';
import { ValidationError } from '@/utils/error-handler';
import type { Seat } from '@/types/stadium.types';
import type { PaginatedResult } from '@/types/api.types';

/**
 * GET /api/stadium
 * Public. Returns the seat map for a match as a paginated result. Requires a
 * `matchId` query parameter.
 */
export const GET = withApiHandler(async (req) => {
  const params = req.nextUrl.searchParams;
  const matchId = params.get('matchId');
  if (!matchId) {
    throw new ValidationError('matchId query parameter is required.');
  }

  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
  const pageSize = Math.min(500, Math.max(1, Number(params.get('pageSize') ?? '100') || 100));

  const repo = new StadiumRepository();
  const all = await repo.findSeatsByMatch(matchId);
  const items = all.slice((page - 1) * pageSize, page * pageSize);

  const body: PaginatedResult<Seat> = {
    items,
    total: all.length,
    page,
    pageSize,
  };
  return NextResponse.json(body);
});
