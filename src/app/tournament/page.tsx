import dynamic from "next/dynamic";
import {
  Trophy,
  CalendarDays,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import type { MatchStatus } from "@/types/tournament.types";

/**
 * AI prediction panel is a decorative, animated visualization not needed
 * for first paint, so it's lazy-loaded with `next/dynamic`.
 */
const PredictionPanel = dynamic(
  () => import("./prediction-panel").then((mod) => mod.PredictionPanel),
  {
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-5" aria-hidden="true">
        <LoadingSkeleton variant="card" className="h-56" />
      </div>
    ),
  }
);

/** Demo tournament data. */
const TOURNAMENTS = [
  { id: "t1", name: "Summer Championship 2025", venue: "National Arena", startDate: "2025-07-15", endDate: "2025-08-10", teams: 16 },
  { id: "t2", name: "City Cup Invitational", venue: "Metro Stadium", startDate: "2025-09-01", endDate: "2025-09-15", teams: 8 },
  { id: "t3", name: "Youth League Finals", venue: "Sports Complex", startDate: "2025-10-05", endDate: "2025-10-20", teams: 12 },
];

/** Demo match fixtures. */
const MATCHES: Array<{
  id: string;
  teamA: string;
  teamB: string;
  time: string;
  venue: string;
  status: MatchStatus;
  scoreA?: number;
  scoreB?: number;
}> = [
  { id: "m1", teamA: "Phoenix FC", teamB: "Thunder United", time: "Jul 15, 3:00 PM", venue: "National Arena", status: "completed", scoreA: 3, scoreB: 1 },
  { id: "m2", teamA: "Storm City", teamB: "Valiant SC", time: "Jul 16, 5:00 PM", venue: "National Arena", status: "completed", scoreA: 2, scoreB: 2 },
  { id: "m3", teamA: "Phoenix FC", teamB: "Storm City", time: "Jul 20, 3:00 PM", venue: "National Arena", status: "scheduled" },
  { id: "m4", teamA: "Thunder United", teamB: "Valiant SC", time: "Jul 20, 7:00 PM", venue: "National Arena", status: "scheduled" },
  { id: "m5", teamA: "Apex Rangers", teamB: "Dynamo XI", time: "Jul 22, 3:00 PM", venue: "National Arena", status: "scheduled" },
];

/** Demo player stats. */
const TOP_PLAYERS = [
  { name: "Carlos Mendez", team: "Phoenix FC", goals: 7, assists: 3, minutes: 540, position: "Forward" },
  { name: "Yuki Tanaka", team: "Storm City", goals: 5, assists: 5, minutes: 630, position: "Midfielder" },
  { name: "Liam O'Brien", team: "Thunder United", goals: 4, assists: 2, minutes: 450, position: "Forward" },
  { name: "Ahmed Hassan", team: "Valiant SC", goals: 3, assists: 6, minutes: 580, position: "Midfielder" },
];

const statusColors: Record<MatchStatus, string> = {
  scheduled: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

/**
 * Tournament operations page with tournament listings, fixture brackets,
 * AI match predictions, and player statistics.
 *
 * Rendered as a Server Component — tournaments, fixtures, and player
 * stats are static display content with no handlers, so they render
 * directly on the server. Only the animated AI prediction panel is a
 * client island, and it's lazy-loaded since it's not needed for first
 * paint.
 */
export default function TournamentPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Tournament Operations"
        subtitle="AI-powered scheduling, predictions & player analytics"
        backHref="/dashboard"
      />

      <main id="main-content" role="main" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Tournaments */}
        <section aria-labelledby="tournaments-heading">
          <h2 id="tournaments-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-purple-500" aria-hidden="true" />
            Active Tournaments
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {TOURNAMENTS.map((t) => (
              <article key={t.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow" aria-label={t.name}>
                <h3 className="font-semibold mb-1">{t.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.venue}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" aria-hidden="true" />{t.startDate}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" aria-hidden="true" />{t.teams} teams</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Fixtures + AI Prediction */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Fixtures (static) */}
          <section aria-labelledby="fixtures-heading" className="lg:col-span-2">
            <h2 id="fixtures-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              Fixtures & Results
            </h2>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {MATCHES.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4" role="article" aria-label={`${match.teamA} vs ${match.teamB}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{match.teamA}</span>
                      {match.status === "completed" && <span className="text-lg font-bold">{match.scoreA}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{match.teamB}</span>
                      {match.status === "completed" && <span className="text-lg font-bold">{match.scoreB}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{match.time} · {match.venue}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[match.status]}`}>
                    {match.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* AI Match Prediction (lazy-loaded client island) */}
          <PredictionPanel />
        </div>

        {/* Player Stats (static) */}
        <section aria-labelledby="players-heading">
          <h2 id="players-heading" className="text-xl font-bold flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-teal-500" aria-hidden="true" />
            Top Players
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm" role="table" aria-label="Top player statistics">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className="text-left px-4 py-3 font-medium">Player</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Team</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Position</th>
                  <th scope="col" className="text-center px-4 py-3 font-medium">Goals</th>
                  <th scope="col" className="text-center px-4 py-3 font-medium">Assists</th>
                  <th scope="col" className="text-center px-4 py-3 font-medium">Minutes</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PLAYERS.map((player, idx) => (
                  <tr key={player.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold" aria-hidden="true">{idx + 1}</span>
                      {player.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{player.team}</td>
                    <td className="px-4 py-3 text-muted-foreground">{player.position}</td>
                    <td className="px-4 py-3 text-center font-semibold">{player.goals}</td>
                    <td className="px-4 py-3 text-center">{player.assists}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{player.minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Insights CTA */}
        <section className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center text-white">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-80" aria-hidden="true" />
          <h2 className="text-xl font-bold mb-2">Tournament Insights</h2>
          <p className="text-purple-100 text-sm mb-4">Gemini-powered post-match analysis, team comparisons, and trend reports.</p>
          <Button className="bg-white text-purple-600 hover:bg-purple-50">View Full Report</Button>
        </section>
      </main>
    </div>
  );
}
