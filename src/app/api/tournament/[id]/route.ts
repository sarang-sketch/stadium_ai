import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { TournamentUpdateSchema } from '@/lib/validators';
import { TournamentRepository } from '@/repositories/tournament.repository';
import { NotFoundError } from '@/utils/error-handler';
import type { Tournament } from '@/types/tournament.types';

/**
 * GET /api/tournament/[id]
 * Public. Returns a single tournament or 404 when it does not exist.
 */
export const GET = withApiHandler(async (_req, ctx) => {
  const repo = new TournamentRepository();
  const tournament = await repo.findById(ctx.params.id);
  if (!tournament) {
    throw new NotFoundError(`Tournament ${ctx.params.id} not found.`);
  }
  return NextResponse.json(tournament);
});

/**
 * PUT /api/tournament/[id]
 * Admin only. Applies a partial update and returns the updated record.
 */
export const PUT = withApiHandler(
  async (_req, ctx) => {
    const repo = new TournamentRepository();
    const existing = await repo.findById(ctx.params.id);
    if (!existing) {
      throw new NotFoundError(`Tournament ${ctx.params.id} not found.`);
    }

    const { location, ...rest } = ctx.body;
    const patch: Partial<Tournament> = {
      ...rest,
      ...(location !== undefined ? { venue: location } : {}),
    };

    await repo.update(ctx.params.id, patch);
    const updated: Tournament = { ...existing, ...patch };
    return NextResponse.json(updated);
  },
  { schema: TournamentUpdateSchema, requireRole: 'admin' }
);

/**
 * DELETE /api/tournament/[id]
 * Admin only. Deletes a tournament after confirming it exists.
 */
export const DELETE = withApiHandler(
  async (_req, ctx) => {
    const repo = new TournamentRepository();
    const existing = await repo.findById(ctx.params.id);
    if (!existing) {
      throw new NotFoundError(`Tournament ${ctx.params.id} not found.`);
    }

    await repo.delete(ctx.params.id);
    return NextResponse.json({ id: ctx.params.id, deleted: true });
  },
  { requireRole: 'admin' }
);
