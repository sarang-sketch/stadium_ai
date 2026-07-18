'use client';

import React from 'react';
import { Ticket as TicketIcon, AlertCircle } from 'lucide-react';
import { Ticket } from '@/types/index';

interface TicketCardProps {
  ticket: Ticket;
}

/**
 * Ticket display card with details.
 */
export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md" role="article" aria-label={`Ticket ${ticket.id.slice(0, 8)}, Seat ${ticket.seatId}, Price $${ticket.pricePaid.toFixed(2)}${ticket.fraudStatus === 'flagged' ? ', flagged for fraud' : ''}`}>
      <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
      <div className="p-5 pl-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2 text-primary">
            <TicketIcon className="h-5 w-5" aria-hidden="true" />
            <span className="font-bold font-mono text-sm">#{ticket.id.slice(0, 8)}</span>
          </div>
          {ticket.fraudStatus === 'flagged' && (
            <span className="flex items-center text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">
              <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" /> <span>Flagged</span>
            </span>
          )}
        </div>
        
        <div className="space-y-1 mb-4">
          <p className="text-sm text-muted-foreground">Seat</p>
          <p className="text-xl font-bold">{ticket.seatId}</p>
        </div>
        
        <div className="flex justify-between items-end pt-4 border-t border-dashed">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Purchased</p>
            <p className="text-sm font-medium">{new Date(ticket.purchasedAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Price</p>
            <p className="text-lg font-bold">${ticket.pricePaid.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
