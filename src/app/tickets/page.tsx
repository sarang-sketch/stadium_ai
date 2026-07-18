"use client";

import { motion } from "framer-motion";
import {
  Ticket,
  Shield,
  TrendingUp,
  ArrowLeft,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Demo ticket data. */
const TICKETS = [
  { id: "tkt-001", seat: "Section A, Row R2, Seat 5", match: "Phoenix FC vs Storm City", price: 150, purchasedAt: "Jul 10, 2025", fraudStatus: "clear" as const },
  { id: "tkt-002", seat: "Section B, Row R1, Seat 3", match: "Thunder United vs Valiant SC", price: 100, purchasedAt: "Jul 12, 2025", fraudStatus: "clear" as const },
  { id: "tkt-003", seat: "Section C, Row R3, Seat 7", match: "Apex Rangers vs Dynamo XI", price: 60, purchasedAt: "Jul 14, 2025", fraudStatus: "flagged" as const },
];

/** Demo dynamic pricing entries. */
const PRICING_ENTRIES = [
  { category: "VIP", basePrice: 200, computedPrice: 245, change: "+22.5%", source: "gemini" as const, rule: { min: 150, max: 300 } },
  { category: "Premium", basePrice: 120, computedPrice: 138, change: "+15.0%", source: "gemini" as const, rule: { min: 80, max: 200 } },
  { category: "General", basePrice: 60, computedPrice: 54, change: "-10.0%", source: "heuristic" as const, rule: { min: 30, max: 100 } },
  { category: "Student", basePrice: 30, computedPrice: 28, change: "-6.7%", source: "heuristic" as const, rule: { min: 15, max: 50 } },
];

/** Demo fraud dashboard entries. */
const FRAUD_ENTRIES = [
  { ticketId: "tkt-f1", riskScore: 87, purchaseVelocity: 15, accountAge: 2, mismatch: true, paymentPattern: "multiple_cards_same_session", status: "flagged" as const },
  { ticketId: "tkt-f2", riskScore: 72, purchaseVelocity: 8, accountAge: 14, mismatch: false, paymentPattern: "new_card", status: "flagged" as const },
  { ticketId: "tkt-f3", riskScore: 65, purchaseVelocity: 12, accountAge: 5, mismatch: true, paymentPattern: "new_card", status: "reviewed" as const },
];

const fraudStatusColors = {
  clear: "bg-green-500/10 text-green-400",
  flagged: "bg-red-500/10 text-red-400",
  reviewed: "bg-amber-500/10 text-amber-400",
};

/**
 * Ticketing management page with ticket list, dynamic pricing dashboard,
 * and fraud detection panel.
 */
export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header role="banner" className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-4 px-6 py-3 max-w-7xl mx-auto">
          <Link href="/dashboard" aria-label="Back to Dashboard">
            <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">Ticketing & Pricing</h1>
            <p className="text-xs text-muted-foreground">Dynamic pricing, fraud detection & ticket management</p>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* My Tickets */}
        <section aria-labelledby="tickets-heading">
          <h2 id="tickets-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-blue-500" aria-hidden="true" />
            My Tickets
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {TICKETS.map((ticket) => (
              <motion.article key={ticket.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow" aria-label={`Ticket for ${ticket.match}`}>
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
              </motion.article>
            ))}
          </div>
        </section>

        {/* Dynamic Pricing */}
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

        {/* Fraud Detection */}
        <section aria-labelledby="fraud-heading">
          <h2 id="fraud-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-500" aria-hidden="true" />
            Fraud Detection Dashboard
          </h2>
          <div className="space-y-4">
            {FRAUD_ENTRIES.map((entry) => (
              <motion.div key={entry.ticketId} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border-2 border-red-500/20 bg-red-500/5 p-5" role="alert" aria-label={`Fraud alert: Ticket ${entry.ticketId}, risk score ${entry.riskScore}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
                      Ticket {entry.ticketId}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize mt-1 inline-block ${fraudStatusColors[entry.status]}`}>{entry.status}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className={`text-3xl font-bold ${entry.riskScore >= 80 ? "text-red-400" : entry.riskScore >= 60 ? "text-amber-400" : "text-green-400"}`}>{entry.riskScore}</p>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-3" role="progressbar" aria-valuenow={entry.riskScore} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`h-full rounded-full ${entry.riskScore >= 80 ? "bg-red-500" : entry.riskScore >= 60 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${entry.riskScore}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Purchase Velocity</p>
                    <p className="font-semibold">{entry.purchaseVelocity} txns/hr</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Age</p>
                    <p className="font-semibold">{entry.accountAge} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mismatch</p>
                    <p className={`font-semibold ${entry.mismatch ? "text-red-400" : "text-green-400"}`}>{entry.mismatch ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <p className="font-semibold">{entry.paymentPattern.replace(/_/g, " ")}</p>
                  </div>
                </div>
                {entry.status === "flagged" && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white">Mark Safe</Button>
                    <Button size="sm" variant="destructive">Confirm Fraud</Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
