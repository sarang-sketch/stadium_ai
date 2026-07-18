'use client';

import React from 'react';
import { User } from 'lucide-react';
import { Player, PlayerAggregatedStats } from '@/types/index';

interface PlayerCardProps {
  player: Player;
  stats: PlayerAggregatedStats;
}

/**
 * Player statistics card.
 */
export function PlayerCard({ player, stats }: PlayerCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow" role="article" aria-label={`${player.name}, ${player.position}: ${stats.totalGoals} goals, ${stats.totalAssists} assists, ${stats.totalMinutesPlayed} minutes played`}>
      <div className="flex items-center space-x-4 border-b pb-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight">{player.name}</h3>
          <p className="text-sm text-muted-foreground">{player.position}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">{stats.totalGoals}</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">Goals</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.totalAssists}</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">Assists</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.totalMinutesPlayed}</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">Minutes</p>
        </div>
      </div>
    </div>
  );
}
