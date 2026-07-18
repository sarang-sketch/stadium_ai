/**
 * Google Maps adapter — stands in for the Google Maps Directions API, which
 * cannot be credentialed in this environment (Requirement 19).
 *
 * Unlike `gemini.adapter.ts`, which really calls its underlying API when a
 * key is configured, this adapter is *always* mock: `MockMapsAdapter` never
 * makes a network call. It deterministically synthesizes a plausible
 * evacuation route (step-by-step directions, distance, ETA) from the
 * requested `zoneId`/`exitId` pair so that the same inputs always produce
 * the same output, keeping callers and tests reproducible
 * (Requirements 16.1, 19.2, 19.3).
 *
 * To go live: implement `MapsAdapter` using a credentialed Google Maps
 * Directions API client (e.g. `@googlemaps/routing`), issuing a real
 * directions request from the zone's coordinates to the exit's coordinates
 * and mapping the API response's legs/steps into `MapsRoute` — no changes
 * are required in `EmergencyRoutingService` or any other caller, since they
 * depend only on the `MapsAdapter` interface (Requirement 19.4).
 */

/** A single evacuation route, as returned by `MapsAdapter.getEvacuationRoute`. */
export interface MapsRoute {
  /** Ordered, human-readable step-by-step directions from the zone to the exit. */
  steps: string[];
  /** Total route distance, in meters. */
  distanceMeters: number;
  /** Estimated travel time to cover the route, in seconds. */
  etaSeconds: number;
}

/** The interface `EmergencyRoutingService` depends on (Requirement 16.1). */
export interface MapsAdapter {
  /**
   * Returns an evacuation route from `zoneId` to `exitId`. Implementations
   * are not responsible for validating that the zone/exit exist within a
   * venue's zone map — that validation is performed by
   * `EmergencyRoutingService` against `VenueZoneRepository` before this is
   * called (Requirement 16.2).
   */
  getEvacuationRoute(zoneId: string, exitId: string): Promise<MapsRoute>;
}

/** Average adult walking speed used to derive a plausible ETA from distance, in meters/second. */
const WALKING_SPEED_MPS = 1.4;

/** Landmark phrases used to build varied, realistic-sounding directions. */
const LANDMARKS = [
  "the main concourse",
  "the concession stand",
  "the north stairwell",
  "the ramp",
  "the ticket gate",
  "the merchandise kiosk",
  "the restroom block",
  "the security checkpoint",
] as const;

/**
 * MOCK IMPLEMENTATION — returns realistic synthetic evacuation routing data.
 * Does not call any external API. See the module doc comment above for the
 * swap-in path to a real Google Maps Directions API client.
 */
export class MockMapsAdapter implements MapsAdapter {
  async getEvacuationRoute(zoneId: string, exitId: string): Promise<MapsRoute> {
    const hash = seededHash(`${zoneId}::${exitId}`);
    const seed = parseInt(hash.slice(0, 8), 16);

    // Deterministically derive a plausible number of route legs (2-5) and a
    // plausible distance (40m-390m) from the seed, so results vary sensibly
    // by zone/exit pair while staying reproducible for the same pair.
    const legCount = 2 + (seed % 4);
    const distanceMeters = 40 + (seed % 350);
    const etaSeconds = Math.round(distanceMeters / WALKING_SPEED_MPS);

    const steps = this.buildSteps(zoneId, exitId, seed, legCount);

    return { steps, distanceMeters, etaSeconds };
  }

  /** Builds a plausible, deterministic sequence of evacuation directions. */
  private buildSteps(zoneId: string, exitId: string, seed: number, legCount: number): string[] {
    const steps: string[] = [`Exit zone ${zoneId} through the nearest marked evacuation door.`];

    for (let i = 0; i < legCount; i++) {
      const landmark = LANDMARKS[(seed + i) % LANDMARKS.length];
      const direction = i % 2 === 0 ? "Proceed straight past" : "Turn and continue past";
      steps.push(`${direction} ${landmark}.`);
    }

    steps.push(`Follow the illuminated exit signage to reach exit ${exitId}.`);
    return steps;
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed synthetic route data. Not cryptographic — only needed for stable,
 * reproducible mock output across calls with the same zone/exit pair.
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
 * Factory for `MapsAdapter`, consistent with the factory pattern used by
 * every other adapter in this directory (e.g. `createGeminiAdapter`).
 * Always returns the mock — there is no real-API path for this adapter.
 */
export function createMapsAdapter(): MapsAdapter {
  return new MockMapsAdapter();
}
