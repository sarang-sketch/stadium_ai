import { BaseRepository } from './base.repository';
import { Ticket, PricingRule, FraudReview } from '@/types/ticket.types';

export class TicketRepository extends BaseRepository<Ticket> {
  constructor() {
    super('tickets');
  }
  
  async findTicketsByUser(userId: string): Promise<Ticket[]> {
    return this.findWhere('userId', '==', userId);
  }
  
  async findTicketsBySeat(seatId: string): Promise<Ticket[]> {
    return this.findWhere('seatId', '==', seatId);
  }
}

export class PricingRuleRepository extends BaseRepository<PricingRule> {
  constructor() {
    super('pricingRules');
  }
  
  async findPricingRulesByTournament(tournamentId: string): Promise<PricingRule[]> {
    return this.findWhere('tournamentId', '==', tournamentId);
  }
}

export class FraudReviewRepository extends BaseRepository<FraudReview> {
  constructor() {
    super('fraudReviews');
  }
  
  async findFlaggedReviews(): Promise<FraudReview[]> {
    return this.findWhere('status', '==', 'flagged');
  }
}
