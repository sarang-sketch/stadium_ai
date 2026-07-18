'use client';

import React from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FraudDashboardEntry } from '@/types/index';

interface FraudAlertProps {
  entry: FraudDashboardEntry;
}

/**
 * Fraud alert card for flagged transactions.
 */
export function FraudAlert({ entry }: FraudAlertProps) {
  const { review, signals } = entry;
  const isHighRisk = review.riskScore >= 80;

  const signalDescriptions: string[] = [
    `Purchase velocity: ${signals.purchaseVelocity} in recent window`,
    `Account age: ${signals.accountAgeDays} day(s)`,
    `Payment pattern: ${signals.paymentPattern}`,
    ...(signals.seatAccountMismatchIndicator ? ['Seat/account mismatch detected'] : []),
  ];

  return (
    <div className={cn(
      "rounded-xl border p-5 shadow-sm",
      isHighRisk ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900" : "bg-card"
    )} role="alert">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className={cn("w-5 h-5", isHighRisk ? "text-red-600" : "text-yellow-500")} aria-hidden="true" />
          <h3 className="font-bold">Fraud Review</h3>
        </div>
        <div className="text-right">
          <span className={cn(
            "text-xl font-bold",
            isHighRisk ? "text-red-600" : "text-yellow-600"
          )} aria-hidden="true">
            {Math.round(review.riskScore)}
          </span>
          <span className="text-xs text-muted-foreground block">Risk Score</span>
          <span className="sr-only">Risk score {Math.round(review.riskScore)} out of 100{isHighRisk ? ', high risk' : ''}</span>
        </div>
      </div>
      
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Contributing Signals</p>
        <ul className="space-y-1">
          {signalDescriptions.map((signal: string, idx: number) => (
            <li key={idx} className="text-sm flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50" />
              {signal}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex space-x-2">
        <Button variant={isHighRisk ? "destructive" : "default"} className="flex-1" aria-label={`Block transaction ${review.ticketId}`}>
          Block
        </Button>
        <Button variant="outline" className="flex-1" aria-label={`Approve transaction ${review.ticketId}`}>
          <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" /> Approve
        </Button>
      </div>
    </div>
  );
}
