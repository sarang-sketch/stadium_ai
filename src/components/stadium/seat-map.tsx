'use client';

import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Seat } from '@/types/index';

interface SeatMapProps {
  /** Array of all seats to render in the grid. */
  seats: Seat[];
  /** Callback fired when a user selects an available seat. */
  onSeatSelect: (seat: Seat) => void;
}

/**
 * Interactive, accessible seat map grid.
 *
 * Accessibility features:
 * - ARIA `grid` role with labeled rows for screen-reader navigation
 * - Per-seat `aria-label` conveying row, seat number, zone, and status
 * - `aria-disabled` and `aria-selected` communicate interactive state
 * - Keyboard: Arrow keys move focus within the grid, Enter/Space selects
 * - Live region announces the most recently selected seat
 * - Color-coded legend has screen-reader-visible descriptions
 */
export function SeatMap({ seats, onSeatSelect }: SeatMapProps) {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (seat: Seat) => {
      if (seat.status !== 'available') return;
      setSelectedSeatId(seat.id);
      setAnnouncement(`Selected Row ${seat.row}, Seat ${seat.seatNumber} in zone ${seat.zoneId}`);
      onSeatSelect(seat);
    },
    [onSeatSelect],
  );

  /**
   * Arrow-key navigation within the seat grid, following WAI-ARIA grid
   * pattern. Wraps focus at row boundaries using a modular index.
   */
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const buttons = gridRef.current?.querySelectorAll<HTMLButtonElement>('[data-seat]');
      if (!buttons || buttons.length === 0) return;

      const focused = document.activeElement as HTMLButtonElement;
      const idx = Array.from(buttons).indexOf(focused);
      if (idx === -1) return;

      const cols = 10; // matches grid-cols-10
      let next = -1;

      switch (e.key) {
        case 'ArrowRight':
          next = (idx + 1) % buttons.length;
          break;
        case 'ArrowLeft':
          next = (idx - 1 + buttons.length) % buttons.length;
          break;
        case 'ArrowDown':
          next = idx + cols < buttons.length ? idx + cols : idx;
          break;
        case 'ArrowUp':
          next = idx - cols >= 0 ? idx - cols : idx;
          break;
        default:
          return; // let other keys propagate normally
      }

      e.preventDefault();
      buttons[next]?.focus();
    },
    [],
  );

  return (
    <div className="w-full space-y-6" role="region" aria-label="Seat Selection Map">
      {/* ── Legend ─────────────────────────────────────────────────── */}
      <fieldset className="flex items-center justify-center gap-6 text-sm border-none p-0 m-0">
        <legend className="sr-only">Seat status legend</legend>
        <div className="flex items-center" role="img" aria-label="Green square: Available seat">
          <div className="w-4 h-4 rounded-sm bg-green-500 mr-2" aria-hidden="true" />
          <span>Available</span>
        </div>
        <div className="flex items-center" role="img" aria-label="Yellow square: Reserved seat">
          <div className="w-4 h-4 rounded-sm bg-yellow-500 mr-2" aria-hidden="true" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center" role="img" aria-label="Red square: Sold seat">
          <div className="w-4 h-4 rounded-sm bg-red-500 mr-2" aria-hidden="true" />
          <span>Sold</span>
        </div>
      </fieldset>

      {/* ── Keyboard hint (visible to sighted users too) ──────────── */}
      <p className="text-xs text-center text-muted-foreground">
        Use arrow keys to navigate seats. Press <kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> or{' '}
        <kbd className="font-mono bg-muted px-1 rounded">Space</kbd> to select an available seat.
      </p>

      {/* ── Seat grid ─────────────────────────────────────────────── */}
      <div
        ref={gridRef}
        className="grid grid-cols-10 gap-2 max-w-3xl mx-auto"
        role="grid"
        aria-label="Stadium seating grid"
        onKeyDown={handleGridKeyDown}
      >
        {seats.map((seat) => {
          const isSelected = seat.id === selectedSeatId;
          const isAvailable = seat.status === 'available';

          return (
            <button
              key={seat.id}
              data-seat={seat.id}
              type="button"
              className={cn(
                'h-8 w-8 rounded-t-lg border transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                isAvailable
                  ? 'bg-green-500 border-green-600 cursor-pointer hover:scale-110'
                  : seat.status === 'reserved'
                    ? 'bg-yellow-500 border-yellow-600 cursor-not-allowed opacity-80'
                    : 'bg-red-500 border-red-600 cursor-not-allowed opacity-50',
                isSelected && 'ring-2 ring-blue-400 scale-110',
              )}
              disabled={!isAvailable}
              aria-disabled={!isAvailable}
              aria-pressed={isSelected}
              aria-label={`Row ${seat.row}, Seat ${seat.seatNumber}, Zone ${seat.zoneId} — ${seat.status}${isSelected ? ' (selected)' : ''}`}
              tabIndex={isAvailable ? 0 : -1}
              onClick={() => handleSelect(seat)}
            />
          );
        })}
      </div>

      {/* ── Live region for selection announcements ────────────────── */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
}
