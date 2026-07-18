import {
  Zap,
  Shield,
  BarChart3,
  MapPin,
  Users,
  Trophy,
  Ticket,
  Bot,
  AlertTriangle,
  TrendingUp,
  Eye,
  CalendarDays,
  ArrowRight,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "./hero-section";

/* ─── data ────────────────────────────────────────────────────────── */
const AI_FEATURES = [
  { icon: MapPin, title: "Smart Seat Recommendation", desc: "AI suggests optimal seats based on budget, proximity, and group size.", color: "from-blue-500 to-cyan-400", iconColor: "text-blue-400" },
  { icon: Users, title: "Crowd Density Prediction", desc: "Real-time zone-level occupancy forecasting using vision AI.", color: "from-orange-500 to-amber-400", iconColor: "text-orange-400" },
  { icon: BarChart3, title: "Queue Wait Prediction", desc: "Estimated wait times for gates and concessions with ML.", color: "from-green-500 to-emerald-400", iconColor: "text-green-400" },
  { icon: Trophy, title: "Match Outcome Prediction", desc: "Gemini-powered predictions with confidence scoring.", color: "from-purple-500 to-violet-400", iconColor: "text-purple-400" },
  { icon: Bot, title: "AI Chatbot Assistant", desc: "Multilingual stadium assistant for tickets, navigation, and schedules.", color: "from-cyan-500 to-teal-400", iconColor: "text-cyan-400" },
  { icon: CalendarDays, title: "Tournament Scheduler", desc: "Automatic round-robin fixture generation with constraint solving.", color: "from-indigo-500 to-blue-400", iconColor: "text-indigo-400" },
  { icon: Ticket, title: "Dynamic Pricing Engine", desc: "Demand-driven ticket pricing with admin-defined price bounds.", color: "from-amber-500 to-yellow-400", iconColor: "text-amber-400" },
  { icon: Shield, title: "Fraud Detection", desc: "Behavioral anomaly scoring to flag suspicious transactions in real-time.", color: "from-red-500 to-rose-400", iconColor: "text-red-400" },
  { icon: AlertTriangle, title: "Emergency Routing", desc: "AI-generated evacuation routes from any zone to the nearest exit.", color: "from-rose-500 to-pink-400", iconColor: "text-rose-400" },
  { icon: TrendingUp, title: "Player Statistics", desc: "Aggregated performance metrics across all tournament matches.", color: "from-teal-500 to-cyan-400", iconColor: "text-teal-400" },
  { icon: Eye, title: "Tournament Insights", desc: "Post-match analysis and trend reports powered by Gemini AI.", color: "from-violet-500 to-purple-400", iconColor: "text-violet-400" },
  { icon: Zap, title: "Real-time Analytics", desc: "Revenue, attendance, and fraud dashboards with live streaming data.", color: "from-yellow-500 to-orange-400", iconColor: "text-yellow-400" },
] as const;

const STATS = [
  { label: "AI Features", value: "12", suffix: "+" },
  { label: "GCP Services", value: "12", suffix: "" },
  { label: "API Endpoints", value: "15", suffix: "" },
  { label: "Test Coverage", value: "70", suffix: " tests" },
] as const;

const GCP_SERVICES = [
  "Gemini 2.0 Flash", "Firebase Auth", "Firestore", "Cloud Vision AI",
  "Speech-to-Text", "Cloud Translate", "BigQuery", "Cloud Tasks",
  "Cloud Scheduler", "Cloud Logging", "Secret Manager", "Firebase Storage",
] as const;

const ARCHITECTURE_COLUMNS = [
  {
    title: "Clean Architecture",
    gradient: "from-blue-500/20 to-transparent",
    items: ["Repository Pattern", "Service Layer", "Adapter Pattern", "Dependency Injection"],
  },
  {
    title: "Security First",
    gradient: "from-red-500/20 to-transparent",
    items: ["Firebase Auth + RBAC", "Zod Input Validation", "Token Bucket Rate Limiter", "CSP / HSTS Headers"],
  },
  {
    title: "Performance",
    gradient: "from-green-500/20 to-transparent",
    items: ["React Server Components", "Lazy Loading & Code Split", "Seeded-Hash Mock Adapters", "Optimized Production Builds"],
  },
] as const;

/* ─── page component (Server Component) ─────────────────────────────
 * Only the scroll-parallax hero requires client-side hooks. Everything
 * below is static content, so it is rendered directly on the server —
 * no JS shipped for these sections beyond the shared Button primitive.
 * ────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* ═══════════════════ HERO (client island) ═══════════════════ */}
      <HeroSection />

      {/* ═══════════════════ LIVE STATS BAR ═════════════════════════ */}
      <section className="relative z-20 -mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-[#0a0a0f]/80 backdrop-blur-xl p-6 text-center">
                <p className="text-3xl md:text-4xl font-black text-white">
                  {stat.value}
                  <span className="text-blue-400">{stat.suffix}</span>
                </p>
                <p className="text-xs text-white/50 mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════════════════ */}
      <main id="main-content" role="main" className="flex-1 bg-[#0a0a0f]">
        <section aria-labelledby="features-heading" className="py-28 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400 mb-4">
              <Zap className="h-3 w-3" aria-hidden="true" />
              AI-Powered
            </span>
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              12 Intelligent Features
            </h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto leading-relaxed">
              Every feature uses Gemini AI with intelligent heuristic fallbacks — ensuring 100% uptime,
              zero-dependency operation, and graceful degradation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {AI_FEATURES.map((f) => (
              <article
                key={f.title}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-xl hover:shadow-blue-500/5"
                tabIndex={0}
                aria-label={f.title}
              >
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <f.icon className={`h-7 w-7 ${f.iconColor} mb-4 group-hover:scale-110 transition-transform`} aria-hidden="true" />
                <h3 className="font-semibold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════════════ GCP SERVICES ═══════════════════════════ */}
        <section aria-labelledby="gcp-heading" className="py-20 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-medium text-green-400 mb-4">
              <Globe className="h-3 w-3" aria-hidden="true" />
              Cloud Native
            </span>
            <h2 id="gcp-heading" className="text-3xl font-bold tracking-tight text-white mb-10">
              Built on Google Cloud
            </h2>

            <div
              className="flex flex-wrap justify-center gap-3"
              role="list"
              aria-label="Google Cloud services used"
            >
              {GCP_SERVICES.map((service) => (
                <span
                  key={service}
                  role="listitem"
                  className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.08] px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all cursor-default"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ ARCHITECTURE ═══════════════════════════ */}
        <section aria-labelledby="arch-heading" className="py-20 px-6 max-w-5xl mx-auto">
          <h2 id="arch-heading" className="text-2xl font-bold tracking-tight text-center text-white mb-12">
            Production-Grade Architecture
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {ARCHITECTURE_COLUMNS.map((col) => (
              <div
                key={col.title}
                className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-b ${col.gradient} pointer-events-none`} />
                <h3 className="relative font-semibold text-white mb-4">{col.title}</h3>
                <ul className="relative space-y-2.5" role="list">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-white/50">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════ CTA BANNER ═══════════════════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.3),transparent_70%)]" />
            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Stadium?
              </h2>
              <p className="text-blue-100/80 text-base mb-8 max-w-lg mx-auto">
                Experience 12 AI-powered features with intelligent fallbacks. Every feature works
                out of the box — no API keys required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/dashboard">
                  <Button className="h-12 px-8 text-base font-semibold bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/20">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/stadium">
                  <Button variant="outline" className="h-12 px-8 text-base font-semibold text-white border-white/30 hover:bg-white/10">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════ FOOTER ═════════════════════════════════ */}
      <footer role="contentinfo" className="border-t border-white/[0.04] py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-white">StadiumAI</span>
        </div>
        <p className="text-sm text-white/30">
          © {new Date().getFullYear()} StadiumAI — Smart Stadiums & Tournament Operations.
          Built with Next.js 15, React 19, Firebase & Google Gemini.
        </p>
      </footer>
    </div>
  );
}
