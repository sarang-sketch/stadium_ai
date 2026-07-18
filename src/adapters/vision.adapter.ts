/**
 * Google Cloud Vision adapter — stands in for the Cloud Vision API's
 * object-localization/person-detection features, which cannot be
 * credentialed in this environment (Requirement 19).
 *
 * Like `maps.adapter.ts`, this adapter is *always* mock: `MockVisionAdapter`
 * never makes a network call. It deterministically synthesizes a plausible
 * crowd-density image-analysis result (estimated person count, occupancy
 * ratio, and detection confidence) from the requested `zoneId`/`imageRef`
 * pair so that the same inputs always produce the same output, keeping
 * callers and tests reproducible (Requirements 10.1, 19.2, 19.3). This
 * result feeds into `CrowdDensityService`, which combines it with
 * ticket-sales distribution to produce the final `ZoneDensityPrediction`.
 *
 * To go live: implement `VisionAdapter` using a credentialed Google Cloud
 * Vision client (e.g. `@google-cloud/vision`), issuing a real
 * `objectLocalization`/crowd-counting request against the image referenced
 * by `imageRef` and mapping the API response's detected-person bounding
 * boxes (count) and detection scores (confidence) into this adapter's
 * `VisionCrowdAnalysisResult` shape — no changes are required in
 * `CrowdDensityService` or any other caller, since they depend only on the
 * `VisionAdapter` interface (Requirement 19.4).
 */

/**
 * Result of analyzing a single zone-camera image for crowd density, as
 * returned by `VisionAdapter.analyzeCrowdImage`. Standing in for what a real
 * Cloud Vision object-detection/crowd-counting call would return.
 */
export interface VisionCrowdAnalysisResult {
  /** Estimated number of people detected in the referenced image. */
  estimatedPersonCount: number;
  /** Estimated occupancy as a ratio of detected people to zone capacity, 0-1. */
  occupancyRatio: number;
  /** Confidence score for the detection/estimate, 0-1. */
  confidence: number;
}

/** The interface `CrowdDensityService` depends on (Requirement 10.1). */
export interface VisionAdapter {
  /**
   * Returns a crowd-density image-analysis result for the zone-camera image
   * referenced by `imageRef`. Implementations are not responsible for
   * resolving `imageRef` to actual image bytes or validating that `zoneId`
   * exists within a venue's zone map — that is handled by
   * `CrowdDensityService` and its collaborators.
   */
  analyzeCrowdImage(zoneId: string, imageRef: string): Promise<VisionCrowdAnalysisResult>;
}

/**
 * MOCK IMPLEMENTATION — returns realistic synthetic crowd-density
 * image-analysis data. Does not call any external API. See the module doc
 * comment above for the swap-in path to a real Google Cloud Vision client.
 */
export class MockVisionAdapter implements VisionAdapter {
  async analyzeCrowdImage(zoneId: string, imageRef: string): Promise<VisionCrowdAnalysisResult> {
    const hash = seededHash(`${zoneId}::${imageRef}`);
    const seed = parseInt(hash.slice(0, 8), 16);

    // Deterministically derive a plausible detected person count (5-405)
    // and occupancy ratio (0-1) from the seed, so results vary sensibly by
    // zone/image pair while staying reproducible for the same pair.
    const estimatedPersonCount = 5 + (seed % 400);
    const occupancyRatio = Math.round(((seed % 1000) / 1000) * 100) / 100;

    // Detection confidence is derived independently from a different slice
    // of the hash and kept in a realistic 0.70-0.99 band.
    const confidenceSeed = parseInt(hash.slice(4, 8), 16);
    const confidence = Math.round((0.7 + (confidenceSeed % 30) / 100) * 100) / 100;

    return { estimatedPersonCount, occupancyRatio, confidence };
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed synthetic analysis data. Not cryptographic — only needed for stable,
 * reproducible mock output across calls with the same zone/image pair.
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
 * Factory for `VisionAdapter`, consistent with the factory pattern used by
 * every other adapter in this directory (e.g. `createMapsAdapter`).
 * Always returns the mock — there is no real-API path for this adapter.
 */
export function createVisionAdapter(): VisionAdapter {
  return new MockVisionAdapter();
}
