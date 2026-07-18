"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

/** Demo AI match prediction. */
const PREDICTION = {
  matchId: "m3",
  teamA: "Phoenix FC",
  teamB: "Storm City",
  predictedOutcome: "teamA" as const,
  confidence: 67,
  source: "gemini" as const,
};

/**
 * AI match prediction panel with an animated confidence bar. Isolated as
 * a client island (framer-motion width animation) and lazy-loaded since
 * it's a decorative visualization not needed for first paint.
 */
export function PredictionPanel() {
  return (
    <section aria-labelledby="prediction-heading">
      <h2 id="prediction-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-amber-500" aria-hidden="true" />
        AI Prediction
      </h2>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium mb-3">{PREDICTION.teamA} vs {PREDICTION.teamB}</p>
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground mb-1">Predicted Winner</p>
          <p className="text-2xl font-bold text-blue-400">{PREDICTION.predictedOutcome === "teamA" ? PREDICTION.teamA : PREDICTION.teamB}</p>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Confidence</span>
            <span className="font-semibold">{PREDICTION.confidence}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={PREDICTION.confidence} aria-valuemin={0} aria-valuemax={100} aria-label={`${PREDICTION.confidence}% confidence`}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${PREDICTION.confidence}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
            <Zap className="h-3 w-3" aria-hidden="true" />
            Source: {PREDICTION.source}
          </span>
        </div>
      </div>
    </section>
  );
}
