import {
  Ticket,
  Trophy,
  MapPin,
  Shield,
  BarChart3,
  AlertTriangle,
  Bot,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MetricsSection } from "./metrics-section";

/** Quick action links displayed below the metrics. */
const QUICK_ACTIONS = [
  { label: "Stadium Management", href: "/stadium", icon: MapPin, description: "Seat maps, crowd density, queue predictions" },
  { label: "Tournament Operations", href: "/tournament", icon: Trophy, description: "Fixtures, scheduling, match predictions" },
  { label: "Ticketing & Pricing", href: "/tickets", icon: Ticket, description: "Dynamic pricing, fraud detection" },
] as const;

/** Recent AI activity log entries for the dashboard feed. */
const AI_ACTIVITY = [
  { icon: Bot, message: "AI Chatbot handled 142 fan queries in the last hour", time: "2 min ago", color: "text-cyan-500" },
  { icon: Shield, message: "Fraud Detection flagged 3 suspicious transactions for review", time: "15 min ago", color: "text-red-500" },
  { icon: BarChart3, message: "Queue prediction updated: Gate B wait time reduced to 4 min", time: "22 min ago", color: "text-green-500" },
  { icon: AlertTriangle, message: "Emergency route recalculated for Zone C due to congestion", time: "1 hr ago", color: "text-amber-500" },
  { icon: Zap, message: "Dynamic pricing adjusted VIP seats by +12% based on demand surge", time: "1 hr ago", color: "text-purple-500" },
];

/**
 * Main dashboard page displaying key metrics, quick actions, and an AI
 * activity feed. Serves as the command center for stadium operations.
 *
 * Rendered as a Server Component — only the animated metrics grid needs
 * client-side interactivity, so it is isolated into `MetricsSection`.
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" role="main" className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of stadium operations and AI insights.
          </p>
        </div>

        {/* Metrics Grid (client island) */}
        <MetricsSection />

        {/* Quick Actions + AI Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <section aria-labelledby="actions-heading" className="lg:col-span-2">
            <h2 id="actions-heading" className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-blue-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label={action.label}
                >
                  <action.icon className="h-8 w-8 text-blue-500 mb-3" aria-hidden="true" />
                  <h3 className="font-semibold text-sm mb-1">{action.label}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* AI Activity Feed */}
          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="text-lg font-semibold mb-4">AI Activity</h2>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {AI_ACTIVITY.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 p-4" role="article" aria-label={entry.message}>
                  <entry.icon className={`h-4 w-4 mt-0.5 shrink-0 ${entry.color}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{entry.message}</p>
                    <time className="text-xs text-muted-foreground mt-0.5 block">{entry.time}</time>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <section className="mt-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Powered by Google Gemini AI</h2>
          <p className="text-blue-100 text-sm mb-4">
            Every AI feature uses Gemini with intelligent heuristic fallbacks for 100% uptime.
          </p>
          <Button className="bg-white text-blue-600 hover:bg-blue-50 h-10 px-5">
            View AI Features
          </Button>
        </section>
      </main>
    </div>
  );
}
