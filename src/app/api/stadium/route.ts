import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { StadiumRepository } from '@/repositories/stadium.repository';
import { ValidationError } from '@/utils/error-handler';
import { parsePagination, paginate } from '@/utils/pagination';
import type { Seat } from '@/types/stadium.types';

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

  const { page, pageSize } = parsePagination(params, { defaultPageSize: 100, maxPageSize: 500 });

  const repo = new StadiumRepository();
  const all = await repo.findSeatsByMatch(matchId);
  const body = paginate<Seat>(all, page, pageSize);
  return NextResponse.json(body);
});
