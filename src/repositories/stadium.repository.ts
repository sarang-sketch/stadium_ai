import { BaseRepository } from './base.repository';
import { Seat, SeatStatus } from '@/types/stadium.types';

export class StadiumRepository extends BaseRepository<Seat> {
  constructor() {
    super('seats');
  }

  async findSeatsByMatch(matchId: string): Promise<Seat[]> {
    return this.findWhere('matchId', '==', matchId);
  }

  async findAvailableSeats(matchId: string): Promise<Seat[]> {
    const seats = await this.findSeatsByMatch(matchId);
    return seats.filter(seat => seat.status === 'available');
  }

  async findSeatsByZone(matchId: string, zoneId: string): Promise<Seat[]> {
    const seats = await this.findSeatsByMatch(matchId);
    return seats.filter(seat => seat.zoneId === zoneId);
  }

  async updateSeatStatus(seatId: string, status: SeatStatus): Promise<void> {
    await this.update(seatId, { status });
  }
}
