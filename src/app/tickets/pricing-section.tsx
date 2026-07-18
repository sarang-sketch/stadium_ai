"use client";

import { TrendingUp, Zap } from "lucide-react";

/** Demo dynamic pricing entries. */
const PRICING_ENTRIES = [
  { category: "VIP", basePrice: 200, computedPrice: 245, change: "+22.5%", source: "gemini" as const, rule: { min: 150, max: 300 } },
  { category: "Premium", basePrice: 120, computedPrice: 138, change: "+15.0%", source: "gemini" as const, rule: { min: 80, max: 200 } },
  { category: "General", basePrice: 60, computedPrice: 54, change: "-10.0%", source: "heuristic" as const, rule: { min: 30, max: 100 } },
  { category: "Student", basePrice: 30, computedPrice: 28, change: "-6.7%", source: "heuristic" as const, rule: { min: 15, max: 50 } },
];

/**
 * Dynamic pricing dashboard table. Isolated as a client island and
 * lazy-loaded to keep it out of the initial bundle since it's a
 * secondary, below-the-fold data visualization.
 */
export function PricingSection() {
  return (
    <section aria-labelledby="pricing-heading">
      <h2 id="pricing-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-amber-500" aria-hidden="true" />
        Dynamic Pricing Dashboard
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm" role="table" aria-label="Dynamic pricing by seat category">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="text-left px-4 py-3 font-medium">Category</th>
              <th scope="col" className="text-right px-4 py-3 font-medium">Base Price</th>
              <th scope="col" className="text-right px-4 py-3 font-medium">Current Price</th>
              <th scope="col" className="text-right px-4 py-3 font-medium">Change</th>
              <th scope="col" className="text-center px-4 py-3 font-medium">Source</th>
              <th scope="col" className="text-center px-4 py-3 font-medium">Rule (Min–Max)</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_ENTRIES.map((entry) => (
              <tr key={entry.category} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{entry.category}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">${entry.basePrice}</td>
                <td className="px-4 py-3 text-right font-semibold">${entry.computedPrice}</td>
                <td className={`px-4 py-3 text-right font-medium ${entry.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{entry.change}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${entry.source === "gemini" ? "bg-blue-500/10 text-blue-400" : "bg-muted text-muted-foreground"}`}>
                    {entry.source === "gemini" && <Zap className="h-3 w-3" aria-hidden="true" />}
                    {entry.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-muted-foreground">${entry.rule.min}–${entry.rule.max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
