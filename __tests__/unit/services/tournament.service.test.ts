import { describe, expect, it } from 'vitest';
import { 
  MatchPredictionService, 
  SchedulerService, 
  PlayerStatsService,
  TournamentInsightsService
} from '@/services/tournament.service';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';

describe('Tournament Service', () => {
  it('MatchPredictionService returns valid prediction', async () => {
    const gemini = createGeminiAdapter();
    const svc = new MatchPredictionService(gemini);
    const res = await svc.predictOutcome('match-1', { wins: 5, matches: 8 }, { wins: 3, matches: 8 });
    
    expect(res.matchId).toBe('match-1');
    expect(res.predictedWinnerTeamId).toBeDefined();
    expect(res.confidenceScore).toBeGreaterThanOrEqual(0.5);
  });

  it('SchedulerService generates round-robin fixtures', () => {
    const svc = new SchedulerService();
    const res = svc.generateFixtures(['team-1', 'team-2', 'team-3'], ['venue-1', 'venue-2'], new Date());
    
    expect(res.length).toBe(3); // 3 combination of matches
    expect(res[0].homeTeam).toBe('team-1');
    expect(res[0].awayTeam).toBe('team-2');
  });

  it('PlayerStatsService aggregates performance stats correctly', () => {
    const svc = new PlayerStatsService();
    const res = svc.aggregateStats('player-1', [
      { goals: 2, assists: 1 },
      { goals: 1, assists: 0 },
      { goals: 0, assists: 2 }
    ]);
    
    expect(res.playerId).toBe('player-1');
    expect(res.totalMatches).toBe(3);
    expect(res.goals).toBe(3);
    expect(res.assists).toBe(3);
    expect(res.rating).toBe(2.0);
  });

  it('TournamentInsightsService generates insights', async () => {
    const gemini = createGeminiAdapter();
    const svc = new TournamentInsightsService(gemini);
    const res = await svc.generateInsights('tourney-1', [{ home: 'team-1', score: 2 }]);
    
    expect(res.title).toBeDefined();
    expect(res.trends.length).toBeGreaterThan(0);
    expect(res.source).toBeDefined();
  });
});
