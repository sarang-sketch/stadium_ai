'use client';

import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { MapsRoute } from '@/adapters/maps.adapter';

interface EmergencyPanelProps {
  route: MapsRoute;
  zoneId: string;
  exitId: string;
}

/**
 * Emergency evacuation route display.
 *
 * Accessibility features:
 * - `role="alert"` with `aria-live="assertive"` for immediate announcement
 * - Descriptive `aria-label` on the entire panel conveying context
 * - Step list uses ordered list with numbered items for logical reading order
 * - Distance and ETA rendered with full-word units (sr-only) alongside
 *   abbreviated display for sighted users
 */
export function EmergencyPanel({ route, zoneId, exitId }: EmergencyPanelProps) {
  return (
    <div
      className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl p-6"
      role="alert"
      aria-live="assertive"
      aria-label={`Emergency evacuation from zone ${zoneId} to exit ${exitId}`}
    >
      <div className="flex items-center space-x-3 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">Evacuation Route</h2>
      </div>

      <div className="flex items-center justify-between bg-background rounded-lg p-4 mb-6 shadow-sm border border-red-200 dark:border-red-900">
        <div className="text-center flex-1">
          <p className="text-sm text-muted-foreground">Current Zone</p>
          <p className="font-bold">{zoneId}</p>
        </div>
        <ArrowRight className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <div className="text-center flex-1">
          <p className="text-sm text-muted-foreground">Nearest Exit</p>
          <p className="font-bold">{exitId}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-medium bg-red-100 dark:bg-red-900/40 p-3 rounded-md">
          <span>
            Distance: {route.distanceMeters}m
            <span className="sr-only"> ({route.distanceMeters} meters)</span>
          </span>
          <span>
            ETA: {route.etaSeconds}s
            <span className="sr-only"> ({route.etaSeconds} seconds)</span>
          </span>
        </div>

        <h3 className="font-semibold mt-4 mb-2">Directions:</h3>
        <ol
          className="space-y-3 relative border-l-2 border-red-300 dark:border-red-800 ml-3"
          aria-label="Step-by-step evacuation directions"
        >
          {route.steps.map((step: string, idx: number) => (
            <li key={idx} className="pl-6 relative">
              <div
                className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white dark:border-background"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
