import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { EmergencyRouteSchema } from '@/lib/validators';
import { createMapsAdapter } from '@/adapters/maps.adapter';
import { EmergencyRoutingService } from '@/services/stadium.service';

/**
 * POST /api/stadium/emergency-route
 * Authenticated user. Computes safe evacuation routes from a zone to an exit
 * via EmergencyRoutingService (Maps adapter with a fallback).
 */
export const POST = withApiHandler(
  async (_req, ctx) => {
    const { zoneId, exitId, congestedZones } = ctx.body;
    const service = new EmergencyRoutingService(createMapsAdapter());
    const routes = await service.generateRoutes(zoneId, exitId, congestedZones ?? []);

    return NextResponse.json({ zoneId, exitId, routes });
  },
  { schema: EmergencyRouteSchema, requireRole: 'user' }
);
