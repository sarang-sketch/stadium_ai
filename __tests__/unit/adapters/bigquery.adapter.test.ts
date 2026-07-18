import { describe, expect, it } from 'vitest';
import { MockBigQueryAdapter, createBigQueryAdapter } from '@/adapters/bigquery.adapter';

describe('BigQuery Adapter', () => {
  it('should return valid aggregates', async () => {
    const adapter = new MockBigQueryAdapter();
    const res = await adapter.queryTournamentAggregates('tournament-1');
    expect(res).toBeDefined();
    expect(res.totalTicketsSold).toBeDefined();
  });

  it('should have totalTicketsSold, totalRevenue > 0', async () => {
    const adapter = new MockBigQueryAdapter();
    const res = await adapter.queryTournamentAggregates('tournament-1');
    expect(res.totalTicketsSold).toBeGreaterThan(0);
    expect(res.totalRevenue).toBeGreaterThan(0);
  });

  it('should have entries in attendanceByMatch', async () => {
    const adapter = new MockBigQueryAdapter();
    const res = await adapter.queryTournamentAggregates('tournament-1');
    expect(res.attendanceByMatch.length).toBeGreaterThan(0);
  });

  it('should have deterministic behavior', async () => {
    const adapter = new MockBigQueryAdapter();
    const res1 = await adapter.queryTournamentAggregates('tournament-1');
    const res2 = await adapter.queryTournamentAggregates('tournament-1');
    expect(res1.totalTicketsSold).toBe(res2.totalTicketsSold);
  });

  it('createBigQueryAdapter returns a working adapter', async () => {
    const adapter = createBigQueryAdapter();
    const res = await adapter.queryTournamentAggregates('tournament-1');
    expect(res.totalTicketsSold).toBeGreaterThan(0);
  });
});
