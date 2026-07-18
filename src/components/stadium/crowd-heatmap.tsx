'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ZoneDensityPrediction } from '@/types/index';

interface CrowdHeatmapProps {
  zones: ZoneDensityPrediction[];
}

/**
 * Visual heatmap showing crowd density by zone.
 *
 * Accessibility features:
 * - Container uses `role="region"` with a descriptive `aria-label`
 * - Each zone card uses `role="article"` with a full-text `aria-label`
 *   including zone ID, occupancy percentage, and density level
 * - Color-coded backgrounds are paired with text labels so colour is
 *   never the sole means of conveying density (WCAG 1.4.1)
 * - `aria-live="polite"` enables real-time density change announcements
 */
export function CrowdHeatmap({ zones }: CrowdHeatmapProps) {
  const getColor = (density: string) => {
    switch (density) {
      case 'low':
        return 'bg-green-500/80 border-green-600';
      case 'moderate':
        return 'bg-yellow-500/80 border-yellow-600';
      case 'high':
        return 'bg-orange-500/80 border-orange-600';
      case 'critical':
        return 'bg-red-600/90 border-red-700 animate-pulse';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="region"
      aria-label="Crowd Density Heatmap"
      aria-live="polite"
    >
      {zones.map((zone) => {
        const occupancyPct = Math.round(zone.occupancyRatio * 100);
        return (
          <div
            key={zone.zoneId}
            className={cn('relative p-6 rounded-xl border shadow-sm transition-all', getColor(zone.densityLevel))}
            role="article"
            aria-label={`Zone ${zone.zoneId}: ${occupancyPct}% occupancy, density ${zone.densityLevel}`}
          >
            <div className="bg-background/90 p-3 rounded-lg backdrop-blur-sm">
              <h4 className="font-bold text-lg mb-1">{zone.zoneId}</h4>
              <p className="text-sm text-muted-foreground">{occupancyPct}% occupancy</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider">
                Status:{' '}
                <span
                  className={cn(
                    zone.densityLevel === 'critical' && 'text-red-700 dark:text-red-400',
                    zone.densityLevel === 'high' && 'text-orange-700 dark:text-orange-400',
                  )}
                >
                  {zone.densityLevel}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
