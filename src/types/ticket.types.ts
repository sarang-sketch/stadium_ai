/**
 * Domain types for seat tickets, dynamic pricing (flagship), and ticket
 * fraud detection (flagship).
 *
 * Covers:
 * - Seat purchase / ticket ownership (Requirement 6)
 * - Dynamic pricing via PricingEngine, including Gemini/heuristic sourcing
 *   and the PricingDashboard (Requirement 7)
 * - Ticket fraud scoring via FraudDetectionService, including Gemini/heuristic
 *   sourcing, the FraudDashboard, and review recording (Requirement 8)
 *
 * Dates are represented as ISO 8601 strings, matching the convention used
 * elsewhere in the domain types (see `stadium.types.ts`, `tournament.types.ts`).
 */

/**
 * Fraud disposition of a ticket, mirrored onto the ticket record for quick
 * display without joining the associated FraudReview (Requirement 8.3).
 */
export type TicketFraudStatus = "clear" | "flagged" | "reviewed";

/** A purchased ticket linking a sold seat to the purchasing user's account. */
export interface Ticket {
  /** Unique ticket identifier. */
  id: string;
  /** Identifier of the seat this ticket was purchased for. */
  seatId: string;
  /** Account identifier of the purchasing user (Requirement 6.4). */
  userId: string;
  /** Final price paid for the seat, as computed by the PricingEngine. */
  pricePaid: number;
  /** ISO 8601 date/time the purchase completed. */
  purchasedAt: string;
  /** Current fraud disposition of this ticket. */
  fraudStatus: TicketFraudStatus;
}

/**
 * An administrator-configured pricing bound for a seat category within a
 * tournament. The PricingEngine constrains every computed price to this
 * range (Requirement 7.3) and applies updates to subsequent computations
 * (Requirement 7.4).
 */
export interface PricingRule {
  /** Unique pricing rule identifier. */
  id: string;
  /** Identifier of the tournament this rule applies to. */
  tournamentId: string;
  /** Minimum allowed computed price for this category. */
  minPrice: number;
  /** Maximum allowed computed price for this category. */
  maxPrice: number;
  /** Seat category this rule governs (e.g. "vip", "general"). */
  category: string;
}

/**
 * Identifies the origin of a pricing or fraud computation, per Requirements
 * 7.2/7.5 and 8.2/8.4: `gemini` when produced by the GeminiAdapter,
 * `heuristic` when the GeminiAdapter was unavailable/errored and the
 * documented fallback formula was used instead.
 */
export type ComputationSource = "gemini" | "heuristic";

/**
 * Demand signals submitted to the GeminiAdapter (and heuristic fallback) to
 * drive a single dynamic price computation (Requirement 7.1).
 */
export interface PricingDemandSignals {
  /** Seat category the signals apply to. */
  category: string;
  /** Percentage of seats in the category already sold, 0-100 inclusive. */
  occupancyPercentage: number;
  /** Time remaining until the event starts, in minutes. */
  timeRemainingMinutes: number;
  /** Historical sales velocity for this category, in seats sold per hour. */
  historicalSalesVelocity: number;
}

/**
 * Result of a single dynamic price computation performed by the
 * PricingEngine. The price is always bounded by `pricingRule.minPrice` and
 * `pricingRule.maxPrice` (Requirement 7.3), and `source` records whether the
 * result came from Gemini or the heuristic fallback (Requirement 7.2).
 */
export interface PricingComputationResult {
  /** Seat category this price was computed for. */
  category: string;
  /** Identifier of the tournament this price was computed for. */
  tournamentId: string;
  /** Final computed price, clamped within `pricingRule`'s bounds. */
  computedPrice: number;
  /** The pricing rule in effect at computation time. */
  pricingRule: PricingRule;
  /** Origin of this computation. */
  source: ComputationSource;
  /** ISO 8601 date/time the price was computed. */
  computedAt: string;
}

/**
 * Per-category entry surfaced on the PricingDashboard, reporting the current
 * computed price, the rule in effect, and the computation source
 * (Requirement 7.5).
 */
export interface PricingDashboardEntry {
  /** Seat category this entry describes. */
  category: string;
  /** Current computed price for this category. */
  computedPrice: number;
  /** The pricing rule in effect for this category. */
  pricingRule: PricingRule;
  /** Origin of the last computation for this category. */
  source: ComputationSource;
}

/**
 * Full PricingDashboard response for a tournament: one entry per seat
 * category, per Requirements 7.1 and 7.5.
 */
export interface PricingDashboardResult {
  /** Identifier of the tournament this dashboard data applies to. */
  tournamentId: string;
  /** One entry per seat category configured for the tournament. */
  entries: PricingDashboardEntry[];
  /** ISO 8601 date/time this dashboard snapshot was generated. */
  generatedAt: string;
}

/**
 * Behavioral signals submitted to the GeminiAdapter (and heuristic fallback)
 * to score a ticket purchase transaction for fraud risk (Requirement 8.1).
 */
export interface FraudBehavioralSignals {
  /** Number of ticket purchases made by this account in the recent window. */
  purchaseVelocity: number;
  /** Age of the purchasing account, in days. */
  accountAgeDays: number;
  /**
   * True when signals indicate the seat/account pairing may be mismatched
   * (e.g. delivery/billing details inconsistent with the account holder).
   */
  seatAccountMismatchIndicator: boolean;
  /** Descriptor of the observed payment pattern (e.g. "new_card", "known_card", "multiple_cards_same_session"). */
  paymentPattern: string;
}

/**
 * Result of a single fraud risk computation performed by the
 * FraudDetectionService. `riskScore` is always within 0-100 inclusive
 * (Requirement 8.1), `flagged` is true if and only if `riskScore` meets or
 * exceeds the configured threshold (Requirement 8.3), and `source` records
 * whether the result came from Gemini or the heuristic fallback
 * (Requirement 8.2).
 */
export interface FraudScoringResult {
  /** Identifier of the ticket this score was computed for. */
  ticketId: string;
  /** Computed fraud risk score, 0-100 inclusive. */
  riskScore: number;
  /** Origin of this computation. */
  source: ComputationSource;
  /** True when `riskScore` met or exceeded the configured flagging threshold. */
  flagged: boolean;
  /** The behavioral signals used to produce this score. */
  signals: FraudBehavioralSignals;
  /** ISO 8601 date/time the score was computed. */
  computedAt: string;
}

/**
 * Status of a fraud review record. A transaction starts `flagged` once its
 * risk score meets the threshold, and becomes `reviewed` once an
 * administrator records a review outcome (Requirement 8.5).
 */
export type FraudReviewStatus = "flagged" | "reviewed";

/**
 * A fraud review record for a flagged ticket transaction, aligned with the
 * design document's FRAUD_REVIEW entity plus the review outcome captured by
 * Requirement 8.5.
 */
export interface FraudReview {
  /** Unique fraud review identifier. */
  id: string;
  /** Identifier of the ticket this review applies to. */
  ticketId: string;
  /** Computed fraud risk score at the time the review was created, 0-100 inclusive. */
  riskScore: number;
  /** Origin of the risk score that triggered this review. */
  source: ComputationSource;
  /** Current status of the review. */
  status: FraudReviewStatus;
  /**
   * Account identifier of the administrator who reviewed this transaction
   * (Requirement 8.5). Absent until `status` is `reviewed`.
   */
  reviewerId?: string | null;
  /**
   * Outcome recorded by the reviewing administrator (e.g. "confirmed_fraud",
   * "false_positive"), per Requirement 8.5. Absent until `status` is
   * `reviewed`.
   */
  reviewOutcome?: string | null;
}

/**
 * A single entry on the FraudDashboard: a flagged review paired with the
 * contributing signals that produced its score, per Requirement 8.4.
 */
export interface FraudDashboardEntry {
  /** The flagged (or since-reviewed) fraud review record. */
  review: FraudReview;
  /** Behavioral signals that contributed to this review's risk score. */
  signals: FraudBehavioralSignals;
}

/**
 * Full FraudDashboard response: exactly the flagged transactions, sorted by
 * risk score descending, each including its contributing signals
 * (Requirement 8.4).
 */
export interface FraudDashboardResult {
  /** Flagged entries, sorted by `review.riskScore` descending. */
  entries: FraudDashboardEntry[];
  /** ISO 8601 date/time this dashboard snapshot was generated. */
  generatedAt: string;
}
