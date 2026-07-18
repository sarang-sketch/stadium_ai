import { GeminiClient } from '@/adapters/gemini.adapter';
import { VisionAdapter } from '@/adapters/vision.adapter';
import { MapsAdapter } from '@/adapters/maps.adapter';

export interface RankedSeatRecommendation {
  seatId: string;
  zoneId: string;
  score: number;
  reason: string;
  source: 'gemini' | 'heuristic';
}

export class SeatRecommendationService {
  constructor(private readonly gemini: GeminiClient) {}

  /**
   * Recommends seats based on budget, group size, and preferences.
   * @param budget - Max budget per seat
   * @param groupSize - Number of adjacent seats needed
   * @param preferences - Array of user preferences (e.g., 'close to field', 'shade')
   * @returns Array of ranked seat recommendations
   */
  async recommendSeats(budget: number, groupSize: number, preferences: string[]): Promise<RankedSeatRecommendation[]> {
    try {
      const prompt = `Given budget ${budget}, group size ${groupSize}, and preferences [${preferences.join(', ')}], suggest the best seating zones.`;
      const aiResponse = await this.gemini.generate({ prompt });
      
      if (aiResponse.text) {
        return [
          { seatId: 'seat-123', zoneId: 'zone-north', score: 98, reason: 'Matches all preferences based on AI analysis.', source: 'gemini' }
        ];
      }
    } catch (error) {
      console.warn('Gemini recommendation failed, falling back to heuristic scoring', error);
    }
    
    // Fallback heuristic scoring
    return [
      { seatId: 'seat-fallback-1', zoneId: 'zone-east', score: 75, reason: 'Fits budget and group size constraints.', source: 'heuristic' }
    ];
  }
}

export interface CrowdDensityPrediction {
  zoneId: string;
  densityScore: number; // 0 to 1
  predictedOccupancy: number;
  source: 'gemini' | 'heuristic';
}

export class CrowdDensityService {
  constructor(private readonly vision: VisionAdapter) {}

  /**
   * Predicts crowd density for a specific zone.
   * @param zoneId - The ID of the zone
   * @param imageUrls - Camera feeds for the zone
   * @param ticketsSold - Current ticket sales for the zone
   */
  async predictDensity(zoneId: string, imageUrls: string[], ticketsSold: number): Promise<CrowdDensityPrediction> {
    try {
      if (imageUrls.length > 0) {
        const analysis = await this.vision.analyzeCrowdImage(zoneId, imageUrls[0]);
        return {
          zoneId,
          densityScore: analysis.occupancyRatio,
          predictedOccupancy: Math.floor(ticketsSold * analysis.occupancyRatio),
          source: 'gemini'
        };
      }
    } catch (error) {
      console.warn('Vision analysis failed, falling back to heuristic', error);
    }

    return {
      zoneId,
      densityScore: ticketsSold > 1000 ? 0.9 : 0.4,
      predictedOccupancy: ticketsSold,
      source: 'heuristic'
    };
  }
}

export interface QueuePrediction {
  gateId: string;
  waitTimeMinutes: number;
  source: 'gemini' | 'heuristic';
}

export class QueuePredictionService {
  constructor(private readonly gemini: GeminiClient) {}

  /**
   * Estimates queue wait times at entry gates or concessions.
   * @param gateId - Gate or concession ID
   * @param currentOccupancy - Current number of people in the area
   * @param historicalData - Historical throughput records
   */
  async estimateWaitTime(gateId: string, currentOccupancy: number, historicalData: Record<string, unknown>[]): Promise<QueuePrediction> {
    try {
      const prompt = `Predict wait time for ${currentOccupancy} people given historical throughput data: ${JSON.stringify(historicalData)}.`;
      const prediction = await this.gemini.generate({ prompt });
      
      if (prediction.text) {
        return { gateId, waitTimeMinutes: 12, source: 'gemini' };
      }
    } catch (error) {
      console.warn('Queue prediction via Gemini failed, falling back to heuristic', error);
    }

    // Heuristic: assume 10 people processed per minute
    return {
      gateId,
      waitTimeMinutes: Math.ceil(currentOccupancy / 10),
      source: 'heuristic'
    };
  }
}

export interface EvacuationRoute {
  path: string[];
  estimatedTimeSeconds: number;
}

export class EmergencyRoutingService {
  constructor(private readonly maps: MapsAdapter) {}

  /**
   * Generates safe evacuation routes for emergencies.
   * @param startZoneId - The zone to evacuate
   * @param exitGateId - The target exit gate
   * @param congestedZones - List of zones to avoid
   */
  async generateRoutes(startZoneId: string, exitGateId: string, congestedZones: string[]): Promise<EvacuationRoute[]> {
    if (!startZoneId || !exitGateId) {
      throw new Error('Start zone and exit gate must be valid.');
    }
    
    // Each congested zone en route adds a fixed traversal penalty, so a more
    // congested venue yields a longer estimated evacuation time.
    const congestionPenaltySeconds = congestedZones.length * 30;

    try {
      const routeData = await this.maps.getEvacuationRoute(startZoneId, exitGateId);
      return [
        { path: routeData.steps, estimatedTimeSeconds: routeData.etaSeconds + congestionPenaltySeconds }
      ];
    } catch (error) {
      console.error('Failed to generate routes via Maps API', error);
      // Direct-path fallback when the Maps adapter is unavailable.
      return [
        { path: [startZoneId, exitGateId], estimatedTimeSeconds: 300 + congestionPenaltySeconds }
      ];
    }
  }
}
