import { z } from 'zod';

export const TournamentCreationSchema = z.object({
  name: z.string().min(3).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().min(2)
});

export const MatchCreationSchema = z.object({
  tournamentId: z.string().uuid(),
  teamA: z.string().min(2),
  teamB: z.string().min(2),
  scheduledTime: z.string().datetime(),
  venueId: z.string().uuid()
});

export const RegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user'])
});

export const TicketPurchaseSchema = z.object({
  matchId: z.string().uuid(),
  seatId: z.string(),
  pricePaid: z.number().positive(),
  paymentToken: z.string()
});

export const SeatRecommendationPrefSchema = z.object({
  budget: z.number().positive(),
  groupSize: z.number().min(1).max(20),
  preferences: z.array(z.string())
});

export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(500),
  targetLanguage: z.string().length(2).optional(),
  isAudio: z.boolean().optional()
});

/** Partial update for an existing tournament (admin PUT /api/tournament/[id]). */
export const TournamentUpdateSchema = z
  .object({
    name: z.string().min(3).max(100).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    location: z.string().min(2).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.'
  });

/** Round-robin fixture generation request (admin POST /api/tournament/[id]/matches). */
export const FixtureGenerationSchema = z.object({
  teams: z.array(z.string().min(1)).min(2),
  venues: z.array(z.string().min(1)).min(1),
  startDate: z.string().datetime()
});

/** Pricing-rule write (admin POST /api/tickets/pricing). */
export const PricingRuleSchema = z
  .object({
    tournamentId: z.string().min(1),
    category: z.string().min(1),
    minPrice: z.number().nonnegative(),
    maxPrice: z.number().positive()
  })
  .refine((data) => data.maxPrice >= data.minPrice, {
    message: 'maxPrice must be greater than or equal to minPrice.',
    path: ['maxPrice']
  });

/** Fraud risk scoring request (admin POST /api/tickets/fraud). */
export const FraudScoringSchema = z.object({
  transactionId: z.string().min(1),
  signals: z.record(z.string(), z.unknown())
});

/** Emergency evacuation route request (POST /api/stadium/emergency-route). */
export const EmergencyRouteSchema = z.object({
  zoneId: z.string().min(1),
  exitId: z.string().min(1),
  congestedZones: z.array(z.string().min(1)).optional()
});

export type TournamentCreationRequest = z.infer<typeof TournamentCreationSchema>;
export type MatchCreationRequest = z.infer<typeof MatchCreationSchema>;
export type RegistrationRequest = z.infer<typeof RegistrationSchema>;
export type TicketPurchaseRequest = z.infer<typeof TicketPurchaseSchema>;
export type SeatRecommendationPrefRequest = z.infer<typeof SeatRecommendationPrefSchema>;
export type ChatMessageRequest = z.infer<typeof ChatMessageSchema>;
export type TournamentUpdateRequest = z.infer<typeof TournamentUpdateSchema>;
export type FixtureGenerationRequest = z.infer<typeof FixtureGenerationSchema>;
export type PricingRuleRequest = z.infer<typeof PricingRuleSchema>;
export type FraudScoringRequest = z.infer<typeof FraudScoringSchema>;
export type EmergencyRouteRequest = z.infer<typeof EmergencyRouteSchema>;
