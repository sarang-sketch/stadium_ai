import { describe, expect, it } from 'vitest';
import { PricingEngine, FraudDetectionService } from '@/services/ticketing.service';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';

describe('Ticketing Service', () => {
  it('PricingEngine calculates dynamic prices within bounds', async () => {
    const gemini = createGeminiAdapter();
    const svc = new PricingEngine(gemini);
    const rule = { id: 'rule-1', tournamentId: 'tourney-1', category: 'VIP', minPrice: 50, maxPrice: 200 };
    
    // Test base cases
    const res = await svc.calculatePrice(100, 0.85, 2, rule);
    expect(res.suggestedPrice).toBeGreaterThanOrEqual(rule.minPrice);
    expect(res.suggestedPrice).toBeLessThanOrEqual(rule.maxPrice);
    expect(res.source).toBeDefined();
  });

  it('FraudDetectionService scores transactions correctly', async () => {
    const gemini = createGeminiAdapter();
    const svc = new FraudDetectionService(gemini);
    
    const res = await svc.scoreTransaction('tx-1', {
      accountAgeDays: 0.5,
      purchasesLastHour: 8
    });
    
    expect(res.transactionId).toBe('tx-1');
    expect(res.riskScore).toBeGreaterThanOrEqual(0);
    expect(res.riskScore).toBeLessThanOrEqual(100);
    expect(res.indicators.length).toBeGreaterThan(0);
    expect(res.flagged).toBe(true);
  });
});
