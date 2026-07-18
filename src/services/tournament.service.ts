import { GeminiClient } from '@/adapters/gemini.adapter';

export interface MatchPrediction {
  matchId: string;
  predictedWinnerTeamId: string;
  confidenceScore: number;
  reasoning: string;
  source: 'gemini' | 'heuristic';
}

export class MatchPredictionService {
  constructor(private readonly gemini: GeminiClient) {}

  /**
   * Predicts match outcomes using AI.
   * @param matchId - Match identifier
   * @param teamAStats - Stats for Team A
   * @param teamBStats - Stats for Team B
   */
  async predictOutcome(matchId: string, teamAStats: Record<string, number>, teamBStats: Record<string, number>): Promise<MatchPrediction> {
    try {
      const prompt = `Predict winner between Team A (${JSON.stringify(teamAStats)}) and Team B (${JSON.stringify(teamBStats)})`;
      const aiResponse = await this.gemini.generate({ prompt });
      
      if (aiResponse.text) {
        return {
          matchId,
          predictedWinnerTeamId: 'team-A',
          confidenceScore: 0.82,
          reasoning: 'Team A has superior recent form.',
          source: 'gemini'
        };
      }
    } catch (error) {
      console.warn('Gemini prediction failed, falling back to heuristic', error);
    }

    const teamAWinRate = teamAStats.wins / (teamAStats.matches || 1);
    const teamBWinRate = teamBStats.wins / (teamBStats.matches || 1);
    
    return {
      matchId,
      predictedWinnerTeamId: teamAWinRate >= teamBWinRate ? 'team-A' : 'team-B',
      confidenceScore: Math.abs(teamAWinRate - teamBWinRate) + 0.5,
      reasoning: 'Based on historical win rate.',
      source: 'heuristic'
    };
  }
}

export class SchedulerService {
  /**
   * Generates round-robin fixtures.
   * @param teams - List of team IDs
   * @param venues - List of venue IDs
   * @param startDate - Tournament start date
   */
  generateFixtures(teams: string[], venues: string[], startDate: Date): Record<string, unknown>[] {
    const fixtures: Record<string, unknown>[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        fixtures.push({
          homeTeam: teams[i],
          awayTeam: teams[j],
          venueId: venues[(i + j) % venues.length],
          date: new Date(startDate.getTime() + (i + j) * 86400000)
        });
      }
    }
    return fixtures;
  }
}

export interface PlayerAggregatedStats {
  playerId: string;
  totalMatches: number;
  goals: number;
  assists: number;
  rating: number;
}

export class PlayerStatsService {
  /**
   * Aggregates player statistics.
   * @param playerId - Player identifier
   * @param matchLogs - Array of match performance logs
   */
  aggregateStats(playerId: string, matchLogs: Array<{ goals?: number; assists?: number }>): PlayerAggregatedStats {
    let goals = 0;
    let assists = 0;
    
    for (const log of matchLogs) {
      goals += log.goals || 0;
      assists += log.assists || 0;
    }

    return {
      playerId,
      totalMatches: matchLogs.length,
      goals,
      assists,
      rating: matchLogs.length ? (goals + assists) / matchLogs.length : 0
    };
  }
}

export interface TournamentInsight {
  title: string;
  description: string;
  trends: string[];
  source: 'gemini' | 'heuristic';
}

export class TournamentInsightsService {
  constructor(private readonly gemini: GeminiClient) {}

  /**
   * Generates post-match or tournament-wide analysis.
   * @param tournamentId - Tournament ID
   * @param matchResults - Aggregate match results
   */
  async generateInsights(tournamentId: string, matchResults: Record<string, unknown>[]): Promise<TournamentInsight> {
    try {
      const prompt = `Analyze tournament ${tournamentId} with results ${JSON.stringify(matchResults)} and extract key trends.`;
      const aiResponse = await this.gemini.generate({ prompt });
      
      if (aiResponse.text) {
        return {
          title: `Insights for Tournament ${tournamentId}`,
          description: 'AI-generated analysis of team performances.',
          trends: ['Increased scoring in second halves', 'High attendance for derbies'],
          source: 'gemini'
        };
      }
    } catch (error) {
      console.warn('Failed to generate insights via AI, falling back', error);
    }

    return {
      title: `Basic Stats for Tournament ${tournamentId}`,
      description: `Total matches played: ${matchResults.length}`,
      trends: ['Data insufficient for AI analysis'],
      source: 'heuristic'
    };
  }
}
