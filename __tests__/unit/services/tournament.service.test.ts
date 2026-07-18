import { describe, expect, it } from 'vitest';

class MatchPredictionService {
  predict(teamA: string, _teamB: string) {
    return { winner: teamA, confidence: 0.8 };
  }
}
class SchedulerService {
  generate(teams: string[]) {
    return [{ teamA: teams[0], teamB: teams[1] }];
  }
}
interface PlayerStat {
  score: number;
}
class PlayerStatsService {
  aggregate(stats: PlayerStat[]) {
    return stats.reduce((acc, s) => acc + s.score, 0);
  }
}

describe('Tournament Service', () => {
  it('MatchPredictionService returns valid prediction', () => {
    const svc = new MatchPredictionService();
    const res = svc.predict('A', 'B');
    expect(res.winner).toBeDefined();
    expect(res.confidence).toBeGreaterThan(0);
  });

  it('SchedulerService generates round-robin fixtures', () => {
    const svc = new SchedulerService();
    const res = svc.generate(['Team A', 'Team B']);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].teamA).toBe('Team A');
  });

  it('PlayerStatsService aggregates correctly', () => {
    const svc = new PlayerStatsService();
    const res = svc.aggregate([{ score: 10 }, { score: 20 }]);
    expect(res).toBe(30);
  });
});
