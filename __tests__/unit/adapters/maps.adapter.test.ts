import { describe, expect, it } from 'vitest';
import { createMapsAdapter, MockMapsAdapter } from '@/adapters/maps.adapter';

describe('Maps Adapter', () => {
  it('should return valid MapsRoute', async () => {
    const adapter = new MockMapsAdapter();
    const route = await adapter.getEvacuationRoute('zone-A', 'exit-B');
    expect(route).toBeDefined();
    expect(route.steps).toBeDefined();
    expect(route.steps.length).toBeGreaterThan(0);
  });

  it('should be deterministic for same inputs', async () => {
    const adapter = new MockMapsAdapter();
    const route1 = await adapter.getEvacuationRoute('zone-A', 'exit-B');
    const route2 = await adapter.getEvacuationRoute('zone-A', 'exit-B');
    expect(route1.distanceMeters).toBe(route2.distanceMeters);
  });

  it('should return different outputs for different inputs', async () => {
    const adapter = new MockMapsAdapter();
    const route1 = await adapter.getEvacuationRoute('zone-A', 'exit-B');
    const route2 = await adapter.getEvacuationRoute('zone-C', 'exit-D');
    expect(route1.distanceMeters).not.toBe(route2.distanceMeters);
  });

  it('should have distanceMeters and etaSeconds > 0', async () => {
    const adapter = new MockMapsAdapter();
    const route = await adapter.getEvacuationRoute('zone-A', 'exit-B');
    expect(route.distanceMeters).toBeGreaterThan(0);
    expect(route.etaSeconds).toBeGreaterThan(0);
  });

  it('should create adapter via factory', () => {
    const adapter = createMapsAdapter();
    expect(adapter).toBeDefined();
    expect(adapter).toBeInstanceOf(MockMapsAdapter);
  });
});
