"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  BarChart3,
  AlertTriangle,
  Zap,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SeatStatus, CrowdDensityLevel } from "@/types/stadium.types";

/** Demonstration seat data for the seat map. */
const DEMO_SECTIONS = ["A", "B", "C", "D"] as const;
const ROWS_PER_SECTION = 4;
const SEATS_PER_ROW = 8;

/** Generates demonstration seat map data. */
function generateDemoSeats() {
  const seats: Array<{
    id: string;
    section: string;
    row: string;
    seatNumber: number;
    status: SeatStatus;
    price: number;
  }> = [];

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

/** Demonstration crowd density data per zone. */
const DEMO_ZONES: Array<{
  zoneId: string;
  name: string;
  level: CrowdDensityLevel;
  occupancy: number;
}> = [
  { zoneId: "north", name: "North Stand", level: "high", occupancy: 0.85 },
  { zoneId: "south", name: "South Stand", level: "moderate", occupancy: 0.62 },
  { zoneId: "east", name: "East Wing", level: "low", occupancy: 0.34 },
  { zoneId: "west", name: "West Wing", level: "critical", occupancy: 0.94 },
];

/** Color mapping for seat statuses. */
const SEAT_COLORS: Record<SeatStatus, string> = {
  available: "bg-green-500 hover:bg-green-400",
  reserved: "bg-amber-500",
  sold: "bg-red-400",
};

/** Color mapping for crowd density levels. */
const DENSITY_COLORS: Record<CrowdDensityLevel, string> = {
  low: "bg-green-500/20 border-green-500/40 text-green-300",
  moderate: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  high: "bg-orange-500/20 border-orange-500/40 text-orange-300",
  critical: "bg-red-500/20 border-red-500/40 text-red-300",
};

/**
 * Stadium management page with interactive seat map, crowd density heatmap,
 * queue predictions, and emergency routing controls.
 */
export default function StadiumPage() {
  const seats = generateDemoSeats();

  return (
    <div className="min-h-screen bg-background">
      <header role="banner" className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-4 px-6 py-3 max-w-7xl mx-auto">
          <Link href="/dashboard" aria-label="Back to Dashboard">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">Stadium Management</h1>
            <p className="text-xs text-muted-foreground">AI-powered seat maps, crowd density & emergency routing</p>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Seat Map */}
        <section aria-labelledby="seatmap-heading">
          <div className="flex items-center justify-between mb-4">
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
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 overflow-x-auto">
            <div className="grid grid-cols-4 gap-6 min-w-[600px]" role="grid" aria-label="Stadium seat map">
              {DEMO_SECTIONS.map((section) => (
                <div key={section} role="rowgroup" aria-label={`Section ${section}`}>
                  <h3 className="text-sm font-semibold text-center mb-2">Section {section}</h3>
                  <div className="space-y-1">
                    {Array.from({ length: ROWS_PER_SECTION }, (_, r) => (
                      <div key={r} className="flex gap-1 justify-center" role="row">
                        {seats
                          .filter((s) => s.section === section && s.row === `R${r + 1}`)
                          .map((seat) => (
                            <button
                              key={seat.id}
                              role="gridcell"
                              aria-label={`Section ${seat.section}, Row ${seat.row}, Seat ${seat.seatNumber}, ${seat.status}, $${seat.price}`}
                              disabled={seat.status !== "available"}
                              className={`h-6 w-6 rounded-sm text-[9px] font-mono text-white transition-all ${SEAT_COLORS[seat.status]} ${seat.status === "available" ? "cursor-pointer focus:ring-2 focus:ring-ring" : "cursor-not-allowed opacity-70"}`}
                              title={`${seat.id} - $${seat.price} - ${seat.status}`}
                            >
                              {seat.seatNumber}
                            </button>
                          ))}
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
        </section>

        {/* Crowd Density + Queue Predictions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Crowd Density Heatmap */}
          <section aria-labelledby="density-heading">
            <h2 id="density-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-orange-500" aria-hidden="true" />
              Crowd Density
            </h2>
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              {DEMO_ZONES.map((zone) => (
                <div
                  key={zone.zoneId}
                  className={`rounded-lg border p-4 ${DENSITY_COLORS[zone.level]}`}
                  role="article"
                  aria-label={`${zone.name}: ${zone.level} density, ${Math.round(zone.occupancy * 100)}% occupancy`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{zone.name}</span>
                    <span className="text-xs font-medium uppercase">{zone.level}</span>
                  </div>
                  <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(zone.occupancy * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${zone.occupancy * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-current rounded-full"
                    />
                  </div>
                  <p className="text-xs mt-1">{Math.round(zone.occupancy * 100)}% capacity</p>
                </div>
              ))}
            </div>
          </section>

          {/* Queue Predictions */}
          <section aria-labelledby="queue-heading">
            <h2 id="queue-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-green-500" aria-hidden="true" />
              Queue Wait Times
            </h2>
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              {[
                { name: "Gate A (Main)", wait: 3, type: "entry_gate" },
                { name: "Gate B (North)", wait: 8, type: "entry_gate" },
                { name: "Gate C (South)", wait: 2, type: "entry_gate" },
                { name: "Food Court 1", wait: 12, type: "concession" },
                { name: "Food Court 2", wait: 5, type: "concession" },
                { name: "Restroom Block A", wait: 4, type: "concession" },
              ].map((qp) => (
                <div key={qp.name} className="flex items-center justify-between rounded-lg border border-border p-3" role="article" aria-label={`${qp.name}: ${qp.wait} minute wait`}>
                  <div>
                    <p className="text-sm font-medium">{qp.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{qp.type.replace("_", " ")}</p>
                  </div>
                  <span className={`text-lg font-bold ${qp.wait > 10 ? "text-red-500" : qp.wait > 5 ? "text-amber-500" : "text-green-500"}`}>
                    {qp.wait} min
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Emergency Routing */}
        <section aria-labelledby="emergency-heading">
          <h2 id="emergency-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
            Emergency Evacuation Routes
          </h2>
          <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">Route: North Stand → Exit A</h3>
                <ol className="space-y-1.5 text-sm text-muted-foreground" role="list">
                  <li className="flex items-start gap-2"><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded" aria-hidden="true">1</span>Exit zone through the nearest marked evacuation door.</li>
                  <li className="flex items-start gap-2"><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded" aria-hidden="true">2</span>Proceed straight past the main concourse.</li>
                  <li className="flex items-start gap-2"><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded" aria-hidden="true">3</span>Turn and continue past the security checkpoint.</li>
                  <li className="flex items-start gap-2"><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded" aria-hidden="true">4</span>Follow the illuminated exit signage to reach Exit A.</li>
                </ol>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 bg-red-500/10 rounded-lg p-6">
                <Zap className="h-10 w-10 text-red-500" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">~2 min</p>
                  <p className="text-xs text-muted-foreground">Estimated evacuation time</p>
                  <p className="text-xs text-muted-foreground">Distance: 180m</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
