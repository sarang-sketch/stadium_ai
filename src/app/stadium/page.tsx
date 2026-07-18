import dynamic from "next/dynamic";
import {
  BarChart3,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

/**
 * Interactive seat map and crowd density heatmap are the heaviest,
 * decorative client islands on this page (per-seat buttons + animated
 * progress bars) and aren't needed for first paint, so they're
 * lazy-loaded with `next/dynamic`.
 */
const SeatMapSection = dynamic(
  () => import("./seat-map-section").then((mod) => mod.SeatMapSection),
  {
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-6 space-y-3" aria-hidden="true">
        <LoadingSkeleton variant="card" className="h-64" />
      </div>
    ),
  }
);

const CrowdDensitySection = dynamic(
  () => import("./crowd-density-section").then((mod) => mod.CrowdDensitySection),
  {
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-5 space-y-3" aria-hidden="true">
        <LoadingSkeleton variant="card" className="h-56" />
      </div>
    ),
  }
);

/**
 * Stadium management page with interactive seat map, crowd density heatmap,
 * queue predictions, and emergency routing controls.
 *
 * Rendered as a Server Component — the seat map and crowd density panels
 * are the only sections that need client-side interactivity/animation, so
 * they're isolated into lazy-loaded client islands. Queue predictions and
 * emergency routing are static display content rendered on the server.
 */
export default function StadiumPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Stadium Management"
        subtitle="AI-powered seat maps, crowd density & emergency routing"
        backHref="/dashboard"
      />

      <main id="main-content" role="main" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Seat Map (lazy-loaded client island) */}
        <SeatMapSection />

        {/* Crowd Density + Queue Predictions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Crowd Density Heatmap (lazy-loaded client island) */}
          <CrowdDensitySection />

          {/* Queue Predictions (static) */}
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

        {/* Emergency Routing (static) */}
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
