"use client";

import { motion } from "framer-motion";
import { Users, Ticket, Trophy, TrendingUp } from "lucide-react";

/** Dashboard metric card data shape. */
interface MetricCard {
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly trend: "up" | "down";
  readonly icon: React.ElementType;
  readonly color: string;
}

/** Sample dashboard metrics for demonstration. */
const METRICS: MetricCard[] = [
  { label: "Active Tournaments", value: "8", change: "+2 this week", trend: "up", icon: Trophy, color: "text-purple-500" },
  { label: "Tickets Sold", value: "12,847", change: "+18% vs last month", trend: "up", icon: Ticket, color: "text-blue-500" },
  { label: "Current Attendance", value: "34,521", change: "82% capacity", trend: "up", icon: Users, color: "text-green-500" },
  { label: "Revenue", value: "$1.2M", change: "+24% growth", trend: "up", icon: TrendingUp, color: "text-amber-500" },
];

/** Animation variants for staggered card entry. */
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/**
 * Animated metrics grid for the dashboard. Isolated as a client island
 * because it relies on framer-motion stagger/entry animations.
 */
export function MetricsSection() {
  return (
    <motion.section
      aria-labelledby="metrics-heading"
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <h2 id="metrics-heading" className="sr-only">Key Metrics</h2>
      {METRICS.map((metric) => (
        <motion.div
          key={metric.label}
          variants={item}
          className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
          role="article"
          aria-label={`${metric.label}: ${metric.value}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
            <metric.icon className={`h-5 w-5 ${metric.color}`} aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold">{metric.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
        </motion.div>
      ))}
    </motion.section>
  );
}
