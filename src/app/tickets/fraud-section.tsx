"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
 * Fraud detection dashboard with animated risk entries and action
 * buttons. Isolated as a client island (framer-motion entry animation +
 * event handlers) and lazy-loaded since it ships meaningful JS weight
 * and isn't needed for first paint.
 */
export function FraudSection() {
  return (
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
  );
}
