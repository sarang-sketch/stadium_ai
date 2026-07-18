import { describe, expect, it } from 'vitest';
import { createVisionAdapter, MockVisionAdapter } from '@/adapters/vision.adapter';

describe('Vision Adapter', () => {
  it('should return valid result for analyzeCrowdImage', async () => {
    const adapter = new MockVisionAdapter();
    const result = await adapter.analyzeCrowdImage('zone-north', 'camera-feed-1.jpg');
    expect(result).toBeDefined();
    expect(result.estimatedPersonCount).toBeDefined();
  });

  it('should have estimatedPersonCount, occupancyRatio, confidence in valid ranges', async () => {
    const adapter = new MockVisionAdapter();
    const result = await adapter.analyzeCrowdImage('zone-north', 'camera-feed-1.jpg');
    expect(result.estimatedPersonCount).toBeGreaterThanOrEqual(0);
    expect(result.occupancyRatio).toBeGreaterThanOrEqual(0);
    expect(result.occupancyRatio).toBeLessThanOrEqual(1);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should have deterministic behavior', async () => {
    const adapter = new MockVisionAdapter();
    const res1 = await adapter.analyzeCrowdImage('zone-north', 'camera-feed-1.jpg');
    const res2 = await adapter.analyzeCrowdImage('zone-north', 'camera-feed-1.jpg');
    expect(res1.estimatedPersonCount).toBe(res2.estimatedPersonCount);
  });

  it('should create adapter via factory', () => {
    const adapter = createVisionAdapter();
    expect(adapter).toBeDefined();
    expect(adapter).toBeInstanceOf(MockVisionAdapter);
  });
});
