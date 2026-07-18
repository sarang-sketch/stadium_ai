/**
 * Domain types for stadium venue/seat data, crowd density prediction, queue
 * wait-time prediction, and seat recommendations.
 *
 * Covers:
 * - Seat maps for the SeatMapComponent (Requirement 3.4)
 * - Venue zone/exit maps used by EmergencyRoutingService zone validation (Requirement 16)
 * - Crowd density predictions from CrowdDensityService (Requirement 10)
 * - Queue wait-time predictions from QueuePredictionService (Requirement 11)
 * - Seat recommendations from SeatRecommendationService (Requirement 9)
 */

/** Lifecycle status of a single stadium seat. */
export type SeatStatus = "available" | "reserved" | "sold";

/** A single bookable seat within a match's seat map. */
export interface Seat {
  /** Unique seat identifier. */
  id: string;
  /** Identifier of the match this seat belongs to. */
  matchId: string;
  /** Seat category (e.g. "vip", "general", "premium"). */
  category: string;
  /** Current booking status of the seat. */
  status: SeatStatus;
  /** Base price before dynamic pricing adjustments. */
  basePrice: number;
  /** Currently computed price (may reflect PricingEngine output). */
  currentPrice: number;
  /** Section label shown in the seat map UI (e.g. "A", "North Stand"). */
  section: string;
  /** Row label within the section. */
  row: string;
  /** Seat number within the row. */
  seatNumber: number;
  /** Stadium zone this seat is physically located in. */
  zoneId: string;
}

/** A physical emergency exit within a venue. */
export interface VenueExit {
  /** Unique exit identifier. */
  exitId: string;
  /** Human-readable exit name/label. */
  name: string;
  /** Throughput capacity of this exit, in people per minute. */
  capacityPerMinute: number;
}

/**
 * A stadium zone and its adjacency to emergency exits. Used by
 * EmergencyRoutingService for zone validation (Requirement 16.2) and by
 * CrowdDensityService as the set of zones predictions are produced for.
 */
export interface VenueZone {
  /** Unique zone identifier. */
  zoneId: string;
  /** Human-readable zone name (e.g. "North Stand Lower"). */
  name: string;
  /** Maximum seated/standing capacity of the zone. */
  capacity: number;
  /** Identifiers of exits reachable directly from this zone. */
  adjacentExitIds: string[];
}

/** The full zone/exit map for a venue, used for emergency route lookups. */
export interface VenueZoneMap {
  /** Venue name this zone map applies to. */
  venue: string;
  /** All zones defined for the venue. */
  zones: VenueZone[];
  /** All exits defined for the venue. */
  exits: VenueExit[];
}

/** Qualitative crowd density levels for a stadium zone. */
export type CrowdDensityLevel = "low" | "moderate" | "high" | "critical";

/** Predicted crowd density for a single stadium zone. */
export interface ZoneDensityPrediction {
  /** Zone this prediction applies to. */
  zoneId: string;
  /** Predicted qualitative density level for the zone. */
  densityLevel: CrowdDensityLevel;
  /** Predicted occupancy as a ratio of ticket sales to zone capacity, 0-1. */
  occupancyRatio: number;
  /** Identifier of the data source used to derive this prediction (e.g. mock adapter name), per Requirement 10.2. */
  source: string;
}

/** Crowd density prediction response for a match, covering every venue zone. */
export interface CrowdDensityPrediction {
  /** Match this prediction was computed for. */
  matchId: string;
  /** Per-zone density predictions. */
  zones: ZoneDensityPrediction[];
  /** ISO timestamp when the prediction was generated. */
  generatedAt: string;
}

/** Identifies the type of a physical queue point within the venue. */
export type QueuePointType = "entry_gate" | "concession";

/** Predicted wait time at a single queue point. */
export interface QueuePointPrediction {
  /** Unique identifier of the queue point (gate or concession stand). */
  queuePointId: string;
  /** Type of queue point. */
  type: QueuePointType;
  /** Estimated wait time in minutes. Always non-negative. */
  estimatedWaitMinutes: number;
  /**
   * True when no historical throughput data existed for this queue point and
   * the estimate was derived from stadium capacity instead, per Requirement 11.2.
   */
  isDefaultEstimate: boolean;
}

/** Queue wait-time prediction response for a match, covering every queue point. */
export interface QueuePrediction {
  /** Match this prediction was computed for. */
  matchId: string;
  /** Per-queue-point wait time estimates. */
  queuePoints: QueuePointPrediction[];
  /** ISO timestamp when the prediction was generated. */
  generatedAt: string;
}

/** Relative proximity preference for seat recommendations. */
export type SeatProximityPreference = "front" | "middle" | "back" | "any";

/** User-stated preferences submitted for seat recommendations (Requirement 9.1). */
export interface SeatRecommendationPreferences {
  /** Match the user wants seat recommendations for. */
  matchId: string;
  /** Maximum price the user is willing to pay per seat. */
  budget: number;
  /** Preferred proximity to the field/pitch. */
  proximity: SeatProximityPreference;
  /** Number of seats needed together for the user's group. */
  groupSize: number;
}

/** A single ranked seat recommendation. */
export interface RankedSeatRecommendation {
  /** The recommended seat. */
  seat: Seat;
  /** Rank position within the recommendation list, 1 being the best match. */
  rank: number;
  /** Relative score used to order recommendations, higher is a better match. */
  matchScore: number;
}

/**
 * Full ranked seat recommendation result for a match. Only seats with status
 * `available` are ever included (Requirement 9.3).
 */
export interface SeatRecommendationResult {
  /** Match the recommendations were computed for. */
  matchId: string;
  /** Ranked list of recommended, available seats. */
  recommendations: RankedSeatRecommendation[];
  /**
   * True when no available seat satisfied the requested budget and the
   * returned seats are the closest-matching available seats instead,
   * per Requirement 9.2.
   */
  budgetRelaxed: boolean;
}
