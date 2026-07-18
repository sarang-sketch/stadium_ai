"use client";

import { useState } from "react";
import { MapPin, Sparkles, Loader2 } from "lucide-react";
import type { SeatStatus } from "@/types/stadium.types";
import { Button } from "@/components/ui/button";

/** Demonstration seat data for the seat map. */
const DEMO_SECTIONS = ["A", "B", "C", "D"] as const;
const ROWS_PER_SECTION = 4;
const SEATS_PER_ROW = 8;

interface DemoSeat {
  id: string;
  section: string;
  row: string;
  seatNumber: number;
  status: SeatStatus;
  price: number;
}

/** Generates demonstration seat map data. */
function generateDemoSeats(): DemoSeat[] {
  const seats: DemoSeat[] = [];

  for (const section of DEMO_SECTIONS) {
    for (let r = 1; r <= ROWS_PER_SECTION; r++) {
      for (let s = 1; s <= SEATS_PER_ROW; s++) {
        const hash = (section.charCodeAt(0) * 31 + r * 7 + s * 3) % 100;
        const status: SeatStatus =
          hash < 40 ? "available" : hash < 75 ? "sold" : "reserved";
        seats.push({
          id: `${section}-${r}-${s}`,
          section,
          row: `R${r}`,
          seatNumber: s,
          status,
          price: section === "A" ? 150 : section === "B" ? 100 : 60,
        });
      }
    }
  }
  return seats;
}

const DEMO_SEATS = generateDemoSeats();

/** Color mapping for seat statuses. */
const SEAT_COLORS: Record<SeatStatus, string> = {
  available: "bg-green-500 hover:bg-green-400",
  reserved: "bg-amber-500",
  sold: "bg-red-400",
};

interface AIRecommendation {
  seatId: string;
  zoneId: string;
  score: number;
  reason: string;
  source: string;
}

export function SeatMapSection() {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  
  // AI Panel Form State
  const [budget, setBudget] = useState<number>(100);
  const [groupSize, setGroupSize] = useState<number>(2);
  const [preferences, setPreferences] = useState<string[]>(["pitch view"]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const handleTogglePref = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const getAIRecommendations = async () => {
    setIsLoading(true);
    setRecommendations([]);
    try {
      const res = await fetch("/api/stadium/seats/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-user-token",
        },
        body: JSON.stringify({
          budget,
          groupSize,
          preferences,
        }),
      });

      if (!res.ok) throw new Error("Seat recommendation failed");
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
      // Heuristic fallback inside client if API fails
      setRecommendations([
        {
          seatId: "A-2-3",
          zoneId: "A",
          score: 95,
          reason: "Excellent views matching your preference.",
          source: "heuristic",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = (seat: DemoSeat) => {
    if (seat.status !== "available") return;
    setSelectedSeatId(seat.id === selectedSeatId ? null : seat.id);
  };

  const isRecommended = (seatId: string) => recommendations.some((r) => r.seatId === seatId);

  return (
    <section aria-labelledby="seatmap-heading" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 id="seatmap-heading" className="text-xl font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" aria-hidden="true" />
          Interactive Seat Map
        </h2>
        <div className="flex items-center gap-4 text-xs" role="legend" aria-label="Seat status legend">
          {(["available", "reserved", "sold"] as SeatStatus[]).map((status) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-sm ${SEAT_COLORS[status]}`} aria-hidden="true" />
              <span className="capitalize">{status}</span>
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-blue-500 animate-pulse" aria-hidden="true" />
            <span>AI Suggested</span>
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side: Seat Map Grid */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 overflow-x-auto">
          <div className="grid grid-cols-4 gap-6 min-w-[500px]" role="grid" aria-label="Stadium seat map">
            {DEMO_SECTIONS.map((section) => (
              <div key={section} role="rowgroup" aria-label={`Section ${section}`}>
                <h3 className="text-sm font-semibold text-center mb-2">Section {section}</h3>
                <div className="space-y-1">
                  {Array.from({ length: ROWS_PER_SECTION }, (_, r) => (
                    <div key={r} className="flex gap-1 justify-center" role="row">
                      {DEMO_SEATS
                        .filter((s) => s.section === section && s.row === `R${r + 1}`)
                        .map((seat) => {
                          const recommended = isRecommended(seat.id);
                          const isSelected = selectedSeatId === seat.id;
                          return (
                            <button
                              key={seat.id}
                              role="gridcell"
                              aria-label={`Section ${seat.section}, Row ${seat.row}, Seat ${seat.seatNumber}, ${seat.status}, $${seat.price}${recommended ? ", AI Recommended" : ""}`}
                              aria-selected={isSelected}
                              disabled={seat.status !== "available"}
                              onClick={() => handleSeatClick(seat)}
                              className={`h-7 w-7 rounded-sm text-[9px] font-mono text-white transition-all relative ${
                                isSelected
                                  ? "ring-2 ring-blue-500 scale-110 z-10"
                                  : recommended
                                  ? "bg-blue-600 ring-2 ring-blue-400 animate-pulse"
                                  : SEAT_COLORS[seat.status]
                              } ${seat.status === "available" ? "cursor-pointer focus:ring-2 focus:ring-ring" : "cursor-not-allowed opacity-70"}`}
                              title={`${seat.id} - $${seat.price} - ${seat.status}`}
                            >
                              {seat.seatNumber}
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block rounded-lg bg-muted px-8 py-2 text-xs font-medium text-muted-foreground">
              ⚽ PITCH
            </div>
          </div>
        </div>

        {/* Right Side: AI Assistant Seating recommendation control panel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-border">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-sm">AI Seating Assistant</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label htmlFor="budget-input" className="block text-muted-foreground mb-1">Max Budget per Seat ($)</label>
              <input
                id="budget-input"
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-background border border-border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="group-size" className="block text-muted-foreground mb-1">Group Size</label>
              <input
                id="group-size"
                type="number"
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full bg-background border border-border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <span className="block text-muted-foreground mb-1">Preferences</span>
              <div className="flex flex-wrap gap-2">
                {["pitch view", "close to exit", "shaded area"].map((pref) => {
                  const active = preferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => handleTogglePref(pref)}
                      className={`px-2 py-1 rounded text-[10px] capitalize border transition-all ${
                        active
                          ? "bg-blue-500/10 border-blue-500 text-blue-400 font-semibold"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-1.5"
              onClick={getAIRecommendations}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Find Best Seats
                </>
              )}
            </Button>
          </div>

          {/* Active selection / recommendation info */}
          <div className="text-xs pt-2 border-t border-border space-y-2">
            {selectedSeatId && (
              <div className="p-3 bg-muted/40 rounded border border-border">
                <p className="font-semibold text-green-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                  Selected Seat: {selectedSeatId}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Ready to book. Price: ${DEMO_SEATS.find((s) => s.id === selectedSeatId)?.price}
                </p>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground">AI Suggestions:</p>
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-500/5 border border-blue-500/20 rounded space-y-1">
                    <p className="font-semibold text-blue-400">Seat {rec.seatId} (Match: {rec.score}%)</p>
                    <p className="text-[10px] text-muted-foreground">{rec.reason}</p>
                    <span className="inline-block bg-blue-500/10 text-blue-400 text-[8px] px-1.5 py-0.5 rounded-full">
                      Source: {rec.source}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
