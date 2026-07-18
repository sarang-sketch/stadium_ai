'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QueuePointPrediction } from '@/types/index';

interface QueueStatusProps {
  queuePoints: QueuePointPrediction[];
}

/**
 * Queue wait time cards for each queue point.
 *
 * Accessibility features:
 * - Outer container has `role="region"` with a descriptive label
 * - Each card conveys wait time in its `aria-label` for screen readers
 * - Decorative clock icon uses `aria-hidden="true"`
 * - Wait time is displayed as both a number and an `aria-label`-accessible
 *   full phrase so that screen readers announce "12 minutes" not "12m"
 */
export function QueueStatus({ queuePoints }: QueueStatusProps) {
  const getWaitColor = (mins: number) => {
    if (mins < 10) return 'text-green-500';
    if (mins < 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="Queue Wait Times"
    >
      {queuePoints.map((point) => (
        <div
          key={point.queuePointId}
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-between"
          role="article"
          aria-label={`${point.queuePointId}: estimated wait ${point.estimatedWaitMinutes} minutes`}
        >
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">{point.queuePointId}</h4>
            <div className="flex items-center mt-1 space-x-2">
              <Clock
                className={cn('h-5 w-5', getWaitColor(point.estimatedWaitMinutes))}
                aria-hidden="true"
              />
              <span className="text-2xl font-bold" aria-hidden="true">
                {point.estimatedWaitMinutes}m
              </span>
              <span className="sr-only">{point.estimatedWaitMinutes} minutes</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
