'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Match } from '@/types/index';

interface BracketViewProps {
  matches: Match[];
}

/**
 * Tournament bracket/fixture display.
 */
export function BracketView({ matches }: BracketViewProps) {
  return (
    <div className="flex flex-col space-y-8 p-4 overflow-x-auto" role="region" aria-label="Tournament Bracket">
      <h2 className="sr-only">Tournament Match Fixtures</h2>
      <div className="flex space-x-12 min-w-max">
        <div className="flex flex-col space-y-6">
          <h3 className="font-bold text-center mb-4">Matches</h3>
          {matches.map((m) => (
            <div key={m.id} className="border rounded-lg p-3 w-64 bg-card shadow-sm" role="article" aria-label={`${m.teamAId} vs ${m.teamBId}, ${m.status}, ${new Date(m.startTime).toLocaleDateString()}`}>
              <div className="flex justify-between items-center mb-2 pb-2 border-b">
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  {new Date(m.startTime).toLocaleDateString()}
                </span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full", 
                  m.status === 'completed' ? 'bg-muted text-muted-foreground' :
                  m.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary')}>
                  {m.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-medium">{m.teamAId}</span>
              </div>
              <div className="text-center text-xs text-muted-foreground py-1">vs</div>
              <div className="flex justify-between items-center py-1">
                <span className="font-medium">{m.teamBId}</span>
              </div>
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">{m.venue}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
