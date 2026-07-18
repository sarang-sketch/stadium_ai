/**
 * Domain types for tournaments, matches/fixtures, team & player registration
 * (and its approval workflow), player statistics, and AI-assisted match
 * outcome prediction.
 *
 * Covers:
 * - Tournament browsing and management (Requirements 3, 14)
 * - Team and player self-registration (Requirement 4)
 * - Registration approval by administrators (Requirement 5)
 * - AI-generated match outcome predictions from MatchPredictionService (Requirement 12)
 * - Automatic fixture generation/scheduling from SchedulerService (Requirement 15)
 * - Player statistics aggregation from PlayerStatsService (Requirement 17)
 *
 * Dates are represented as ISO 8601 strings, matching the convention used
 * elsewhere in the domain types (see `stadium.types.ts`).
 */

/** A tournament event hosted at a venue over a date range. */
export interface Tournament {
  /** Unique tournament identifier. */
  id: string;
  /** Human-readable tournament name. */
  name: string;
  /** ISO 8601 date/time the tournament starts. */
  startDate: string;
  /** ISO 8601 date/time the tournament ends. Must not precede `startDate`. */
  endDate: string;
  /** Venue name/location hosting the tournament. */
  venue: string;
}

/** Lifecycle status of a single tournament match/fixture. */
export type MatchStatus = "scheduled" | "completed" | "cancelled";

/** A single match/fixture between two teams within a tournament. */
export interface Match {
  /** Unique match identifier. */
  id: string;
  /** Identifier of the tournament this match belongs to. */
  tournamentId: string;
  /** Identifier of the registration representing team A. */
  teamAId: string;
  /** Identifier of the registration representing team B. */
  teamBId: string;
  /** ISO 8601 date/time the match is scheduled to start. */
  startTime: string;
  /** Venue name/location the match is played at. */
  venue: string;
  /** Current lifecycle status of the match. */
  status: MatchStatus;
}

/** Lifecycle status of a team/player registration submitted for a tournament. */
export type RegistrationStatus = "pending" | "approved" | "rejected";

/**
 * A team registration submitted by a user for a tournament, subject to
 * administrator approval (Requirements 4, 5).
 */
export interface Registration {
  /** Unique registration identifier. */
  id: string;
  /** Identifier of the tournament this registration was submitted for. */
  tournamentId: string;
  /** Account identifier of the submitting user (Requirement 4.3). */
  userId: string;
  /** Name of the registering team. */
  teamName: string;
  /** Current approval status of the registration. */
  status: RegistrationStatus;
  /**
   * Reason supplied by an administrator when rejecting the registration
   * (Requirement 5.2). Absent unless `status` is `rejected`.
   */
  rejectionReason?: string | null;
}

/** A single player included in a team registration. */
export interface Player {
  /** Unique player identifier. */
  id: string;
  /** Identifier of the registration this player belongs to. */
  registrationId: string;
  /** Player's display name. */
  name: string;
  /** Player's playing position (e.g. "goalkeeper", "forward"). */
  position: string;
}

/** Per-match recorded performance data for a single player. */
export interface PlayerStat {
  /** Unique player-stat record identifier. */
  id: string;
  /** Identifier of the player this record belongs to. */
  playerId: string;
  /** Identifier of the match this performance data was recorded for. */
  matchId: string;
  /** Goals scored by the player in this match. */
  goals: number;
  /** Assists made by the player in this match. */
  assists: number;
  /** Minutes played by the player in this match. */
  minutesPlayed: number;
}

/**
 * A player's aggregated statistics across all completed matches in a
 * tournament, produced by PlayerStatsService (Requirement 17.1, 17.2).
 */
export interface PlayerAggregatedStats {
  /** Identifier of the player these aggregates apply to. */
  playerId: string;
  /** Total goals scored across all completed matches. */
  totalGoals: number;
  /** Total assists made across all completed matches. */
  totalAssists: number;
  /** Total minutes played across all completed matches. */
  totalMinutesPlayed: number;
  /** Number of completed matches with recorded performance data for the player. */
  matchesPlayed: number;
}

/** Predicted result of a match: one of the two teams, or a draw. */
export type MatchOutcome = "teamA" | "teamB" | "draw";

/**
 * Identifies the origin of a match outcome prediction, per Requirement 12.2:
 * `gemini` when produced by the GeminiAdapter, `heuristic` when the
 * GeminiAdapter was unavailable/errored and a win-rate-based fallback was used.
 */
export type PredictionSource = "gemini" | "heuristic";

/** AI-assisted (or heuristic-fallback) outcome prediction for an upcoming match. */
export interface MatchPrediction {
  /** Match this prediction was computed for. */
  matchId: string;
  /** Predicted outcome of the match. */
  predictedOutcome: MatchOutcome;
  /** Confidence in the predicted outcome, as a percentage from 0 to 100 inclusive. */
  confidencePercentage: number;
  /** Origin of the prediction, per Requirement 12.2. */
  source: PredictionSource;
  /** ISO timestamp when the prediction was generated. */
  generatedAt: string;
}

/**
 * Result of a round-robin fixture generation/regeneration run for a
 * tournament, produced by SchedulerService (Requirement 15).
 */
export interface FixtureGenerationResult {
  /** Identifier of the tournament fixtures were generated for. */
  tournamentId: string;
  /** All matches that make up the generated fixture set. */
  matches: Match[];
  /**
   * Identifiers of previously generated matches that were preserved (not
   * replaced) because they already had sold tickets, per Requirement 15.4.
   */
  preservedMatchIds: string[];
  /** ISO timestamp when the fixtures were generated. */
  generatedAt: string;
}
