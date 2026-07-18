import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';
import { MatchPredictionService } from '@/services/tournament.service';
import { ValidationError } from '@/utils/error-handler';

/** Parses a numeric query parameter, falling back to `fallback` when absent/invalid. */
function numberParam(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * GET /api/tournament/[id]/predict
 * Public. Computes an AI-assisted (Gemini, heuristic fallback) match outcome
 * prediction from the supplied team win/matches stats. Genuinely invokes
 * MatchPredictionService and returns its typed result including `source`.
 */
export const GET = withApiHandler(async (req) => {
  const params = req.nextUrl.searchParams;
  const matchId = params.get('matchId');
  if (!matchId) {
    throw new ValidationError('matchId query parameter is required.');
  }

  const teamAStats = {
    wins: numberParam(params.get('teamAWins'), 0),
    matches: numberParam(params.get('teamAMatches'), 0),
  };
  const teamBStats = {
    wins: numberParam(params.get('teamBWins'), 0),
    matches: numberParam(params.get('teamBMatches'), 0),
  };

  const service = new MatchPredictionService(createGeminiAdapter());
  const prediction = await service.predictOutcome(matchId, teamAStats, teamBStats);

  return NextResponse.json(prediction);
});
