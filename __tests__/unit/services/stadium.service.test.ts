import { describe, expect, it } from 'vitest';
import { 
  SeatRecommendationService, 
  CrowdDensityService, 
  QueuePredictionService, 
  EmergencyRoutingService 
} from '@/services/stadium.service';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';
import { createVisionAdapter } from '@/adapters/vision.adapter';
import { createMapsAdapter } from '@/adapters/maps.adapter';

describe('Stadium Service', () => {
  it('SeatRecommendationService with mock data', async () => {
    const gemini = createGeminiAdapter();
    const svc = new SeatRecommendationService(gemini);
    const res = await svc.recommendSeats(120, 2, ['shade', 'close to field']);
    
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].seatId).toBeDefined();
    expect(res[0].score).toBeGreaterThan(0);
    expect(res[0].reason).toBeDefined();
  });

  it('CrowdDensityService produces valid predictions', async () => {
    const vision = createVisionAdapter();
    const svc = new CrowdDensityService(vision);
    const res = await svc.predictDensity('zone-A', ['https://example.com/cam.jpg'], 1500);
    
    expect(res.zoneId).toBe('zone-A');
    expect(res.densityScore).toBeGreaterThanOrEqual(0);
    expect(res.densityScore).toBeLessThanOrEqual(1);
    expect(res.predictedOccupancy).toBeGreaterThanOrEqual(0);
  });

  it('QueuePredictionService returns queue estimates', async () => {
    const gemini = createGeminiAdapter();
    const svc = new QueuePredictionService(gemini);
    const res = await svc.estimateWaitTime('gate-1', 120, [{ time: '10:00', throughput: 10 }]);
    
    expect(res.gateId).toBe('gate-1');
    expect(res.waitTimeMinutes).toBeGreaterThanOrEqual(0);
  });

  it('EmergencyRoutingService generates evacuation routes', async () => {
    const maps = createMapsAdapter();
    const svc = new EmergencyRoutingService(maps);
    const res = await svc.generateRoutes('Zone-North', 'Exit-A', ['Zone-East']);
    
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].path).toBeDefined();
    expect(res[0].estimatedTimeSeconds).toBeGreaterThan(0);
  });
});
