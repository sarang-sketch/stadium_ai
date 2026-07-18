"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import type { CrowdDensityLevel } from "@/types/stadium.types";

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

/** Color mapping for crowd density levels. */
const DENSITY_COLORS: Record<CrowdDensityLevel, string> = {
  low: "bg-green-500/20 border-green-500/40 text-green-300",
  moderate: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  high: "bg-orange-500/20 border-orange-500/40 text-orange-300",
  critical: "bg-red-500/20 border-red-500/40 text-red-300",
};

/**
 * Crowd density heatmap with animated occupancy bars. Isolated as a
 * client island because it uses framer-motion for the progress bar
 * fill animation, and lazy-loaded since it's a decorative visualization
 * not needed for first paint.
 */
export function CrowdDensitySection() {
  return (
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
  );
}
