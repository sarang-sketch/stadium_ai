import dynamic from "next/dynamic";
import {
  Ticket,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

/**
 * Dynamic pricing and fraud detection panels ship meaningful JS weight
 * (framer-motion + tables/lists) and aren't needed for first paint, so
 * they're lazy-loaded with `next/dynamic`.
 */
const PricingSection = dynamic(
  () => import("./pricing-section").then((mod) => mod.PricingSection),
  {
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-5" aria-hidden="true">
        <LoadingSkeleton variant="card" className="h-64" />
      </div>
    ),
  }
);

const FraudSection = dynamic(
  () => import("./fraud-section").then((mod) => mod.FraudSection),
  {
    loading: () => (
      <div className="space-y-4" aria-hidden="true">
        <LoadingSkeleton variant="card" className="h-48" />
        <LoadingSkeleton variant="card" className="h-48" />
      </div>
    ),
  }
);

/** Demo ticket data. */
const TICKETS = [
  { id: "tkt-001", seat: "Section A, Row R2, Seat 5", match: "Phoenix FC vs Storm City", price: 150, purchasedAt: "Jul 10, 2025", fraudStatus: "clear" as const },
  { id: "tkt-002", seat: "Section B, Row R1, Seat 3", match: "Thunder United vs Valiant SC", price: 100, purchasedAt: "Jul 12, 2025", fraudStatus: "clear" as const },
  { id: "tkt-003", seat: "Section C, Row R3, Seat 7", match: "Apex Rangers vs Dynamo XI", price: 60, purchasedAt: "Jul 14, 2025", fraudStatus: "flagged" as const },
];

const fraudStatusColors = {
  clear: "bg-green-500/10 text-green-400",
  flagged: "bg-red-500/10 text-red-400",
  reviewed: "bg-amber-500/10 text-amber-400",
};

/**
 * Ticketing management page with ticket list, dynamic pricing dashboard,
 * and fraud detection panel.
 *
 * Rendered as a Server Component — the ticket list is static display
 * content with no handlers, so it renders directly on the server. The
 * pricing dashboard and fraud detection panel are animated/interactive
 * client islands, lazy-loaded since they aren't needed for first paint.
 */
export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Ticketing & Pricing"
        subtitle="Dynamic pricing, fraud detection & ticket management"
        backHref="/dashboard"
      />

      <main id="main-content" role="main" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* My Tickets (static) */}
        <section aria-labelledby="tickets-heading">
          <h2 id="tickets-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-blue-500" aria-hidden="true" />
            My Tickets
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {TICKETS.map((ticket) => (
              <article key={ticket.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow" aria-label={`Ticket for ${ticket.match}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${fraudStatusColors[ticket.fraudStatus]}`}>
                    {ticket.fraudStatus === "clear" && <CheckCircle className="h-3 w-3 inline mr-1" aria-hidden="true" />}
                    {ticket.fraudStatus === "flagged" && <AlertTriangle className="h-3 w-3 inline mr-1" aria-hidden="true" />}
                    {ticket.fraudStatus}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{ticket.match}</h3>
                <p className="text-xs text-muted-foreground mb-2">{ticket.seat}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${ticket.price}</span>
                  <span className="text-xs text-muted-foreground">{ticket.purchasedAt}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Dynamic Pricing (lazy-loaded client island) */}
        <PricingSection />

        {/* Fraud Detection (lazy-loaded client island) */}
        <FraudSection />
      </main>
    </div>
  );
}
