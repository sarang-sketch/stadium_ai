'use client';

import React from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import { PricingDashboardEntry } from '@/types/index';

interface PricingChartProps {
  entries: PricingDashboardEntry[];
}

/**
 * Dynamic pricing visualization.
 */
export function PricingChart({ entries }: PricingChartProps) {
  return (
    <div className="border rounded-xl bg-card p-6" role="region" aria-label="Pricing Chart">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" aria-hidden="true" />
          Dynamic Pricing Trends
        </h3>
      </div>
      
      <div className="space-y-5">
        {entries.map((entry, idx: number) => {
          const basePrice = entry.pricingRule.minPrice;
          const diff = entry.computedPrice - basePrice;
          const pct = basePrice > 0 ? Math.round((diff / basePrice) * 100) : 0;
          
          return (
            <div key={idx} className="space-y-2" role="article" aria-label={`${entry.category}: $${entry.computedPrice}, ${pct > 0 ? '+' : ''}${pct}% from base`}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{entry.category}</span>
                <span className="flex items-center space-x-2">
                  {entry.source === 'gemini' && <Sparkles className="w-3 h-3 text-purple-500" aria-hidden="true" />}
                  <span className="font-bold">${entry.computedPrice}</span>
                  <span className={pct > 0 ? 'text-green-500' : pct < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                    {pct > 0 ? '+' : ''}{pct}%
                  </span>
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex" role="img" aria-label={`Price bar: ${pct > 0 ? '+' : ''}${pct}% change`}>
                <div 
                  className="bg-primary h-full" 
                  style={{ width: '50%' }} 
                  aria-hidden="true"
                />
                <div 
                  className={pct > 0 ? 'bg-green-500 h-full' : 'bg-red-500 h-full'} 
                  style={{ width: `${Math.min(Math.abs(pct), 50)}%` }} 
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
