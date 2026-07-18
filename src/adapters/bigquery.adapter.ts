/**
 * Google Cloud BigQuery adapter — stands in for the BigQuery analytics
 * warehouse that a real deployment would run aggregate SQL queries against
 * to power the tournament InsightsDashboard (Requirement 18.1). BigQuery is
 * one of the Google Cloud services that cannot be credentialed in this
 * environment (Requirement 19), so like `maps.adapter.ts`, `vision.adapter.ts`,
 * `speech.adapter.ts`, and `translate.adapter.ts`, this adapter is *always*
 * mock: `MockBigQueryAdapter` never issues a network call or a real SQL
 * query.
 *
 * `InsightsService` (`src/services/analytics.service.ts`) combines this
 * mocked BigQuery data with actual computed aggregates from the tickets and
 * fraud-review repositories — `InsightsService` alone is responsible for
 * the real correctness of the InsightsDashboard's numbers (Property 36).
 * This adapter's job is only to return a realistic, structurally valid
 * analytics payload standing in for what a BigQuery aggregate query would
 * return (Requirement 19.2) — structural validity matters here, not
 * numerical correctness against any particular tournament's real ticket
 * data.
 *
 * `MockBigQueryAdapter.queryTournamentAggregates` deterministically
 * synthesizes its result from a seeded hash of the requested `tournamentId`
 * (no randomness), so repeated calls for the same tournament always return
 * the same synthetic aggregates (Requirement 19.2, 19.3).
 *
 * To go live: implement `BigQueryAdapter` using a credentialed
 * `@google-cloud/bigquery` client — initialize a `BigQuery` client with a
 * GCP project ID and a service account credential, then run a parameterized
 * SQL aggregate query (e.g. `SELECT COUNT(*) AS totalTicketsSold,
 * SUM(price_paid) AS totalRevenue, AVG(risk_score) AS averageFraudRiskScore
 * FROM tickets LEFT JOIN fraud_reviews ... WHERE tournament_id = @tournamentId
 * GROUP BY match_id` style queries) against a `tickets`/`fraud_reviews`
 * dataset, mapping the query's result rows into `BigQueryTournamentAggregates`
 * — no changes are required in `InsightsService` or any other caller, since
 * they depend only on the `BigQueryAdapter` interface (Requirement 19.4).
 */

/** Per-match attendance breakdown entry within a tournament's aggregates. */
export interface BigQueryMatchAttendance {
  /** Identifier of the match this attendance figure applies to. */
  matchId: string;
  /** Number of attendees recorded for this match. */
  attendance: number;
}

/**
 * Analytics aggregate payload for a tournament, as a real BigQuery
 * aggregate query against a tickets/fraud_reviews dataset would return.
 * Standing in for the raw warehouse-side data that `InsightsService`
 * combines with its own computed aggregates to build the InsightsDashboard
 * (Requirement 18.1).
 */
export interface BigQueryTournamentAggregates {
  /** Identifier of the tournament these aggregates apply to. */
  tournamentId: string;
  /** Total number of tickets sold for the tournament. */
  totalTicketsSold: number;
  /** Total revenue collected across all sold tickets, in the platform's base currency unit. */
  totalRevenue: number;
  /** Average fraud risk score (0-100 inclusive) across scored ticket transactions. */
  averageFraudRiskScore: number;
  /** Attendance breakdown for every match in the tournament. */
  attendanceByMatch: BigQueryMatchAttendance[];
}

/** The interface `InsightsService` depends on for BigQuery-backed analytics data. */
export interface BigQueryAdapter {
  /**
   * Returns analytics aggregates for `tournamentId`, standing in for what a
   * BigQuery aggregate query would return for the InsightsDashboard.
   */
  queryTournamentAggregates(tournamentId: string): Promise<BigQueryTournamentAggregates>;
}

/** Number of synthetic per-match attendance entries generated per tournament. */
const SYNTHETIC_MATCH_COUNT = 5;

/** Base attendance figure the synthetic per-match values are derived around. */
const BASE_ATTENDANCE = 500;

/**
 * MOCK IMPLEMENTATION — always synthesizes a deterministic analytics
 * payload and never issues a real BigQuery query. See the module doc
 * comment above for the swap-in steps to a real `@google-cloud/bigquery`
 * client.
 */
export class MockBigQueryAdapter implements BigQueryAdapter {
  async queryTournamentAggregates(tournamentId: string): Promise<BigQueryTournamentAggregates> {
    const hash = seededHash(tournamentId);
    const seed = parseInt(hash.slice(0, 8), 16);

    const totalTicketsSold = 200 + (seed % 4800);
    const averagePricePerTicket = 25 + (seed % 175);
    const totalRevenue = Math.round(totalTicketsSold * averagePricePerTicket * 100) / 100;
    const averageFraudRiskScore = Math.round(((seed % 1000) / 1000) * 100 * 100) / 100;

    const attendanceByMatch: BigQueryMatchAttendance[] = Array.from(
      { length: SYNTHETIC_MATCH_COUNT },
      (_, index) => {
        const matchSeed = parseInt(seededHash(`${tournamentId}::match::${index}`).slice(0, 8), 16);
        return {
          matchId: `${tournamentId}-match-${index + 1}`,
          attendance: BASE_ATTENDANCE + (matchSeed % 4500),
        };
      },
    );

    return {
      tournamentId,
      totalTicketsSold,
      totalRevenue,
      averageFraudRiskScore,
      attendanceByMatch,
    };
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed synthetic analytics data. Not cryptographic — only needed for
 * stable, reproducible mock output across calls with the same input.
 */
function seededHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Factory for `BigQueryAdapter`, consistent with the factory pattern used
 * by every other adapter in this directory (e.g. `createTranslateAdapter`).
 * Always returns the mock — there is no real-API path for this adapter.
 */
export function createBigQueryAdapter(): BigQueryAdapter {
  return new MockBigQueryAdapter();
}
