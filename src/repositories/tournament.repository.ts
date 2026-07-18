import { BaseRepository } from './base.repository';
import { Tournament, Match, Registration, Player, PlayerStat } from '@/types/tournament.types';

export class TournamentRepository extends BaseRepository<Tournament> {
  constructor() {
    super('tournaments');
  }
}

export class MatchRepository extends BaseRepository<Match> {
  constructor() {
    super('matches');
  }
  
  async findMatchesByTournament(tournamentId: string): Promise<Match[]> {
    return this.findWhere('tournamentId', '==', tournamentId);
  }
}

export class RegistrationRepository extends BaseRepository<Registration> {
  constructor() {
    super('registrations');
  }
  
  async findRegistrationsByTournament(tournamentId: string): Promise<Registration[]> {
    return this.findWhere('tournamentId', '==', tournamentId);
  }
}

export class PlayerRepository extends BaseRepository<Player> {
  constructor() {
    super('players');
  }
  
  async findPlayersByRegistration(registrationId: string): Promise<Player[]> {
    return this.findWhere('registrationId', '==', registrationId);
  }
}

export class PlayerStatRepository extends BaseRepository<PlayerStat> {
  constructor() {
    super('playerStats');
  }
}
